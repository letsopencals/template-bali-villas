import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/** primary = terracotta (one per surface), secondary = jungle, outline, ghost, glass (over photos/video). */
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	/** Pill shape (the default). `pill={false}` gives a 16px-radius rectangle for dense forms. */
	pill?: boolean;
	/** Use on jungle sections: outline/ghost switch to cream text and dark-mode hairlines. */
	onDark?: boolean;
}

const BASE =
	'group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-sans font-semibold tracking-[0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100';

const VARIANTS: Record<ButtonVariant, string> = {
	primary: 'bg-terracotta text-cream hover:bg-terracotta-bright active:bg-terracotta-deep',
	secondary: 'bg-jungle text-cream hover:bg-jungle-soft active:bg-jungle-deep',
	outline: 'border border-line-strong bg-transparent text-ink hover:border-ink hover:bg-ink/[0.03]',
	ghost: 'bg-transparent text-ink hover:bg-ink/[0.05]',
	glass: 'bg-cream/75 text-ink backdrop-blur-xl ring-1 ring-cream/40 hover:bg-cream/90',
};

const ON_DARK: Partial<Record<ButtonVariant, string>> = {
	outline: 'border-line-on-dark text-cream hover:border-cream hover:bg-cream/[0.06]',
	ghost: 'text-cream hover:bg-cream/[0.08]',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'h-9 px-4 text-[0.8rem]',
	md: 'h-11 px-6 text-[0.9rem]',
	lg: 'h-14 px-8 text-[0.98rem]',
};

interface ClassOptions {
	fullWidth?: boolean;
	pill?: boolean;
	onDark?: boolean;
	className?: string;
}

/**
 * Class string for anything that should look like a Button, e.g. `next/link`:
 * `<Link href="/villas" className={buttonClasses('primary', 'lg')}>See the villas</Link>`
 */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', opts: ClassOptions = {}): string {
	const { fullWidth, pill = true, onDark, className } = opts;
	return clsx(
		BASE,
		VARIANTS[variant],
		onDark && ON_DARK[variant],
		SIZES[size],
		pill ? 'rounded-full' : 'rounded-2xl',
		fullWidth && 'w-full',
		className,
	);
}

/** Lumbung button: pill, Figtree semibold, terracotta for the one primary action on a surface. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'primary', size = 'md', fullWidth, pill = true, onDark, className, type = 'button', ...props },
	ref,
) {
	return <button ref={ref} type={type} className={buttonClasses(variant, size, { fullWidth, pill, onDark, className })} {...props} />;
});
