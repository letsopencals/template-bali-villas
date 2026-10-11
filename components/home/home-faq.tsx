import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { Accordion, AccordionItem } from '@/components/marketing/accordion';
import { SectionHeading } from '@/components/home/section-heading';
import { money } from '@/components/home/home-format';

export interface FaqPrices {
	currency: string;
	/** Airport transfer add-on price, when the store sells it. */
	transfer: number | null;
	/** Floating breakfast add-on price, when the store sells it. */
	breakfast: number | null;
	/** Shortest and longest minimum stay across the villas. */
	minNights: { min: number; max: number } | null;
}

/** Six short answers, built only from site-config and store facts. */
export function HomeFaq({ prices }: { prices: FaqPrices }) {
	const { stay, facts, priceIncludes, contact } = siteConfig;
	const airport = facts.find((f) => /airport/i.test(f.label));
	const mn = prices.minNights;

	return (
		<section aria-labelledby="faq-title" className="bg-paper-deep">
			<div className="container-x section-y grid gap-12 lg:grid-cols-12">
				<div className="lg:col-span-4">
					<SectionHeading
						id="faq-title"
						eyebrow="Before you book"
						title={
							<>
								Good <em className="italic-soft">questions</em>
							</>
						}
						intro={
							<>
								More on the <Link href="/faq" className="link-underline text-ink">full FAQ</Link>, or ask us: {contact.hours.toLowerCase()}.
							</>
						}
					/>
				</div>
				<Accordion className="lg:col-span-8">
					<AccordionItem question="When are check-in and check-out?">
						Check-in is from {stay.checkIn} and check-out is by {stay.checkOut}. Early check-in and late check-out can be requested when you reserve.
					</AccordionItem>
					<AccordionItem question="How do we get there from the airport?">
						{airport ? `Sidemen is about ${airport.value.replace(' h', ' hours')} by road from Denpasar airport. ` : null}
						{prices.transfer != null
							? `We can send a driver: the airport transfer is ${money(prices.transfer, prices.currency)}, added when you reserve.`
							: 'We can arrange a driver, added when you reserve.'}{' '}
						<Link href="/getting-there" className="link-underline text-ink">
							Getting there
						</Link>
					</AccordionItem>
					<AccordionItem question="What is included in the nightly price?">
						{priceIncludes.join(', ')}. {stay.taxNote}
					</AccordionItem>
					<AccordionItem question="Is breakfast included?">
						Not in the nightly price.{' '}
						{prices.breakfast != null
							? `Add a floating breakfast for ${money(prices.breakfast, prices.currency)} when you reserve, or pay locally.`
							: 'Add it when you reserve, or pay locally.'}
					</AccordionItem>
					<AccordionItem question="What is the cancellation policy?">
						Free cancellation up to {stay.cancellationDays} days before check-in. The exact date is shown on the villa page, at checkout and in your trip. After that, write to us and we will do what we fairly can.
					</AccordionItem>
					<AccordionItem question="Is there a minimum or maximum stay?">
						{mn ? (mn.min === mn.max ? `The minimum is ${mn.min} ${mn.min === 1 ? 'night' : 'nights'}` : `The minimum is ${mn.min} to ${mn.max} nights, depending on the house`) : 'Each house shows its minimum stay'}, and the longest stay you can book online is {stay.maxNights} nights.
					</AccordionItem>
				</Accordion>
			</div>
		</section>
	);
}
