'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { siteConfig } from '@/lib/site-config';
import { Reveal } from '@/components/motion/reveal';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { CanangSari } from '@/components/motifs/canang-sari';
import { IkatRule } from '@/components/motifs/ikat-rule';
import { formatGuests } from '@/components/stay/guest-picker';
import { fmtLongDay, money, plural } from '../reserve-model';
import { hasTransfer, toConfirmedStays, type ConfirmedStay } from './confirmed-model';
import { icsHref } from './ics';

const SWR_OPTS = { revalidateOnFocus: false, errorRetryCount: 3 };

const CHECKLIST: readonly string[] = [
	'Send us your flight number if you have not yet, so the driver can track it.',
	'Pack a light jacket. Sidemen sits at 400 m and the evenings are cool.',
	'Bring cash in rupiah for the warung and temple donations. The nearest ATM is 20 minutes away.',
	'Bring a sarong, or borrow one from us, for temple visits.',
	'Tell us about allergies or dietary needs before you arrive.',
];

function gettingThere(transfer: boolean): ReadonlyArray<{ title: string; body: string }> {
	return [
		{
			title: 'Land at Denpasar (DPS)',
			body: transfer
				? 'Your driver waits in arrivals with a Lumbung sign. We track the flight, so delays are fine.'
				: 'Taxis and ride apps work from arrivals. Or add our airport transfer from your trip page, $45 each way.',
		},
		{ title: 'Drive east, about 2 hours', body: 'Through Gianyar and Klungkung, then up the Sidemen valley. The last 20 minutes are rice terraces.' },
		{ title: 'Arrive from 15:00', body: 'A host meets you at the gate with something cold. Reception is open until 22:00 and on call through the night.' },
	];
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line py-3 text-[0.95rem] last:border-b-0">
			<dt className="label pt-0.5">{label}</dt>
			<dd>{children}</dd>
		</div>
	);
}

const StayCard = memo(function StayCard({ stay, currency }: { stay: ConfirmedStay; currency: string }) {
	return (
		<article className="overflow-hidden rounded-[24px] border border-line bg-cream">
			<div className="grid gap-0 sm:grid-cols-[13rem_1fr]">
				<div className="image-placeholder relative aspect-[4/3] sm:aspect-auto">
					{stay.villaImage ? <SafeImage src={stay.villaImage} alt={stay.villaTitle} fill sizes="(min-width: 640px) 13rem, 100vw" className="object-cover" /> : null}
				</div>
				<div className="p-6 lg:p-7">
					<p className="label">Your villa</p>
					<h2 className="display-sm mt-2">{stay.villaTitle}</h2>
					<dl className="mt-4">
						<Row label="Check in">
							<span className="tabular">{fmtLongDay(stay.checkin)}</span>
							<span className="text-ink-muted"> · from {stay.checkInTime} WITA</span>
						</Row>
						<Row label="Check out">
							<span className="tabular">{fmtLongDay(stay.checkout)}</span>
							<span className="text-ink-muted"> · by {stay.checkOutTime} WITA</span>
						</Row>
						<Row label="Stay">{plural(stay.nights, 'night', 'nights')}</Row>
						<Row label="Guests">{formatGuests(stay.guests)}</Row>
						{stay.arrivalTime ? <Row label="Arriving">{stay.arrivalTime}</Row> : null}
						{stay.flightNumber ? <Row label="Flight">{stay.flightNumber}</Row> : null}
						{stay.occasion ? <Row label="Occasion">{stay.occasion}</Row> : null}
						{stay.addOns.length > 0 ? (
							<Row label="Extras">
								<ul className="flex flex-col gap-1">
									{stay.addOns.map((a) => (
										<li key={a.id} className="flex justify-between gap-4">
											<span>{a.quantity > 1 ? `${a.title} × ${a.quantity}` : a.title}</span>
											<span className="tabular text-ink-muted">{money(a.amount, currency)}</span>
										</li>
									))}
								</ul>
							</Row>
						) : null}
					</dl>
				</div>
			</div>
		</article>
	);
});

function Waiting() {
	return (
		<div className="flex flex-col items-center gap-4 rounded-[24px] border border-line bg-cream px-6 py-16 text-center" aria-busy>
			<CanangSari size={56} spinning label="Loading your booking" />
			<p className="text-ink-muted">Fetching your itinerary…</p>
		</div>
	);
}

function NoDetails({ signedIn }: { signedIn: boolean }) {
	return (
		<div className="rounded-[24px] border border-line bg-cream px-6 py-10">
			<p className="text-ink-muted">
				{signedIn ? 'We could not load the itinerary here just now.' : 'Sign in to see your itinerary here.'} Your confirmation email has every detail, and we are on WhatsApp at{' '}
				<span className="tabular text-ink">{siteConfig.contact.whatsapp}</span> if anything changes.
			</p>
		</div>
	);
}

interface ConfirmedViewProps {
	orderId: string;
}

