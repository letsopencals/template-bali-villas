import { DetailCard } from '@/components/account/trip-detail/detail-card';
import { buttonClasses } from '@/components/ui/button';
import { addressLines, mapsHref, phoneHref, whatsappHref } from '@/lib/contact';
import { siteConfig } from '@/lib/site-config';

/** Address, map link and how to reach the team. */
export function Directions() {
	return (
		<DetailCard label="Petunjuk arah" title="Getting here">
			<address className="not-italic leading-relaxed text-ink">
				{addressLines().map((line) => (
					<span key={line} className="block">
						{line}
					</span>
				))}
			</address>
			<p className="mt-3 text-sm text-ink-muted">{siteConfig.contact.hours}</p>
			<div className="mt-5 flex flex-wrap gap-3">
				<a href={mapsHref} target="_blank" rel="noreferrer" className={buttonClasses('secondary', 'md')}>
					Open in Maps
				</a>
				<a href={whatsappHref} target="_blank" rel="noreferrer" className={buttonClasses('outline', 'md')}>
					WhatsApp
				</a>
				<a href={phoneHref} className={buttonClasses('ghost', 'md')}>
					Call {siteConfig.contact.phone}
				</a>
			</div>
		</DetailCard>
	);
}
