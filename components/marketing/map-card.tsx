import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';
import { addressLines, mapsHref } from '@/lib/contact';
import { buttonClasses } from '@/components/ui/button';
import { TerraceLines } from '@/components/motifs/terrace-lines';
import { LumbungGlyph } from '@/components/motifs/lumbung-mark';

/**
 * A map card without a third-party embed: terrace-line "map" with a pin, the
 * address and coordinates, and an "Open in Google Maps" link (no cookies, no
 * API key). Jungle surface.
 */
export function MapCard({ className }: { className?: string }) {
	const { lat, lng } = siteConfig.contact.geo;
	const coords = `${Math.abs(lat).toFixed(4)}° ${lat < 0 ? 'S' : 'N'}, ${Math.abs(lng).toFixed(4)}° ${lng < 0 ? 'W' : 'E'}`;
	return (
		<div className={clsx('on-dark relative overflow-hidden rounded-[24px] bg-jungle text-cream', className)}>
			<div className="relative aspect-[16/10] w-full overflow-hidden bg-jungle-soft">
				<TerraceLines onDark lines={18} />
				<svg aria-hidden viewBox="0 0 400 250" className="absolute inset-0 h-full w-full" fill="none">
					{/* the river and the road, drawn loosely */}
					<path d="M-10 210 C 80 180, 140 200, 200 150 S 300 60, 410 40" stroke="rgba(251,248,242,.35)" strokeWidth="6" strokeLinecap="round" />
					<path d="M-10 60 C 70 90, 150 70, 205 128 S 330 220, 410 205" stroke="rgba(204,100,64,.6)" strokeWidth="2" strokeDasharray="5 6" />
				</svg>
				<a href={mapsHref} target="_blank" rel="noopener noreferrer" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full" aria-label={`Open ${siteConfig.name} in Google Maps`}>
					<span className="relative flex flex-col items-center">
						<span className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta text-cream shadow-[0_12px_30px_-10px_rgba(0,0,0,.5)]">
							<LumbungGlyph size={24} />
						</span>
						<span aria-hidden className="h-3 w-px bg-terracotta" />
						<span aria-hidden className="animate-pulse-ring h-2 w-2 rounded-full bg-terracotta" />
					</span>
				</a>
				<span className="label on-dark absolute bottom-4 left-5">Pura Besakih ↑ · Klungkung ↓</span>
			</div>
			<div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-end sm:justify-between">
				<address className="not-italic">
					<p className="font-display text-[1.3rem]">{siteConfig.name}</p>
					{addressLines().map((l) => (
						<p key={l} className="text-cream/75">
							{l}
						</p>
					))}
					<p className="tabular label on-dark mt-3">{coords}</p>
				</address>
				<a href={mapsHref} target="_blank" rel="noopener noreferrer" className={buttonClasses('outline', 'md', { onDark: true, className: 'shrink-0' })}>
					Open in Google Maps
				</a>
			</div>
		</div>
	);
}
