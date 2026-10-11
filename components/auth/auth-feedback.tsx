import { clsx } from 'clsx';

/** Hairline message strip for auth and account forms. */
export function Notice({
	tone = 'error',
	children,
	className,
}: {
	tone?: 'error' | 'success' | 'info';
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			role={tone === 'error' ? 'alert' : 'status'}
			className={clsx(
				'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed',
				tone === 'error' && 'border-danger/30 bg-danger/[0.06] text-danger',
				tone === 'success' && 'border-[var(--color-terracotta)]/40 bg-[var(--color-sand)] text-[var(--color-ink)]',
				tone === 'info' && 'border-[var(--color-line-strong)] bg-[var(--color-sand)] text-[var(--color-ink-muted)]',
				className,
			)}
		>
			<span
				aria-hidden
				className={clsx(
					'mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full',
					tone === 'error' && 'bg-danger',
					tone === 'success' && 'bg-[var(--color-terracotta)]',
					tone === 'info' && 'bg-[var(--color-ink-dim)]',
				)}
			/>
			<div>{children}</div>
		</div>
	);
}

/** Thin terracotta ring spinner. */
export function Spinner({ className }: { className?: string }) {
	return (
		<span
			aria-hidden
			className={clsx(
				'inline-block h-8 w-8 animate-spin rounded-full border border-[var(--color-line-strong)] border-t-[var(--color-terracotta)]',
				className,
			)}
		/>
	);
}

/** Full-screen loading fallback for Suspense boundaries on auth pages. */
export function AuthFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)]">
			<Spinner />
		</div>
	);
}

/** Small uppercase field label matching the .label style. */
export const FIELD_LABEL = 'label mb-2.5 block';
/** Class to pass to `FormLabel` so it matches `FIELD_LABEL` (overrides its default colour). */
export const FORM_LABEL = 'label mb-0 block text-[var(--color-ink-muted)]';
