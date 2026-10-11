'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_EXPO } from '@/components/motion/easing';
import { useMediaQuery } from '@/hooks/use-media-query';
import { CandiBentar } from '@/components/motifs/candi-bentar';
import { SafeImage } from '@/components/ui/safe-image';
import { formatStayPrice } from '@/components/ui/price-tag';
import { SidemenNow } from '@/components/layout/sidemen-now';
import { siteConfig, type HeroPin, type HeroPinKeyframe } from '@/lib/site-config';
import { HeroSearch } from '@/components/home/hero-search';
import { coverBox, pinAt, project } from '@/components/home/hero-geometry';
import { STILL_ASPECT, STILL_PINS_16X9, STILL_PINS_9X16 } from '@/components/home/hero-still-pins';

/** The villa fields a hero pin shows. */
export interface HeroPinVilla {
	slug: string;
	title: string;
	price: number;
	currency: string;
}

type Orientation = 'landscape' | 'portrait';
type LoadStatus = 'loading' | 'ok' | 'failed';
/** What is on screen: the playing/paused video, its poster frame, or the masterplan still. */
type Mode = 'video' | 'poster' | 'still';

const PORTRAIT_QUERY = '(orientation: portrait)';
const MEDIA = {
	landscape: { video: '/videos/hero.mp4', poster: '/videos/hero.jpg', still: '/images/masterplan/masterplan-16x9.jpg', aspect: STILL_ASPECT.landscape },
	portrait: { video: '/videos/hero-mobile.mp4', poster: '/videos/hero-mobile.jpg', still: '/images/masterplan/masterplan-9x16.jpg', aspect: STILL_ASPECT.portrait },
} as const;

/** Keyframed pins per orientation, keyframes sorted by time. */
const KEYFRAMES: Record<Orientation, ReadonlyMap<string, readonly HeroPinKeyframe[]>> = {
	landscape: toKeyframeMap(siteConfig.heroPins),
	portrait: toKeyframeMap(siteConfig.heroPinsMobile),
};
const STILL_PINS = { landscape: STILL_PINS_16X9, portrait: STILL_PINS_9X16 } as const;

function toKeyframeMap(pins: readonly HeroPin[]): ReadonlyMap<string, readonly HeroPinKeyframe[]> {
	return new Map(pins.map((p) => [p.slug, [...p.keyframes].sort((a, b) => a.t - b.t)]));
}

const CAPTIONS = siteConfig.heroCaptions;
/** The still/poster "virtual clock" loops a little after the last caption. */
const CAPTION_LOOP = Math.max(...CAPTIONS.map((c) => c.to), 1) + 0.8;
/** Ken Burns on the still: up to +7% over a 36 s breath, origin slightly above centre. */
const KB_AMOUNT = 0.07;
const KB_PERIOD = 36;
const KB_ORIGIN = { x: 0.5, y: 0.45 };
/** Keep pins this far inside the hero edges, and this far clear of the text blocks. */
const EDGE = 18;
const CLEAR = 14;

const RULE_FROM = { scaleX: 0 } as const;
const RULE_TO = { scaleX: 1 } as const;
const RULE_TRANSITION: Transition = { duration: 0.7, ease: EASE_EXPO };
const CAPTION_FROM = { opacity: 0, x: -18 } as const;
const CAPTION_TO = { opacity: 1, x: 0 } as const;
const CAPTION_EXIT = { opacity: 0, x: 14 } as const;
const CAPTION_TRANSITION: Transition = { duration: 0.8, ease: EASE_EXPO, delay: 0.15 };
const CUE_ANIMATE = { y: [0, 14, 0], opacity: [1, 0.25, 1] };
const CUE_TRANSITION: Transition = { duration: 2.4, ease: 'easeInOut', repeat: Infinity };

/**
 * The home hero (DESIGN.md §9): the flyover video with villa pins that drift
 * with it and timed captions, the candi bentar gate on first visit, the
 * Lumbung wordmark, the glass search capsule and the "In Sidemen now" strip.
 *
 * Media fallbacks, per orientation (portrait gets `hero-mobile.*`):
 * video → its `.jpg` poster (static pins at each pin's first keyframe) →
 * the masterplan still with a slow Ken Burns and the measured still pins.
 * Reduced motion: no gate, the video stays on its first frame, pins are static.
 *
 * One requestAnimationFrame loop drives the pins, the Ken Burns and the
 * caption clock, writing transforms straight to the DOM (no React re-render
 * per frame). It only runs while the hero is on screen.
 */
