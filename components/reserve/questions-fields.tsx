'use client';

import { memo, useCallback, useId, useMemo } from 'react';
import { clsx } from 'clsx';
import type { CheckoutQuestionResponse } from '@opencals/storefront-sdk';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { questionTitle } from '@/hooks/use-checkout-questions';
import type { FileUploads } from '@/hooks/use-file-upload';
import { FileUploadField } from './file-upload-field';
import { CheckRow } from './check-row';

interface QuestionFieldProps {
	question: CheckoutQuestionResponse;
	value: string;
	onChange(id: string, value: string): void;
	uploads: FileUploads;
}

const RATINGS = [1, 2, 3, 4, 5] as const;

const QuestionField = memo(function QuestionField({ question: q, value, onChange, uploads }: QuestionFieldProps) {
	const labelId = useId();
	const fieldId = useId();
	const translation = q.translations?.[0];
	const title = questionTitle(q);
	const description = translation?.description || undefined;
	const options = translation?.options;
	const label = (
		<span id={labelId}>
			{title}
			{q.required ? <span className="text-terracotta"> *</span> : <span className="normal-case tracking-normal text-ink-dim"> (optional)</span>}
		</span>
	);

	if (q.type === 'checkbox') {
		return (
			<CheckRow checked={value === 'true'} onChange={(c) => onChange(q.id, c ? 'true' : 'false')} required={q.required}>
				{title}
				{q.required ? <span className="text-terracotta"> *</span> : null}
				{description ? <span className="mt-1 block text-ink-muted">{description}</span> : null}
			</CheckRow>
		);
	}

	if (q.type === 'file-upload') {
		return (
			<Field label={label} hint={description}>
				<FileUploadField question={q} uploads={uploads} labelId={labelId} />
			</Field>
		);
	}

	if (q.type === 'rating') {
		return (
			<Field label={label} hint={description}>
				<div role="radiogroup" aria-labelledby={labelId} className="flex gap-2 pl-1">
					{RATINGS.map((n) => {
						const active = value === String(n);
						return (
							<button
								key={n}
								type="button"
								role="radio"
								aria-checked={active}
								onClick={() => onChange(q.id, String(n))}
								className={clsx(
									'tabular h-10 w-10 rounded-full border text-[0.9rem] transition-colors',
									active ? 'border-terracotta bg-terracotta text-cream' : 'border-line-strong hover:border-terracotta',
								)}
							>
								{n}
							</button>
						);
					})}
				</div>
			</Field>
		);
	}

	return (
		<Field label={label} htmlFor={fieldId} hint={description}>
			{q.type === 'dropdown' && options ? (
				<Select id={fieldId} required={q.required} value={value} onChange={(e) => onChange(q.id, e.target.value)}>
					<option value="">Choose…</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</Select>
			) : q.type === 'multi-line-text-field' ? (
				<Textarea id={fieldId} required={q.required} value={value} onChange={(e) => onChange(q.id, e.target.value)} rows={3} />
			) : (
				<Input id={fieldId} type="text" required={q.required} value={value} onChange={(e) => onChange(q.id, e.target.value)} />
			)}
		</Field>
	);
});

interface QuestionsFieldsProps {
	questions: CheckoutQuestionResponse[];
	answers: Record<string, string>;
	setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	uploads: FileUploads;
}

/** The store's checkout questions (special requests, dietary needs, ...), in their set order. */
export function QuestionsFields({ questions, answers, setAnswers, uploads }: QuestionsFieldsProps) {
	const sorted = useMemo(() => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [questions]);
	const onChange = useCallback((id: string, v: string) => setAnswers((prev) => ({ ...prev, [id]: v })), [setAnswers]);
	if (sorted.length === 0) return null;
	return (
		<div className="flex flex-col gap-6">
			{sorted.map((q) => (
				<QuestionField key={q.id} question={q} value={answers[q.id] ?? ''} onChange={onChange} uploads={uploads} />
			))}
		</div>
	);
}
