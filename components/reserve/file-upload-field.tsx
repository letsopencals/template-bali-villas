'use client';

import { memo, useCallback, useId, useMemo, useRef, useState, type DragEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_SOFT } from '@/components/motion/easing';
import { fileRulesFor, type FileUploads, type UploadItem } from '@/hooks/use-file-upload';

interface FileUploadFieldProps {
	question: CheckoutQuestionResponse;
	uploads: FileUploads;
	/** id of the visible label, for aria-labelledby. */
	labelId: string;
}

const ROW_INITIAL = { opacity: 0, y: 6 };
const ROW_ANIMATE = { opacity: 1, y: 0 };
const ROW_EXIT = { opacity: 0, y: -4 };
const ROW_TRANSITION = { duration: 0.35, ease: EASE_SOFT };
const NO_TRANSITION = { duration: 0 };

function formatSize(bytes: number): string {
	if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Drop zone + file list for one `file-upload` question (type/size/count from its fileConfig). */
export function FileUploadField({ question, uploads, labelId }: FileUploadFieldProps) {
	const reduce = useReducedMotion();
	const inputId = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const replaceRef = useRef<string | null>(null);
	const [dragging, setDragging] = useState(false);
	const [rejections, setRejections] = useState<string[]>([]);

	const rules = useMemo(() => fileRulesFor(question), [question]);
	const items = uploads.uploads[question.id] ?? [];
	const full = items.length >= rules.maxFiles;

	const take = useCallback(
		(files: FileList | File[] | null) => {
			if (!files || files.length === 0) return;
			const replaceKey = replaceRef.current ?? undefined;
			replaceRef.current = null;
			setRejections(uploads.addFiles(question, files, replaceKey));
		},
		[uploads, question],
	);

	const openPicker = useCallback(
		(replaceKey: string | null = null) => {
			replaceRef.current = replaceKey;
			if (inputRef.current) {
				inputRef.current.multiple = replaceKey === null && rules.maxFiles > 1;
				inputRef.current.click();
			}
		},
		[rules.maxFiles],
	);

	const onDrop = useCallback(
		(e: DragEvent<HTMLButtonElement>) => {
			e.preventDefault();
			setDragging(false);
			replaceRef.current = null;
			take(e.dataTransfer.files);
		},
		[take],
	);

	return (
		<div className="flex flex-col gap-3">
			<input
				ref={inputRef}
				id={inputId}
				type="file"
				accept={rules.accept}
				className="sr-only"
				tabIndex={-1}
				aria-hidden
				onChange={(e) => {
					take(e.target.files);
					e.target.value = '';
				}}
			/>
			{full ? null : (
				<button
					type="button"
					aria-labelledby={labelId}
					aria-describedby={`${inputId}-hint`}
					onClick={() => openPicker(null)}
					onDragOver={(e) => {
						e.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={onDrop}
					className={clsx(
						'flex w-full flex-col items-center justify-center gap-1.5 rounded-[20px] border border-dashed px-5 py-6 text-center transition-colors duration-300',
						'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta',
						dragging ? 'border-terracotta bg-terracotta/[0.06]' : 'border-line-strong bg-cream hover:border-terracotta',
					)}
				>
					<span className="text-[0.92rem] font-medium text-ink">{items.length > 0 ? 'Add another file' : 'Choose a file or drop it here'}</span>
					<span id={`${inputId}-hint`} className="tabular text-[0.8rem] text-ink-muted">
						{rules.hint}
					</span>
				</button>
			)}
			<ul className="flex flex-col gap-2" aria-live="polite">
				<AnimatePresence initial={false}>
					{items.map((item) => (
						<motion.li
							key={item.key}
							initial={reduce ? false : ROW_INITIAL}
							animate={ROW_ANIMATE}
							exit={reduce ? undefined : ROW_EXIT}
							transition={reduce ? NO_TRANSITION : ROW_TRANSITION}
						>
							<UploadRow questionId={question.id} item={item} uploads={uploads} onReplace={openPicker} />
						</motion.li>
					))}
				</AnimatePresence>
			</ul>
			{rejections.length > 0 ? (
				<ul role="alert" className="flex flex-col gap-1 pl-5 text-[0.82rem] text-danger">
					{rejections.map((r) => (
						<li key={r}>{r}</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

interface UploadRowProps {
	questionId: string;
	item: UploadItem;
	uploads: FileUploads;
	onReplace(key: string): void;
}

const UploadRow = memo(function UploadRow({ questionId, item, uploads, onReplace }: UploadRowProps) {
	const pct = Math.round(item.progress * 100);
	return (
		<div className="relative overflow-hidden rounded-full border border-line bg-paper-deep px-5 py-2.5">
			{item.status === 'uploading' ? (
				<span aria-hidden className="absolute inset-y-0 left-0 bg-moss-soft transition-[width] duration-200" style={{ width: `${pct}%` }} />
			) : null}
			<div className="relative flex items-center gap-3 text-[0.88rem]">
				<span className="min-w-0 flex-1 truncate">{item.filename}</span>
				<span className={clsx('tabular shrink-0 text-[0.78rem]', item.status === 'error' ? 'text-danger' : 'text-ink-muted')}>
					{item.status === 'uploading' ? `${pct}%` : item.status === 'error' ? item.error : formatSize(item.size)}
				</span>
				{item.status === 'error' ? (
					<button type="button" onClick={() => uploads.retry(questionId, item.key)} className="shrink-0 font-medium text-terracotta-deep">
						Retry
					</button>
				) : null}
				{item.status === 'done' ? (
					<button type="button" onClick={() => onReplace(item.key)} className="shrink-0 text-ink-muted hover:text-ink">
						Replace
					</button>
				) : null}
				<button type="button" onClick={() => uploads.remove(questionId, item.key)} aria-label={`Remove ${item.filename}`} className="shrink-0 text-ink-muted hover:text-ink">
					{item.status === 'uploading' ? 'Cancel' : 'Remove'}
				</button>
			</div>
		</div>
	);
});