/** `/reserve/confirmed/[id]`: loads the order (checkout signs the guest in) and shows the itinerary, getting-there steps and a checklist. */
export function ConfirmedView({ orderId }: ConfirmedViewProps) {
	const { status } = useSession();
	const key = status === 'authenticated' ? `/api/account/orders/${encodeURIComponent(orderId)}` : null;
	const { data: order, isLoading, error } = useSWR<OrderDetailResponse>(key, fetcher, SWR_OPTS);
	const loading = status === 'loading' || isLoading;

	const stays = useMemo(() => (order ? toConfirmedStays(order) : []), [order]);
	const reference = order?.name ?? '';
	const calendar = useMemo(() => (stays.length > 0 ? icsHref(stays, reference) : null), [stays, reference]);
	const currency = order?.paymentCurrencyCode ?? siteConfig.currency;
	const firstName = order?.customerFirstName ?? order?.customer?.firstName ?? null;
	const email = order?.customerEmail ?? order?.customer?.email ?? null;
	const firstStay = stays[0] ?? null;
	const steps = gettingThere(hasTransfer(stays));
	const paid = order ? (order.paidTotal > 0 ? order.paidTotal : order.total) : 0;

	return (
		<section className="container-x pb-24 pt-32 lg:pb-32 lg:pt-40">
			<div className="mx-auto max-w-[68rem]">
				<Reveal>
					<p className="label">{reference ? `Booking ${reference}` : 'Booking received'}</p>
				</Reveal>
				<Reveal delay={0.06}>
					<h1 className="display-md mt-4">
						Sampai jumpa di <span className="italic-soft">Sidemen</span>
					</h1>
				</Reveal>
				<Reveal delay={0.12}>
					<p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-muted">
						Terima kasih{firstName ? `, ${firstName}` : ''}. Your villa is booked.{' '}
						{email ? (
							<>
								A confirmation is on its way to <span className="text-ink">{email}</span>.
							</>
						) : (
							'A confirmation is on its way by email.'
						)}{' '}
						All times are Bali time (WITA, UTC+8).
					</p>
				</Reveal>

				<IkatRule className="mt-10" />

				<div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
					<div className="flex flex-col gap-6">
						{loading ? (
							<Waiting />
						) : stays.length > 0 ? (
							stays.map((s) => <StayCard key={s.appointmentId} stay={s} currency={currency} />)
						) : (
							<NoDetails signedIn={status === 'authenticated' && !error} />
						)}

						<div className="rounded-[24px] bg-paper-deep p-6 lg:p-8">
							<p className="label">Getting there</p>
							<ol className="mt-5 flex flex-col gap-5">
								{steps.map((s, i) => (
									<li key={s.title} className="grid grid-cols-[2.25rem_1fr] gap-4">
										<span className="tabular flex h-9 w-9 items-center justify-center rounded-full border border-line-strong font-display">{i + 1}</span>
										<div>
											<p className="font-medium">{s.title}</p>
											<p className="mt-1 text-[0.95rem] text-ink-muted">{s.body}</p>
										</div>
									</li>
								))}
							</ol>
							<Link href="/getting-there" className="link-underline mt-6 inline-block text-[0.92rem] font-medium text-terracotta-deep">
								The full guide to getting here
							</Link>
						</div>
					</div>

					<aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
						{order ? (
							<div className="on-dark rounded-[24px] bg-jungle p-6 text-cream">
								<p className="label">Total paid</p>
								<p className="tabular mt-2 font-display text-[2rem] leading-none">{money(paid, currency)}</p>
								{order.balance > 0 ? <p className="mt-2 text-[0.86rem] text-cream/70">Balance due at the villa: {money(order.balance, currency)}</p> : null}
								<p className="mt-4 text-[0.86rem] text-cream/70">
									Reference <span className="tabular text-cream">{reference}</span>
								</p>
							</div>
						) : null}

						<div className="flex flex-col gap-3">
							{firstStay ? (
								<Link href={`/account/trips/${firstStay.appointmentId}`} className={buttonClasses('primary', 'lg', { fullWidth: true, pill: true })}>
									Go to my trip
								</Link>
							) : (
								<Link href="/account/trips" className={buttonClasses('primary', 'lg', { fullWidth: true, pill: true })}>
									Go to my trips
								</Link>
							)}
							{calendar ? (
								<a href={calendar} download={`lumbung-${reference || 'stay'}.ics`} className={buttonClasses('outline', 'lg', { fullWidth: true, pill: true })}>
									Add to calendar
								</a>
							) : null}
						</div>

						<div className="rounded-[24px] border border-line bg-cream p-6">
							<p className="label">Before you arrive</p>
							<ul className="mt-4 flex flex-col gap-3 text-[0.92rem]">
								{CHECKLIST.map((c) => (
									<li key={c} className="flex gap-3">
										<span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
										<span className="text-ink-muted">{c}</span>
									</li>
								))}
							</ul>
						</div>
					</aside>
				</div>
			</div>
		</section>
	);
}
