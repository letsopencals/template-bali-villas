'use client';

import Link from 'next/link';
import { CountdownText } from '@/components/ui/countdown-text';
import { LockGlyph } from './payment-section';

interface HoldBarProps {
	villaSlug: string;
	villaTitle: string;
	/** Seconds left on the hold, null when nothing is held. */
	timeRemaining: number | null;
	expired: boolean;
	onRehold(): void;
	reholdBusy: boolean;
}

/** "← Back to <Villa>" · "Secure booking" · the hold timer (or a gentle re-hold prompt once it runs out). */
export function HoldBar({ villaSlug, villaTitle, timeRemaining, expired, onRehold, reholdBusy }: HoldBarProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line pb-5">
			<Link href={`/villas/${villaSlug}`} className="link-underline text-[0.92rem] text-ink-muted hover:text-ink">
				<span aria-hidden>←</span> Back to {villaTitle}
			</Link>
			<p className="label flex items-center gap-2 max-sm:hidden">
				<LockGlyph /> Secure booking
			</p>
			<div aria-live="polite" className="text-[0.92rem]">
				{expired ? (
					<span className="flex flex-wrap items-center gap-x-3 gap-y-1">
						<span className="text-ink-muted">Our hold on {villaTitle} has ended.</span>
						<button type="button" onClick={onRehold} disabled={reholdBusy} className="link-underline font-medium text-terracotta-deep disabled:opacity-50">
							{reholdBusy ? 'Holding again…' : 'Hold it again'}
						</button>
					</span>
				) : timeRemaining !== null ? (
					<span>
						<span className="text-ink-muted">We&rsquo;re holding {villaTitle} for </span>
						<CountdownText seconds={timeRemaining} className="font-medium" />
					</span>
				) : (
					<span className="text-ink-muted">Nothing is charged until the last step.</span>
				)}
			</div>
		</div>
	);
}
