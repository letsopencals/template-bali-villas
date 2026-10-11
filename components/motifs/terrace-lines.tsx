import { clsx } from 'clsx';

export interface TerraceLinesProps {
	className?: string;
	/** Line colour. Default the paper hairline; use `onDark` on jungle. */
	onDark?: boolean;
	/** Number of contour lines. */
	lines?: number;
}

/**
 * Faint rice-terrace contour lines as a section background (DESIGN.md §5.3).
 * Absolutely positioned; give the parent `relative` (and `overflow-hidden`).
 */
export function TerraceLines({ className, onDark, lines = 14 }: TerraceLinesProps) {
	const paths = Array.from({ length: lines }, (_, i) => {
		const y = 40 + i * (520 / lines);
		const a = 18 + (i % 3) * 7;
		const b = 26 - (i % 4) * 5;
		return `M-20 ${y} C 180 ${y - a}, 330 ${y + b}, 520 ${y - a / 2} S 860 ${y + b}, 1220 ${y - a}`;
	});
	return (
		<svg
			aria-hidden
			viewBox="0 0 1200 600"
			preserveAspectRatio="xMidYMid slice"
			className={clsx('pointer-events-none absolute inset-0 h-full w-full', className)}
			fill="none"
			stroke={onDark ? 'var(--color-line-on-dark)' : 'var(--color-line)'}
			strokeWidth="1"
		>
			{paths.map((d) => (
				<path key={d} d={d} vectorEffect="non-scaling-stroke" />
			))}
		</svg>
	);
}
