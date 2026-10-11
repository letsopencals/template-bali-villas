'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { clsx } from 'clsx';

export interface TabItem<V extends string = string> {
	value: V;
	label: ReactNode;
	disabled?: boolean;
}

export interface TabsProps<V extends string = string> {
	items: readonly TabItem<V>[];
	value: V;
	onChange(value: V): void;
	'aria-label': string;
	/** `pill`: segmented sand control. `line`: underlined labels. */
	variant?: 'pill' | 'line';
	onDark?: boolean;
	className?: string;
	/** Prefix for tab/panel ids so panels can use `aria-labelledby={tabId(value)}`. */
	idPrefix?: string;
}

/** Tab id for `aria-labelledby` on a panel. */
export const tabId = (prefix: string, value: string) => `${prefix}-tab-${value}`;
export const tabPanelId = (prefix: string, value: string) => `${prefix}-panel-${value}`;

/**
 * Accessible tablist (arrow keys, Home/End). Renders only the tabs; render the
 * panel yourself with `role="tabpanel"` and `id={tabPanelId(prefix, value)}`.
 */
export function Tabs<V extends string = string>({ items, value, onChange, 'aria-label': ariaLabel, variant = 'pill', onDark, className, idPrefix }: TabsProps<V>) {
	const auto = useId();
	const prefix = idPrefix ?? auto;
	const listRef = useRef<HTMLDivElement>(null);
	const enabled = items.filter((i) => !i.disabled);

	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const idx = enabled.findIndex((i) => i.value === value);
		let next: number | null = null;
		if (e.key === 'ArrowRight') next = (idx + 1) % enabled.length;
		else if (e.key === 'ArrowLeft') next = (idx - 1 + enabled.length) % enabled.length;
		else if (e.key === 'Home') next = 0;
		else if (e.key === 'End') next = enabled.length - 1;
		if (next === null) return;
		e.preventDefault();
		const item = enabled[next];
		if (!item) return;
		onChange(item.value);
		listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(tabId(prefix, item.value))}`)?.focus();
	};

	return (
		<div
			ref={listRef}
			role="tablist"
			aria-label={ariaLabel}
			onKeyDown={onKeyDown}
			className={clsx(
				'inline-flex items-center',
				variant === 'pill' ? clsx('gap-1 rounded-full p-1', onDark ? 'bg-jungle-soft' : 'bg-sand') : 'gap-6 border-b',
				variant === 'line' && (onDark ? 'border-line-on-dark' : 'border-line'),
				className,
			)}
		>
			{items.map((item) => {
				const selected = item.value === value;
				return (
					<button
						key={item.value}
						id={tabId(prefix, item.value)}
						type="button"
						role="tab"
						aria-selected={selected}
						aria-controls={tabPanelId(prefix, item.value)}
						tabIndex={selected ? 0 : -1}
						disabled={item.disabled}
						onClick={() => onChange(item.value)}
						className={clsx(
							'whitespace-nowrap text-[0.88rem] font-medium transition-colors duration-200 disabled:opacity-40',
							variant === 'pill'
								? clsx('h-9 rounded-full px-4', selected ? (onDark ? 'bg-cream text-ink' : 'bg-cream text-ink shadow-sm') : onDark ? 'text-cream/75 hover:text-cream' : 'text-ink-muted hover:text-ink')
								: clsx('-mb-px border-b-2 pb-3', selected ? 'border-terracotta text-ink' : clsx('border-transparent', onDark ? 'text-cream/70 hover:text-cream' : 'text-ink-muted hover:text-ink')),
						)}
					>
						{item.label}
					</button>
				);
			})}
		</div>
	);
}