export function HeroFlyover({ villas }: { villas: HeroPinVilla[] }) {
	const reduce = useReducedMotion();
	const orientation: Orientation = useMediaQuery(PORTRAIT_QUERY) ? 'portrait' : 'landscape';
	const [mounted, setMounted] = useState(false);
	const [videoStatus, setVideoStatus] = useState<Record<Orientation, LoadStatus>>({ landscape: 'loading', portrait: 'loading' });
	const [posterStatus, setPosterStatus] = useState<Record<Orientation, LoadStatus>>({ landscape: 'loading', portrait: 'loading' });
	const [gateOpen, setGateOpen] = useState(false);
	const [inView, setInView] = useState(true);
	const [userPaused, setUserPaused] = useState(false);
	const [muted, setMuted] = useState(true);
	const [captionIdx, setCaptionIdx] = useState(-1);

	const heroRef = useRef<HTMLElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const stillRef = useRef<HTMLDivElement>(null);
	const wordmarkRef = useRef<HTMLDivElement>(null);
	const searchRef = useRef<HTMLDivElement>(null);
	const barRef = useRef<HTMLDivElement>(null);
	const captionRef = useRef<HTMLDivElement>(null);
	const pinRefs = useRef(new Map<string, HTMLAnchorElement>());
	const posterAspect = useRef<Record<Orientation, number | null>>({ landscape: null, portrait: null });
	const pausedRef = useRef(false);

	const mode: Mode = videoStatus[orientation] === 'ok' ? 'video' : posterStatus[orientation] === 'ok' ? 'poster' : 'still';
	const hasVideo = mode === 'video';

	useEffect(() => setMounted(true), []);
	useEffect(() => {
		pausedRef.current = userPaused;
	}, [userPaused]);

	// Run the loop (and the video) only while the hero is visible.
	useEffect(() => {
		const el = heroRef.current;
		if (!el) return;
		const io = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true), { threshold: 0.02 });
		io.observe(el);
		return () => io.disconnect();
	}, []);

	// Playback: start once the gate has opened; never under reduced motion.
	useEffect(() => {
		const v = videoRef.current;
		if (!v || !hasVideo) return;
		if (reduce) {
			v.pause();
			return;
		}
		if (gateOpen && inView && !userPaused) {
			v.play().catch(() => setUserPaused(true));
		} else {
			v.pause();
		}
	}, [hasVideo, reduce, gateOpen, inView, userPaused]);

	useEffect(() => {
		if (videoRef.current) videoRef.current.muted = muted;
	}, [muted, hasVideo]);

	// The pin / Ken Burns / caption loop.
	useEffect(() => {
		const hero = heroRef.current;
		if (!hero) return;
		const keyframes = KEYFRAMES[orientation];
		const still = STILL_PINS[orientation];
		const fallbackAspect = MEDIA[orientation].aspect;
		let raf = 0;
		let last = performance.now();
		let clock = 0; // caption clock (still/poster), loops
		let kbClock = 0; // Ken Burns clock, never loops
		let lastCaption = -2;
		// Media time of the frame on screen. currentTime can run a frame ahead of or behind
		// the painted frame, which shows up as pin jitter; rVFC reports the presented frame.
		let frameTime: number | null = null;
		let vfc = 0;
		const vfcVideo = mode === 'video' ? videoRef.current : null;
		const onFrame = (_now: number, meta: { mediaTime: number }) => {
			frameTime = meta.mediaTime;
			if (vfcVideo) vfc = vfcVideo.requestVideoFrameCallback(onFrame);
		};
		if (vfcVideo && 'requestVideoFrameCallback' in vfcVideo) vfc = vfcVideo.requestVideoFrameCallback(onFrame);

		const exclusion = (): DOMRect[] =>
			[wordmarkRef.current, searchRef.current, barRef.current, captionRef.current]
				.filter((el): el is HTMLDivElement => el !== null)
				.map((el) => el.getBoundingClientRect());

		const update = (now: number) => {
			const dt = Math.min(0.1, (now - last) / 1000);
			last = now;
			const running = !reduce && !pausedRef.current && gateOpen;
			if (running) {
				clock = (clock + dt) % CAPTION_LOOP;
				kbClock += dt;
			}

			const W = hero.clientWidth;
			const H = hero.clientHeight;
			const heroRect = hero.getBoundingClientRect();
			const blocks = exclusion();
			const video = videoRef.current;
			const t = mode === 'video' && video ? (video.paused || video.seeking || frameTime === null ? video.currentTime : frameTime) : clock;

			// Ken Burns (still only).
			const kb = mode === 'still' && !reduce ? 1 + KB_AMOUNT * (0.5 - 0.5 * Math.cos((2 * Math.PI * kbClock) / KB_PERIOD)) : 1;
			if (stillRef.current) stillRef.current.style.transform = `scale(${kb.toFixed(5)})`;

			const aspect =
				mode === 'video' && video && video.videoWidth > 0
					? video.videoWidth / video.videoHeight
					: mode === 'poster'
						? (posterAspect.current[orientation] ?? fallbackAspect)
						: fallbackAspect;
			const box = coverBox(W, H, aspect);

			for (const [slug, el] of pinRefs.current) {
				let pos: { x: number; y: number } | null = null;
				if (mode === 'still') {
					pos = still[slug] ?? null;
				} else {
					const kf = keyframes.get(slug);
					if (kf && kf.length > 0) pos = mode === 'poster' || reduce ? kf[0]! : pinAt(kf, t);
				}
				let visible = false;
				if (pos) {
					let p = project(box, pos.x, pos.y);
					if (kb !== 1) p = { x: KB_ORIGIN.x * W + (p.x - KB_ORIGIN.x * W) * kb, y: KB_ORIGIN.y * H + (p.y - KB_ORIGIN.y * H) * kb };
					const px = heroRect.left + p.x;
					const py = heroRect.top + p.y;
					const blocked = blocks.some((r) => px > r.left - CLEAR && px < r.right + CLEAR && py > r.top - CLEAR && py < r.bottom + CLEAR);
					visible = gateOpen && !blocked && p.x > EDGE && p.x < W - EDGE && p.y > 84 && p.y < H - EDGE;
					el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
					el.dataset.side = p.x > W * 0.66 ? 'left' : 'right';
				}
				const on = visible ? 'true' : 'false';
				if (el.dataset.on !== on) {
					el.dataset.on = on;
					el.inert = !visible;
				}
			}

			// Captions: video time, or the virtual clock. Reduced motion holds the first one.
			let idx = reduce ? 0 : CAPTIONS.findIndex((c) => t >= c.from && t <= c.to);
			if (!gateOpen) idx = -1;
			if (idx !== lastCaption) {
				lastCaption = idx;
				setCaptionIdx(idx);
			}
		};

		const loop = (now: number) => {
			update(now);
			raf = window.requestAnimationFrame(loop);
		};

		if (inView && !reduce) {
			raf = window.requestAnimationFrame(loop);
		} else {
			// Static: position once, and again on resize.
			update(performance.now());
		}
		const onResize = () => update(performance.now());
		window.addEventListener('resize', onResize);
		return () => {
			window.cancelAnimationFrame(raf);
			if (vfc && vfcVideo && 'cancelVideoFrameCallback' in vfcVideo) vfcVideo.cancelVideoFrameCallback(vfc);
			window.removeEventListener('resize', onResize);
		};
	}, [orientation, mode, reduce, gateOpen, inView, mounted]);

	const setStatus = useCallback(
		(which: 'video' | 'poster', o: Orientation, s: LoadStatus) =>
			(which === 'video' ? setVideoStatus : setPosterStatus)((prev) => (prev[o] === s ? prev : { ...prev, [o]: s })),
		[],
	);

	const togglePause = useCallback(() => setUserPaused((p) => !p), []);
	const toggleMute = useCallback(() => setMuted((m) => !m), []);
	const caption = captionIdx >= 0 ? CAPTIONS[captionIdx] : undefined;

	return (
		<section ref={heroRef} aria-label={`${siteConfig.name}, ${siteConfig.descriptor}`} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-jungle-deep text-cream">
			{/* 1. Masterplan still (Ken Burns), both orientations, CSS-switched. */}
			<div ref={stillRef} aria-hidden className="absolute inset-0 will-change-transform" style={{ transformOrigin: `${KB_ORIGIN.x * 100}% ${KB_ORIGIN.y * 100}%` }}>
				<div className="image-placeholder absolute inset-0 portrait:hidden">
					<SafeImage src={MEDIA.landscape.still} alt="" fill priority sizes="100vw" className="object-cover" />
				</div>
				<div className="image-placeholder absolute inset-0 landscape:hidden">
					<SafeImage src={MEDIA.portrait.still} alt="" fill fetchPriority="high" sizes="100vw" className="object-cover" />
				</div>
			</div>

			{/* 2. Video posters (first frames). Missing files fall through to the still. */}
			{(['landscape', 'portrait'] as const).map((o) => (
				<div key={o} aria-hidden className={clsx('absolute inset-0', o === 'landscape' ? 'portrait:hidden' : 'landscape:hidden')}>
					<SafeImage
						src={MEDIA[o].poster}
						alt=""
						fill
						sizes="100vw"
						className="object-cover"
						onLoad={(e) => {
							const img = e.currentTarget;
							if (img.naturalWidth > 0) posterAspect.current[o] = img.naturalWidth / img.naturalHeight;
							setStatus('poster', o, 'ok');
						}}
						onError={() => setStatus('poster', o, 'failed')}
					/>
				</div>
			))}

			{/* 3. The flyover itself, client-only so the right file for the orientation loads. */}
			{mounted ? (
				<video
					key={orientation}
					ref={videoRef}
					aria-hidden
					muted
					playsInline
					loop
					preload="auto"
					src={MEDIA[orientation].video}
					onLoadedData={() => setStatus('video', orientation, 'ok')}
					onError={() => setStatus('video', orientation, 'failed')}
					className={clsx('absolute inset-0 h-full w-full object-cover transition-opacity duration-1000', hasVideo ? 'opacity-100' : 'opacity-0')}
				/>
			) : null}

			{/* 4. Scrims: the header's at the top, a deep one under the wordmark. */}
			<div aria-hidden className="scrim-top pointer-events-none absolute inset-x-0 top-0 h-48" />
			<div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-jungle-deep/85 via-jungle-deep/35 to-transparent" />
			<div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-jungle-deep/35 to-transparent max-md:hidden" />

			{/* 5. Pins. Positioned by the loop; hidden until it runs. */}
			<div className="pointer-events-none absolute inset-0">
				{villas.map((v, i) => (
					<HeroPinLink
						key={v.slug}
						villa={v}
						index={i}
						register={(el) => {
							if (el) pinRefs.current.set(v.slug, el);
							else pinRefs.current.delete(v.slug);
						}}
					/>
				))}
			</div>

			{/* 6. Content. Not z-indexed and its wrappers are unpositioned, so the gate overlays the whole hero. */}
			<div className="pointer-events-none absolute inset-0 flex flex-col">
				<div className="container-x flex flex-1 flex-col pb-6 pt-28 md:pb-8 lg:pt-36">
					<div ref={captionRef} className="min-h-[5.5rem] self-start" aria-hidden>
						<AnimatePresence mode="wait">
							{caption ? (
								<motion.div key={captionIdx} className="flex items-start gap-4" initial={reduce ? false : CAPTION_FROM} animate={CAPTION_TO} exit={CAPTION_EXIT} transition={CAPTION_TRANSITION}>
									<motion.span aria-hidden className="mt-[0.55rem] block h-px w-12 origin-left bg-terracotta-bright" initial={reduce ? false : RULE_FROM} animate={RULE_TO} transition={RULE_TRANSITION} />
									<span>
										<span className="label on-dark block">{caption.eyebrow}</span>
										<span className="mt-1 block font-display text-[1.35rem] font-light leading-tight md:text-[1.6rem]">{caption.text}</span>
									</span>
								</motion.div>
							) : null}
						</AnimatePresence>
					</div>

					<div className="flex-1" />

					<div ref={wordmarkRef} className="self-start">
						<CandiBentar mode="gate" onOpened={() => setGateOpen(true)}>
							<h1 className="text-cream">
								<span className="display-xl block -ml-[0.04em]">{siteConfig.shortName}</span>
								<span className="mt-3 block font-display text-[1.35rem] font-light leading-snug md:mt-4 md:text-[1.9rem]">
									Ten houses <em className="italic-soft on-dark">in the rice fields</em>
									<span className="text-cream/70"> · {siteConfig.descriptor.replace(' · ', ', ')}</span>
								</span>
							</h1>
						</CandiBentar>
					</div>

					<div ref={searchRef} className="pointer-events-auto mt-7 w-full max-w-[880px] text-ink md:mt-9">
						<HeroSearch />
					</div>

					<div ref={barRef} className="pointer-events-auto mt-6 flex items-center justify-between gap-4 md:mt-8">
						<SidemenNow onDark className="max-sm:text-[0.62rem]" />
						<a href="#valley" className="label on-dark hidden flex-col items-center gap-2 transition-colors hover:text-cream md:flex" aria-label="Scroll to the valley">
							<span>Scroll</span>
							<span aria-hidden className="relative block h-8 w-px overflow-hidden bg-cream/25">
								<motion.span className="absolute inset-x-0 top-0 block h-3 bg-cream" animate={reduce ? undefined : CUE_ANIMATE} transition={CUE_TRANSITION} />
							</span>
						</a>
						<div className="flex items-center gap-2">
							{hasVideo ? (
								<IconButton label={muted ? 'Sound on' : 'Sound off'} pressed={!muted} onClick={toggleMute}>
									{muted ? <MutedIcon /> : <SoundIcon />}
								</IconButton>
							) : null}
							{!reduce ? (
								<IconButton label={userPaused ? 'Play the film' : 'Pause the film'} pressed={userPaused} onClick={togglePause}>
									{userPaused ? <PlayIcon /> : <PauseIcon />}
								</IconButton>
							) : null}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

/* ------------------------------------------------------------------ Pins */

function HeroPinLink({ villa, index, register }: { villa: HeroPinVilla; index: number; register(el: HTMLAnchorElement | null): void }) {
	const price = formatStayPrice(villa.price, villa.currency);
	return (
		<Link
			ref={register}
			href={`/villas/${villa.slug}`}
			data-on="false"
			data-side="right"
			aria-label={`${villa.title}, ${price} a night`}
			className="group/pin pointer-events-none absolute left-0 top-0 block h-0 w-0 outline-none data-[on=true]:pointer-events-auto"
		>
			<span
				className="absolute left-0 top-0 block scale-[0.6] opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[on=true]/pin:scale-100 group-data-[on=true]/pin:opacity-100"
				style={{ transitionDelay: `${(index % 10) * 60}ms` }}
			>
				<span aria-hidden className="absolute -left-[7px] -top-[7px] block h-3.5 w-3.5">
					<span className="absolute inset-0 animate-pulse-ring rounded-full bg-terracotta" />
					<span className="absolute inset-0 rounded-full bg-terracotta ring-2 ring-cream" />
				</span>
				<span className="glass absolute top-0 left-3 flex -translate-y-1/2 items-baseline gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-ink shadow-[0_10px_30px_-12px_rgba(21,41,32,.6)] ring-1 ring-cream/50 transition-colors group-hover/pin:bg-cream group-focus-visible/pin:ring-2 group-focus-visible/pin:ring-terracotta group-data-[side=left]/pin:left-auto group-data-[side=left]/pin:right-3">
					<span className="text-[0.8rem] font-semibold">{villa.title}</span>
					<span className="tabular font-display text-[0.95rem] text-terracotta">{price}</span>
					<span className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-ink-muted max-sm:hidden">/ night</span>
				</span>
			</span>
		</Link>
	);
}

/* ------------------------------------------------------------------ Controls */

function IconButton({ label, pressed, onClick, children }: { label: string; pressed: boolean; onClick(): void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			aria-label={label}
			aria-pressed={pressed}
			onClick={onClick}
			className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream ring-1 ring-cream/30 backdrop-blur-md transition-colors hover:bg-cream/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
		>
			{children}
		</button>
	);
}

const ICON = 'h-4 w-4';
function PauseIcon() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className={ICON} fill="currentColor">
			<rect x="3.5" y="2.5" width="3" height="11" rx="1" />
			<rect x="9.5" y="2.5" width="3" height="11" rx="1" />
		</svg>
	);
}
function PlayIcon() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className={ICON} fill="currentColor">
			<path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5Z" />
		</svg>
	);
}
function MutedIcon() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
			<path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5Z" fill="currentColor" />
			<path d="m11 6 3 4m0-4-3 4" />
		</svg>
	);
}
function SoundIcon() {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className={ICON} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
			<path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5Z" fill="currentColor" />
			<path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.3 3.7a6 6 0 0 1 0 8.6" />
		</svg>
	);
}
