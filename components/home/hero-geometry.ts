import type { HeroPinKeyframe } from '@/lib/site-config';

/** The box an `object-fit: cover` media of `aspect` (w/h) fills inside a `width`×`height` container. */
export interface CoverBox {
	left: number;
	top: number;
	width: number;
	height: number;
}

export function coverBox(containerW: number, containerH: number, aspect: number): CoverBox {
	if (containerW <= 0 || containerH <= 0 || !Number.isFinite(aspect) || aspect <= 0) {
		return { left: 0, top: 0, width: containerW, height: containerH };
	}
	const containerAspect = containerW / containerH;
	// Wider media than the container: height fits, sides are cropped. Otherwise width fits.
	const width = aspect > containerAspect ? containerH * aspect : containerW;
	const height = aspect > containerAspect ? containerH : containerW / aspect;
	return { left: (containerW - width) / 2, top: (containerH - height) / 2, width, height };
}

/** A media-space percentage point mapped to container pixels through the cover box. */
export function project(box: CoverBox, x: number, y: number): { x: number; y: number } {
	return { x: box.left + (x / 100) * box.width, y: box.top + (y / 100) * box.height };
}

/**
 * The pin's position at time `t`, linearly interpolated between keyframes, or
 * null outside its first..last keyframe span (the pin is hidden then).
 * Keyframes must be sorted by `t`.
 */
export function pinAt(keyframes: readonly HeroPinKeyframe[], t: number): { x: number; y: number } | null {
	if (keyframes.length === 0) return null;
	const first = keyframes[0]!;
	const last = keyframes[keyframes.length - 1]!;
	if (t < first.t || t > last.t) return null;
	for (let i = 0; i < keyframes.length - 1; i++) {
		const a = keyframes[i]!;
		const b = keyframes[i + 1]!;
		if (t >= a.t && t <= b.t) {
			const span = b.t - a.t;
			const k = span > 0 ? (t - a.t) / span : 0;
			return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
		}
	}
	return { x: last.x, y: last.y };
}
