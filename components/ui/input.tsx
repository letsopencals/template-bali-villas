import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

/**
 * Form fields: sand fill, pill inputs and selects, 20px-radius textareas,
 * terracotta focus ring. `invalid` paints the danger border and sets aria-invalid.
 */
const FIELD_BASE =
	'w-full border bg-sand text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-ink-dim focus:border-terracotta focus:bg-cream focus:ring-4 focus:ring-terracotta/12 disabled:cursor-not-allowed disabled:opacity-55';

function fieldBorder(invalid?: boolean) {
	return invalid ? 'border-danger' : 'border-transparent hover:border-line-strong';
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, ...props }, ref) {
	return (
		<input
			ref={ref}
			aria-invalid={invalid || undefined}
			className={clsx(FIELD_BASE, fieldBorder(invalid), 'h-12 rounded-full px-5', className)}
			{...props}
		/>
	);
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, invalid, rows = 4, ...props }, ref) {
	return (
		<textarea
			ref={ref}
			rows={rows}
			aria-invalid={invalid || undefined}
			className={clsx(FIELD_BASE, fieldBorder(invalid), 'rounded-[20px] px-5 py-3.5 leading-relaxed', className)}
			{...props}
		/>
	);
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	invalid?: boolean;
}

/**
 * Native select styled as a pill. Use it on `pointer-coarse:` (phones) and in
 * forms; desktop pickers use the branded `Listbox`.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, invalid, children, ...props }, ref) {
	return (
		<span className={clsx('relative block', className)}>
			<select
				ref={ref}
				aria-invalid={invalid || undefined}
				className={clsx(FIELD_BASE, fieldBorder(invalid), 'h-12 cursor-pointer appearance-none rounded-full pl-5 pr-11')}
				{...props}
			>
				{children}
			</select>
			<svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute right-5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="1.4">
				<path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		</span>
	);
});

export interface FieldProps {
	label: ReactNode;
	htmlFor?: string;
	hint?: ReactNode;
	error?: ReactNode;
	className?: string;
	children: ReactNode;
}

/** Label + control + hint/error, stacked. */
export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
	return (
		<div className={clsx('flex flex-col gap-2', className)}>
			<label htmlFor={htmlFor} className="label pl-5">
				{label}
			</label>
			{children}
			{error ? (
				<p role="alert" className="pl-5 text-[0.82rem] text-danger">
					{error}
				</p>
			) : hint ? (
				<p className="pl-5 text-[0.82rem] text-ink-muted">{hint}</p>
			) : null}
		</div>
	);
}
