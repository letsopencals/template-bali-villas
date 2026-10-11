'use client';

import { clsx } from 'clsx';
import { useCartExpiry } from '@/hooks/use-cart-expiry';

export interface CountdownTextProps {
	/** ISO expiry (e.g. cart.expiresAt). Ignored when `seconds` is given. */
	expiresAt?: string | null;
	/** Seconds remaining, if the parent already ticks (useStayBooking().timeRemaining). */
	seconds?: number | null;
	/** Shown when time is up. */
	expiredLabel?: string;
	/** Under this many seconds the text turns terracotta. Default 120. */
	warnBelow?: number;
	className?: string;
}

/** mm:ss from seconds (h:mm:ss over an hour). */
export function formatCountdown(total: number): string {
	const s = Math.max(0, Math.floor(total));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	const mm = String(m).padStart(h > 0 ? 2 : 1, '0');
	const ss = String(sec).padStart(2, '0');
	return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "14:32" hold countdown (tabular). Renders nothing without an expiry. */
export function CountdownText({ expiresAt, seconds, expiredLabel = 'Expired', warnBelow = 120, className }: CountdownTextProps) {
	const ticking = useCartExpiry(seconds === undefined ? expiresAt : null);
	const remaining = seconds === undefined ? ticking : seconds;
	if (remaining === null || remaining === undefined) return null;
	const expired = remaining <= 0;
	return (
		<time
			aria-live="off"
			dateTime={`PT${Math.max(0, remaining)}S`}
			className={clsx('tabular', (expired || remaining < warnBelow) && 'text-terracotta', className)}
		>
			{expired ? expiredLabel : formatCountdown(remaining)}
		</time>
	);
}
