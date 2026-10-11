import Link from 'next/link';
import { clsx } from 'clsx';
import { buttonClasses } from '@/components/ui/button';
import { PriceTag } from '@/components/ui/price-tag';
import type { StoreAddOn } from '@/components/marketing/add-ons';

export interface TransferCardProps {
	addOn: StoreAddOn | null;
	whatsappHref: string;
	className?: string;
}

/** The airport-transfer add-on with its store price, or a WhatsApp fallback when the store doesn't sell it. */
export function TransferCard({ addOn, whatsappHref, className }: TransferCardProps) {
	return (
		<div className={clsx('float-surface rounded-[24px] p-8 ring-1 ring-line', className)}>
			<p className="label">{addOn ? 'Add-on' : 'On request'}</p>
			<h3 className="display-sm mt-3">{addOn?.title ?? 'Airport transfer from DPS'}</h3>
			{addOn?.description ? <p className="mt-3 text-ink-muted">{addOn.description}</p> : null}
			<div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-6">
				{addOn ? (
					<PriceTag amount={addOn.price} currency={addOn.currency} unit="per booking" size="md" />
				) : (
					<p className="text-ink-muted">Ask at reception for the price, paid locally.</p>
				)}
			</div>
			<ul className="mt-6 space-y-2 text-[0.95rem]">
				<li className="flex gap-3">
					<span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
					Meet and greet in arrivals, any hour
				</li>
				<li className="flex gap-3">
					<span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
					Add your flight number at checkout so we can track delays
				</li>
				<li className="flex gap-3">
					<span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-moss" />
					Need a return trip? Ask us during your stay
				</li>
			</ul>
			<div className="mt-8 flex flex-wrap gap-3">
				<Link href="/villas" className={buttonClasses('primary', 'md')}>
					{addOn ? 'Add it when you book' : 'Book a villa'}
				</Link>
				<a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClasses('ghost', 'md')}>
					Ask on WhatsApp
				</a>
			</div>
		</div>
	);
}
