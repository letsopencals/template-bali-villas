import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** Selected / pressed state (sets aria-pressed). */
	selected?: boolean;
	size?: 'sm' | 'md';
	leading?: ReactNode;
	onDark?: boolean;
}

/** Pill toggle chip (filters, occasions, arrival windows). Terracotta when selected. */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
	{ selected = false, size = 'md', leading, onDark, className, children, type = 'button', ...props },
	ref,
) {
	return (
		<button
			ref={ref}
			type={type}
			aria-pressed={selected}
			className={clsx(
				'inline-flex items-center gap-2 rounded-full font-medium transition-[background-color,color,border-color] duration-200 ease-[cubic-bezier(0.33,1,0.68,1)] disabled:cursor-not-allowed disabled:opacity-45',
				size === 'sm' ? 'h-8 px-3.5 text-[0.8rem]' : 'h-10 px-4.5 text-[0.88rem]',
				selected
					? 'bg-terracotta text-cream'
					: onDark
						? 'border border-line-on-dark text-cream hover:border-cream/50'
						: 'bg-sand text-ink hover:bg-sand-strong',
				className,
			)}
			{...props}
		>
			{leading}
			{children}
		</button>
	);
});
