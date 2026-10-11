'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';

interface RoomHighlightValue {
	/** Room key hovered on the floor plan (or the tour card in view). */
	active: string | null;
	setActive(key: string | null): void;
	/** Scroll the page to the tour and the tour to the room. */
	goTo(key: string): void;
}

const RoomHighlightContext = createContext<RoomHighlightValue | null>(null);

export const roomAnchorId = (key: string) => `room-${key}`;
export const ROOM_TOUR_ID = 'room-by-room';

/** Links the floor plan to the room tour: hover highlights, click scrolls. */
export function RoomHighlightProvider({ children }: { children: ReactNode }) {
	const [active, setActive] = useState<string | null>(null);
	const lenis = useSmoothScroll();

	const goTo = useCallback(
		(key: string) => {
			setActive(key);
			const section = document.getElementById(ROOM_TOUR_ID);
			const card = document.getElementById(roomAnchorId(key));
			const reveal = () => card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
			if (!section) return reveal();
			if (lenis) lenis.scrollTo(section, { offset: -96, onComplete: reveal });
			else {
				section.scrollIntoView({ behavior: 'smooth', block: 'start' });
				window.setTimeout(reveal, 500);
			}
		},
		[lenis],
	);

	const value = useMemo(() => ({ active, setActive, goTo }), [active, goTo]);
	return <RoomHighlightContext.Provider value={value}>{children}</RoomHighlightContext.Provider>;
}

const NOOP: RoomHighlightValue = { active: null, setActive: () => {}, goTo: () => {} };

export function useRoomHighlight(): RoomHighlightValue {
	return useContext(RoomHighlightContext) ?? NOOP;
}
