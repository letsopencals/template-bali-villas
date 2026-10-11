'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';

const TIME_FMT = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: siteConfig.timezone });
const HOUR_FMT = new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: siteConfig.timezone });

/** Balinese time of day (DESIGN.md §1): Pagi, Siang, Sore, Malam. */
export function timeOfDay(hour: number): { id: 'pagi' | 'siang' | 'sore' | 'malam'; label: string; english: string } {
	if (hour >= 5 && hour < 11) return { id: 'pagi', label: 'Pagi', english: 'morning' };
	if (hour >= 11 && hour < 15) return { id: 'siang', label: 'Siang', english: 'midday' };
	if (hour >= 15 && hour < 19) return { id: 'sore', label: 'Sore', english: 'late afternoon' };
	return { id: 'malam', label: 'Malam', english: 'night' };
}

/**
 * Typical air temperature in the valley for the hour (400 m: about 21°C before
 * dawn, 28°C mid-afternoon). Not live weather; the strip labels it "about".
 */
export function typicalTemperature(hour: number): number {
	const min = 21;
	const max = 28;
	// Coolest ~05:00, warmest ~14:00.
	const phase = ((hour - 5 + 24) % 24) / 24;
	const t = phase < 9 / 24 ? phase / (9 / 24) : 1 - (phase - 9 / 24) / (15 / 24);
	return Math.round(min + (max - min) * (0.5 - 0.5 * Math.cos(Math.PI * t)));
}

export interface SidemenNowProps {
	className?: string;
	onDark?: boolean;
	/** Show "Pagi" etc. after the time. Default true. */
	showTimeOfDay?: boolean;
}

/**
 * "In Sidemen now · 06:42 · 24°C" (Asia/Makassar). Renders placeholders until
 * mounted, so the server HTML never disagrees with the client clock.
 */
export function SidemenNow({ className, onDark, showTimeOfDay = true }: SidemenNowProps) {
	const [now, setNow] = useState<{ time: string; hour: number } | null>(null);

	useEffect(() => {
		const tick = () => {
			const d = new Date();
			setNow({ time: TIME_FMT.format(d), hour: Number(HOUR_FMT.format(d)) % 24 });
		};
		tick();
		const id = window.setInterval(tick, 15_000);
		return () => window.clearInterval(id);
	}, []);

	const tod = now ? timeOfDay(now.hour) : null;
	return (
		<p className={clsx('label inline-flex items-center gap-2', onDark && 'on-dark', className)}>
			<span className="relative inline-flex h-1.5 w-1.5" aria-hidden>
				<span className="absolute inset-0 animate-pulse-ring rounded-full bg-terracotta" />
				<span className="relative h-1.5 w-1.5 rounded-full bg-terracotta" />
			</span>
			<span>In Sidemen now</span>
			<span aria-hidden>·</span>
			<span className="tabular" suppressHydrationWarning>
				{now?.time ?? '--:--'}
			</span>
			{showTimeOfDay && tod ? (
				<span className="normal-case tracking-normal italic" title={tod.english}>
					{tod.label}
				</span>
			) : null}
			<span aria-hidden>·</span>
			<span className="tabular" title="Typical for this hour, not live weather">
				{now ? `about ${typicalTemperature(now.hour)}°C` : '--°C'}
			</span>
		</p>
	);
}
