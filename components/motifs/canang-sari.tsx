import { clsx } from 'clsx';

export interface CanangSariProps {
	/** Pixel size (square). Default 64. */
	size?: number;
	/** Gentle rotation while loading (stops under reduced motion). */
	spinning?: boolean;
	className?: string;
	/** Accessible label; when set the motif is announced (e.g. "Loading"). */
	label?: string;
}

/** Petals in the four directions' colours: white, red, yellow, blue-black. */
const PETALS = [
	{ fill: 'var(--color-cream)', rotate: 0 },
	{ fill: 'var(--color-terracotta)', rotate: 90 },
	{ fill: 'var(--color-ochre)', rotate: 180 },
	{ fill: 'var(--color-jungle)', rotate: 270 },
];

/**
 * Canang sari offering basket for loading and empty states (DESIGN.md §5.5):
 * a square palm-leaf tray with petals in the four directions.
 */
export function CanangSari({ size = 64, spinning, className, label }: CanangSariProps) {
	return (
		<span
			role={label ? (spinning ? 'status' : 'img') : undefined}
			aria-label={label}
			aria-hidden={label ? undefined : true}
			className={clsx('inline-block', className)}
			style={{ width: size, height: size }}
		>
			<svg viewBox="0 0 64 64" className={clsx('h-full w-full', spinning && 'animate-canang-spin')}>
				{/* tray */}
				<rect x="10" y="10" width="44" height="44" rx="3" fill="var(--color-moss-soft)" stroke="var(--color-moss)" strokeWidth="1.2" />
				<path d="M10 20h44M10 44h44M20 10v44M44 10v44" stroke="var(--color-moss)" strokeWidth="0.6" opacity="0.6" />
				{PETALS.map((p) => (
					<g key={p.rotate} transform={`rotate(${p.rotate} 32 32)`}>
						<ellipse cx="32" cy="19" rx="6.5" ry="8" fill={p.fill} stroke="rgba(30,26,22,0.18)" strokeWidth="0.6" />
						<ellipse cx="25" cy="22" rx="3" ry="4" fill={p.fill} opacity="0.85" />
						<ellipse cx="39" cy="22" rx="3" ry="4" fill={p.fill} opacity="0.85" />
					</g>
				))}
				{/* centre: pandan and a small rice offering */}
				<circle cx="32" cy="32" r="5.5" fill="var(--color-moss)" />
				<circle cx="32" cy="32" r="2.2" fill="var(--color-cream)" />
			</svg>
		</span>
	);
}
