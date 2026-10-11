'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CheckRowProps {
	checked: boolean;
	onChange(checked: boolean): void;
	required?: boolean;
	children: ReactNode;
	className?: string;
}

/** A labelled checkbox row (consent, policies, checkbox questions). Native input, custom box. */
export function CheckRow({ checked, onChange, required, children, className }: CheckRowProps) {
	return (
		<label className={clsx('flex cursor-pointer items-start gap-3.5 text-[0.92rem] leading-relaxed text-ink', className)}>
			<input type="checkbox" checked={checked} required={required} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
			<span
				aria-hidden
				className={clsx(
					'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-200',
					'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-terracotta',
					checked ? 'border-terracotta bg-terracotta text-cream' : 'border-line-strong bg-cream',
				)}
			>
				{checked ? (
					<svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
						<path d="M3 8.5l3.2 3L13 4.5" />
					</svg>
				) : null}
			</span>
			<span>{children}</span>
		</label>
	);
}
