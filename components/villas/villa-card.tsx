import type { ReactNode } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { Villa } from '@/lib/server-data';
import { SafeImage } from '@/components/ui/safe-image';
import { PriceTag } from '@/components/ui/price-tag';

/** The fields the card reads; a full `Villa` satisfies it. */
export type VillaCardData = Pick<Villa, 'slug' | 'title' | 'price' | 'currency' | 'image'> & {
	content: Pick<NonNullable<Villa['content']>, 'type' | 'maxGuests' | 'bedrooms'> | null;
};

export interface VillaCardProps {
	villa: VillaCardData;
	/** Optional availability line under the facts, e.g. <Badge tone="moss" dot>Free 14–17 Nov</Badge>. */
	availability?: ReactNode;
	/** Link target. Default `/villas/<slug>`; pass one with `?checkin=…` to carry the search. */
	href?: string;
	/** next/image `sizes`. Default fits a 3-up grid. */
	sizes?: string;
	priority?: boolean;
	/** Cream text for jungle sections. */
	onDark?: boolean;
	className?: string;
}

/**
 * Shared arch card (home carousel, villa list, similar villas): arch photo,
 * name, type, "4 guests · 2 bedrooms" and `$X / night`.
 */
export function VillaCard({ villa, availability, href, sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 85vw', priority, onDark, className }: VillaCardProps) {
	const c = villa.content;
	const facts = c ? `${c.maxGuests} guests · ${c.bedrooms} ${c.bedrooms === 1 ? 'bedroom' : 'bedrooms'}` : null;
	return (
		<Link href={href ?? `/villas/${villa.slug}`} className={clsx('group block outline-none', className)}>
			<article>
				<div className="arch image-placeholder relative aspect-[4/5] w-full transition-shadow duration-500 group-focus-visible:ring-2 group-focus-visible:ring-terracotta group-focus-visible:ring-offset-4">
					<SafeImage
						src={villa.image}
						alt={c ? `${villa.title}, ${c.type.toLowerCase()}` : villa.title}
						fill
						sizes={sizes}
						priority={priority}
						className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
					/>
				</div>
				<div className="mt-5 flex items-start justify-between gap-4">
					<div className="min-w-0">
						<h3 className={clsx('display-sm truncate transition-colors', onDark ? 'text-cream' : 'text-ink group-hover:text-terracotta-deep')}>{villa.title}</h3>
						{c ? <p className={clsx('mt-1 text-[0.95rem]', onDark ? 'text-cream/75' : 'text-ink-muted')}>{c.type}</p> : null}
						{facts ? <p className={clsx('label mt-2', onDark && 'on-dark')}>{facts}</p> : null}
					</div>
					<PriceTag amount={villa.price} currency={villa.currency} size="sm" onDark={onDark} className="shrink-0 pt-1" />
				</div>
				{availability ? <div className="mt-3">{availability}</div> : null}
			</article>
		</Link>
	);
}
