/**
 * Where each villa sits in the masterplan stills (`/images/masterplan/masterplan-16x9.jpg`
 * and `-9x16.jpg`), in percent of the image (before object-cover cropping).
 * Measured by hand from the renders. Used for the hero's still fallback (no
 * video) and for the interactive site map. Re-measure if the stills change.
 */
export type StillPinPosition = { x: number; y: number };

export const STILL_PINS_16X9: Readonly<Record<string, StillPinPosition>> = {
	'lumbung-padi': { x: 33, y: 49 },
	'lumbung-kembar': { x: 43, y: 40 },
	'joglo-jati': { x: 57, y: 43 },
	'joglo-agung': { x: 59, y: 30 },
	'griya-kopi': { x: 75, y: 33 },
	'rumah-batu': { x: 87, y: 52 },
	'bale-air': { x: 72, y: 61 },
	'rumah-sawah': { x: 53, y: 70 },
	'pondok-bambu': { x: 17, y: 60 },
	'puri-sidemen': { x: 28, y: 78 },
};

export const STILL_PINS_9X16: Readonly<Record<string, StillPinPosition>> = {
	'lumbung-padi': { x: 46, y: 51 },
	'lumbung-kembar': { x: 38, y: 40 },
	'joglo-jati': { x: 59, y: 40 },
	'joglo-agung': { x: 65, y: 29 },
	'griya-kopi': { x: 86, y: 30 },
	'rumah-batu': { x: 84, y: 52 },
	'bale-air': { x: 82, y: 70 },
	'rumah-sawah': { x: 52, y: 66 },
	'pondok-bambu': { x: 25, y: 64 },
	'puri-sidemen': { x: 52, y: 85 },
};

/** Intrinsic aspect ratios (width / height) of the two stills. */
export const STILL_ASPECT = { landscape: 16 / 9, portrait: 9 / 16 } as const;
