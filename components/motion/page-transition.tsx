'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { CandiBentar } from '@/components/motifs/candi-bentar';
import { DURATION, EASE_EXPO } from './easing';

const INITIAL = { opacity: 0, y: 14 } as const;
const ANIMATE = { opacity: 1, y: 0 } as const;
const TRANSITION = { duration: DURATION.base, ease: EASE_EXPO, delay: 0.15 } as const;

/**
 * Enter transition for every route, mounted by app/template.tsx (which Next
 * re-mounts on navigation): the candi bentar curtain (two jungle halves with
 * half-height towers) slides apart over 0.6s and the page rises in. Reduced
 * motion: `initial={false}` starts everything at its end state. The tree is the
 * same either way, because `useReducedMotion` is null on the server.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
	const reduce = useReducedMotion();
	return (
		<>
			<CandiBentar mode="curtain" />
			<motion.div data-page-transition initial={reduce ? false : INITIAL} animate={ANIMATE} transition={TRANSITION}>
				{children}
			</motion.div>
		</>
	);
}
