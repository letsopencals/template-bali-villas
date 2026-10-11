/**
 * Shared motion constants (DESIGN.md §6). Every motion component imports from
 * here so the site moves with one voice: long, decelerating eases, no bounce.
 */
/** expo: the signature ease (gate, curtain, reveals). */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
/** soft: small UI moves (panels, chips, cross-fades). */
export const EASE_SOFT = [0.33, 1, 0.68, 1] as const;
/** Alias kept so components ported from other templates keep working. */
export const EASE_OUT = EASE_EXPO;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
	fast: 0.5,
	base: 0.7,
	slow: 1.1,
	/** The candi bentar gate reveal. */
	gate: 1.4,
	/** The page curtain. */
	curtain: 0.6,
	/** Day/Dusk cross-fade. */
	crossfade: 0.9,
} as const;

/** Default viewport config for whileInView reveals: play once, slightly before fully in view. */
export const VIEWPORT_ONCE = { once: true, margin: '0px 0px -12% 0px' } as const;
