import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export interface AccordionItemProps {
	question: ReactNode;
	children: ReactNode;
	defaultOpen?: boolean;
	id?: string;
}

/**
 * Disclosure row built on native <details>/<summary>: keyboard and screen-reader
 * friendly, works without JavaScript and keeps the answer in the HTML for search.
 */
export function AccordionItem({ question, children, defaultOpen, id }: AccordionItemProps) {
	return (
		<details id={id} open={defaultOpen} className="group border-b border-line [&_summary::-webkit-details-marker]:hidden">
			<summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-4 focus-visible:ring-offset-paper">
				<span className="font-display text-[1.25rem] font-normal leading-snug text-ink transition-colors group-hover:text-terracotta-deep md:text-[1.4rem]">{question}</span>
				<span aria-hidden className="relative mt-2 h-4 w-4 shrink-0 text-terracotta">
					<span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-current" />
					<span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-current transition-transform duration-300 group-open:scale-y-0" />
				</span>
			</summary>
			<div className="max-w-2xl pb-7 pr-10 text-[1rem] leading-relaxed text-ink-muted">{children}</div>
		</details>
	);
}

export function Accordion({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={clsx('border-t border-line', className)}>{children}</div>;
}
