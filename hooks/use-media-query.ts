'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * `matchMedia` as state. `serverValue` is used on the server and during
 * hydration (default false), so the first client render matches the HTML.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
	const subscribe = useCallback(
		(cb: () => void) => {
			const mql = window.matchMedia(query);
			mql.addEventListener('change', cb);
			return () => mql.removeEventListener('change', cb);
		},
		[query],
	);
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => serverValue,
	);
}

/** Touch-first devices get bottom sheets instead of floating panels. */
export const COARSE_POINTER = '(pointer: coarse)';
