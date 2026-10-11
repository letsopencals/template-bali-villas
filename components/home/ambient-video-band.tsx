'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { SafeImage } from '@/components/ui/safe-image';

export interface AmbientVideoBandProps {
	/** Path without extension, e.g. `/videos/evening-rain` (`.mp4` + `.jpg` poster). */
	src: string;
	alt: string;
	children?: React.ReactNode;
}

/**
 * Full-bleed, silent ambient clip. The poster always renders underneath; the
 * <video> is only mounted on the client once the band nears the viewport
 * (preload="none" until then), plays while in view and pauses when it leaves.
 * Reduced motion or a missing file: the poster stays (or the placeholder).
 */
export function AmbientVideoBand({ src, alt, children }: AmbientVideoBandProps) {
	const reduce = useReducedMotion();
	const rootRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [near, setNear] = useState(false);
	const [inView, setInView] = useState(false);
	const [status, setStatus] = useState<'idle' | 'ok' | 'failed'>('idle');

	useEffect(() => {
		const el = rootRef.current;
		if (!el || reduce) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry) return;
				setInView(entry.isIntersecting);
				if (entry.isIntersecting) setNear(true);
			},
			{ rootMargin: '200px 0px' },
		);
		io.observe(el);
		return () => io.disconnect();
	}, [reduce]);

	useEffect(() => {
		const v = videoRef.current;
		if (!v || status === 'failed') return;
		if (inView && !reduce) v.play().catch(() => undefined);
		else v.pause();
	}, [inView, reduce, near, status]);

	const showVideo = near && !reduce && status !== 'failed';

	return (
		<div ref={rootRef} className="image-placeholder relative h-[62svh] min-h-[360px] w-full overflow-hidden md:h-[78svh]">
			<SafeImage src={`${src}.jpg`} alt={alt} fill sizes="100vw" className="object-cover" />
			{showVideo ? (
				<video
					ref={videoRef}
					aria-hidden
					muted
					loop
					playsInline
					autoPlay
					preload="metadata"
					poster={`${src}.jpg`}
					onLoadedData={() => setStatus('ok')}
					onError={() => setStatus('failed')}
					className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${status === 'ok' ? 'opacity-100' : 'opacity-0'}`}
				>
					<source src={`${src}.mp4`} type="video/mp4" onError={() => setStatus('failed')} />
				</video>
			) : null}
			<div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-jungle-deep/75 via-jungle-deep/15 to-jungle-deep/30" />
			{children ? <div className="on-dark absolute inset-x-0 bottom-0 text-cream">{children}</div> : null}
		</div>
	);
}
