import { useId } from 'react';
import { clsx } from 'clsx';

export interface IkatRuleProps {
	className?: string;
	/** Default terracotta at 40%. `cream` for jungle sections. */
	tone?: 'terracotta' | 'cream';
}

/** 12px repeating ikat/songket diamond line, a section divider (DESIGN.md §5.4). */
export function IkatRule({ className, tone = 'terracotta' }: IkatRuleProps) {
	const id = useId().replace(/:/g, '');
	const color = tone === 'cream' ? 'var(--color-cream)' : 'var(--color-terracotta)';
	return (
		<svg aria-hidden role="presentation" className={clsx('block h-3 w-full opacity-40', className)} preserveAspectRatio="none">
			<defs>
				<pattern id={`ikat-${id}`} width="24" height="12" patternUnits="userSpaceOnUse">
					<path d="M0 6 6 0l6 6-6 6Z M12 6l6-6 6 6-6 6Z" fill="none" stroke={color} strokeWidth="1" />
					<path d="M6 4.2 7.8 6 6 7.8 4.2 6Z" fill={color} />
					<path d="M18 4.2 19.8 6 18 7.8 16.2 6Z" fill={color} />
				</pattern>
			</defs>
			<rect width="100%" height="12" fill={`url(#ikat-${id})`} />
		</svg>
	);
}
