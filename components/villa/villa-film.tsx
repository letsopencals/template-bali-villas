'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { SafeImage } from '@/components/ui/safe-image';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';

const VALLEY_FILM = '/videos/valley-morning.mp4';
const KEN_BURNS = { scale: [1.04, 1.14], x: ['0%', '-3%'], y: ['0%', '-2%'] };
const KEN_BURNS_T: Transition = { duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'mirror' };
const STILL = { scale: 1, x: '0%', y: '0%' };
const STILL_T: Transition = { duration: 0 };

export interface VillaFilmProps {
	title: string;
	/** Optional villa clip (VillaContent.video). None ship today, so the valley film plays. */
	video?: string;
	/** Exterior (or dusk) photo: sits behind the video and is the Ken Burns fallback. */
	still: string | null;
}

/**
 * Short muted loop (the valley film unless the villa has its own clip). It plays while in view and pauses outside;
 * the button toggles it. If the file is missing, the exterior photo drifts
 * (Ken Burns) instead. Reduced motion: paused on the poster, still photo.
 */
export function VillaFilm({ title, video: own, still }: VillaFilmProps) {
	// No per-villa clips ship (cut for cost): the valley film plays instead.
	const video = own ?? VALLEY_FILM;
	const general = !own;
	const ref = useRef<HTMLVideoElement>(null);
	const reduce = useReducedMotion();
	const [failed, setFailed] = useState(false);
	const [playing, setPlaying] = useState(false);
	const [userPaused, setUserPaused] = useState(false);
	const poster = video.replace(/\.mp4$/, '.jpg');

	useEffect(() => {
		const el = ref.current;
		if (!el || failed || reduce || userPaused) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) el.play().catch(() => {});
				else el.pause();
			},
			{ threshold: 0.35 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [failed, reduce, userPaused]);

	const toggle = () => {
		const el = ref.current;
		if (!el) return;
		if (el.paused) {
			setUserPaused(false);
			el.play().catch(() => {});
		} else {
			setUserPaused(true);
			el.pause();
		}
	};

	return (
		<section aria-label={`A short film of ${title}`} className="image-placeholder relative aspect-[16/10] overflow-hidden rounded-[24px] md:aspect-[21/9]">
			<motion.div className="absolute inset-0" animate={failed && !reduce ? KEN_BURNS : STILL} transition={failed && !reduce ? KEN_BURNS_T : STILL_T}>
				<SafeImage src={still} alt="" aria-hidden fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
			</motion.div>
			{!failed ? (
				<video
					ref={ref}
					src={video}
					poster={poster}
					muted
					loop
					playsInline
					preload="metadata"
					aria-label={general ? 'Morning mist over the Sidemen valley' : `${title}, filmed on the terraces`}
					onError={() => setFailed(true)}
					onPlay={() => setPlaying(true)}
					onPause={() => setPlaying(false)}
					className="absolute inset-0 h-full w-full object-cover"
				/>
			) : null}
			<div aria-hidden className="scrim-bottom absolute inset-x-0 bottom-0 h-1/2" />
			<div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-8">
				<div className="text-cream">
					<p className="label on-dark">{general && !failed ? 'The valley' : title}</p>
					<p className="display-sm mt-2">{general && !failed ? 'Mornings in the Sidemen valley' : general ? 'Light on the terraces' : `An afternoon at ${title}`}</p>
				</div>
				{!failed ? (
					<button
						type="button"
						onClick={toggle}
						aria-label={playing ? 'Pause film' : 'Play film'}
						className="glass grid h-12 w-12 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-cream"
					>
						{playing ? (
							<svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
								<rect x="3.5" y="2.5" width="3" height="11" rx="1" />
								<rect x="9.5" y="2.5" width="3" height="11" rx="1" />
							</svg>
						) : (
							<svg aria-hidden viewBox="0 0 16 16" className="ml-0.5 h-4 w-4" fill="currentColor">
								<path d="M4 2.6v10.8a.6.6 0 0 0 .9.5l8.6-5.4a.6.6 0 0 0 0-1L4.9 2.1a.6.6 0 0 0-.9.5z" />
							</svg>
						)}
					</button>
				) : null}
			</div>
		</section>
	);
}
