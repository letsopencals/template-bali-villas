'use client';

import { memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import type { ReviewQuestion } from '@/components/account/trip-detail/review-types';
import { accountRequest } from '@/components/account/trip-detail/account-fetch';

const STARS = [1, 2, 3, 4, 5] as const;
const STAR_WORDS = ['', 'Disappointing', 'Could be better', 'Good', 'Lovely', 'Unforgettable'];

const StarRating = memo(function StarRating({ id, value, onChange, invalid }: { id: string; value: string; onChange(v: string): void; invalid: boolean }) {
	const n = Number(value) || 0;
	return (
		<div role="radiogroup" aria-labelledby={`${id}-label`} className="flex items-center gap-1 pl-3">
			{STARS.map((s) => (
				<button
					key={s}
					type="button"
					role="radio"
					aria-checked={n === s}
					aria-label={`${s} of 5`}
					onClick={() => onChange(String(s))}
					className={clsx('grid size-10 place-items-center rounded-full transition-colors hover:bg-sand', invalid && n === 0 && 'ring-1 ring-danger')}
				>
					<svg viewBox="0 0 24 24" className={clsx('size-6', s <= n ? 'fill-terracotta text-terracotta' : 'fill-none text-ink-dim')} stroke="currentColor" strokeWidth="1.5" aria-hidden>
						<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" strokeLinejoin="round" />
					</svg>
				</button>
			))}
			<span className="ml-2 text-sm text-ink-muted" aria-live="polite">
				{STAR_WORDS[n]}
			</span>
		</div>
	);
});

/**
 * Review of a past stay, built from the store's own feedback questions.
 * Ratings are sent as "1"–"5", checkboxes as "TRUE"/"FALSE".
 */
export function ReviewForm({ tripId, questions }: { tripId: string; questions: ReviewQuestion[] }) {
	const router = useRouter();
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const set = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }));
	const missing = questions.filter((q) => q.required && q.type !== 'checkbox' && !answers[q.id]?.trim());

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setTouched(true);
		if (missing.length > 0) return;
		const payload = questions
			.map((q) => ({
				questionId: q.id,
				question: q.title,
				answer: q.type === 'checkbox' ? (answers[q.id] === 'TRUE' ? 'TRUE' : 'FALSE') : (answers[q.id] ?? '').trim(),
			}))
			.filter((a) => a.answer !== '');
		if (payload.length === 0) {
			setError('Tell us a little about your stay first.');
			return;
		}
		setSaving(true);
		setError(null);
		try {
			await accountRequest(`/api/account/appointments/${encodeURIComponent(tripId)}/feedback`, 'POST', { answers: payload });
			router.refresh();
		} catch (err) {
			setSaving(false);
			setError(err instanceof Error ? err.message : 'Could not save your review.');
		}
	};

	return (
		<form onSubmit={submit} noValidate className="space-y-6">
			{questions.map((q) => {
				const id = `review-${q.id}`;
				const invalid = touched && missing.includes(q);
				const label = (
					<span id={`${id}-label`}>
						{q.title}
						{q.required ? <span className="text-terracotta"> *</span> : null}
					</span>
				);
				if (q.type === 'checkbox') {
					return (
						<label key={q.id} htmlFor={id} className="flex cursor-pointer items-start gap-3 pl-1 text-[0.95rem] text-ink">
							<input
								id={id}
								type="checkbox"
								checked={answers[q.id] === 'TRUE'}
								onChange={(e) => set(q.id, e.target.checked ? 'TRUE' : 'FALSE')}
								className="mt-1 size-4 accent-[var(--color-terracotta)]"
							/>
							<span>
								{q.title}
								{q.description ? <span className="block text-sm text-ink-muted">{q.description}</span> : null}
							</span>
						</label>
					);
				}
				const err = invalid ? 'Please answer this one.' : undefined;
				return (
					<Field key={q.id} label={label} htmlFor={q.type === 'rating' ? undefined : id} hint={q.description || undefined} error={err}>
						{q.type === 'rating' ? (
							<StarRating id={id} value={answers[q.id] ?? ''} onChange={(v) => set(q.id, v)} invalid={invalid} />
						) : q.type === 'multi-line-text-field' ? (
							<Textarea id={id} rows={4} maxLength={5000} value={answers[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)} invalid={invalid} />
						) : q.type === 'dropdown' ? (
							<Select id={id} value={answers[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)} invalid={invalid}>
								<option value="">Choose…</option>
								{q.options.map((o) => (
									<option key={o} value={o}>
										{o}
									</option>
								))}
							</Select>
						) : (
							<Input id={id} maxLength={500} value={answers[q.id] ?? ''} onChange={(e) => set(q.id, e.target.value)} invalid={invalid} />
						)}
					</Field>
				);
			})}
			{error ? (
				<p role="alert" className="rounded-[20px] bg-danger/10 p-4 text-sm text-danger">
					{error}
				</p>
			) : null}
			<Button type="submit" disabled={saving}>
				{saving ? 'Sending…' : 'Send review · Terima kasih'}
			</Button>
		</form>
	);
}
