import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { AccountError } from '@/components/account/account-error';
import { SessionExpired } from '@/components/account/session-expired';
import { toTrip, isTransferAddOn, parseUtc } from '@/components/account/trip-model';
import { tripPolicy } from '@/components/account/trip-policy';
import { TripHeader } from '@/components/account/trip-detail/trip-header';
import { StayDetails } from '@/components/account/trip-detail/stay-details';
import { TransferBlock } from '@/components/account/trip-detail/transfer-block';
import { Payments } from '@/components/account/trip-detail/payments';
import { Directions } from '@/components/account/trip-detail/directions';
import { HouseGuide } from '@/components/account/trip-detail/house-guide';
import { TripActions } from '@/components/account/trip-detail/trip-actions';
import { ReviewSection } from '@/components/account/trip-detail/review-section';
import { toReviewQuestions } from '@/components/account/trip-detail/review-types';
import { getVilla } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';
import { getAppointment, getAuthHeaders, getVillaLookup, listFeedbackQuestions, listInvoices, villaFor } from '../../_lib/account-data';

export const metadata: Metadata = { title: 'Your trip', robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

type Params = Promise<{ id: string }>;
type Search = Promise<{ action?: string | string[] }>;

const LOCAL_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: siteConfig.timezone, year: 'numeric', month: '2-digit', day: '2-digit' });

export default async function TripPage({ params, searchParams }: { params: Params; searchParams: Search }) {
	const [{ id }, { action }] = await Promise.all([params, searchParams]);
	const headers = await getAuthHeaders();
	if (!headers) return <SessionExpired />;

	const result = await getAppointment(id, headers);
	if (!result.ok) {
		if (result.status === 401) return <SessionExpired />;
		return result.status === 404 || result.status === 403 ? (
			<AccountError title="We couldn’t find that trip." body="It may belong to another account. Sign in with the email you booked with, or message us with your booking reference." />
		) : (
			<AccountError title="We couldn’t load this trip." body="Something went wrong on our side. Please try again in a moment." backHref={`/account/trips/${id}`} backLabel="Try again" />
		);
	}
	const appointment = result.data;

	const [lookup, villa, invoices, questions] = await Promise.all([
		getVillaLookup(),
		appointment.product?.slug ? getVilla(appointment.product.slug) : Promise.resolve(null),
		appointment.order?.id ? listInvoices(appointment.order.id, headers) : Promise.resolve([]),
		appointment.productId ? listFeedbackQuestions(appointment.productId) : Promise.resolve([]),
	]);

	const trip = toTrip(appointment, villaFor(lookup, appointment.product));
	const policy = tripPolicy(appointment, trip);
	const active = trip.phase === 'upcoming' || trip.phase === 'current';
	const createdMs = parseUtc(appointment.createdAt);
	const bookedOn = Number.isFinite(createdMs) ? LOCAL_DATE.format(createdMs) : null;
	const requested = Array.isArray(action) ? action[0] : action;
	const initialAction = trip.phase === 'upcoming' && (requested === 'cancel' || requested === 'reschedule') ? requested : null;
	const transferOffer = villa?.addOns.find((a) => isTransferAddOn(a)) ?? null;
	const currency = appointment.order?.paymentCurrencyCode ?? villa?.currency ?? siteConfig.currency;
	const bookAgain = villa?.slug ?? trip.villa.slug;

	return (
		<article>
			<TripHeader trip={trip} />

			<div className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
				<div className="space-y-6">
					{trip.phase === 'upcoming' ? (
						<TripActions
							trip={trip}
							policy={policy}
							locationId={appointment.locationId}
							rescheduleGap={appointment.product?.rescheduleGap ?? 0}
							bookedOn={bookedOn}
							initialAction={initialAction}
						/>
					) : null}
					<StayDetails trip={trip} addOns={appointment.addOns ?? []} />
					{trip.phase === 'past' ? (
						<ReviewSection tripId={trip.id} answers={appointment.feedbackQuestionAnswers ?? []} questions={toReviewQuestions(questions)} />
					) : null}
					{villa?.content ? <HouseGuide content={villa.content} showManual={active} /> : null}
				</div>
				<div className="space-y-6">
					{trip.phase === 'upcoming' ? <TransferBlock trip={trip} booked={appointment.addOns ?? []} offer={transferOffer} currency={currency} /> : null}
					<Payments order={appointment.order} invoices={invoices} />
					{active ? <Directions /> : null}
					{bookAgain && trip.phase !== 'current' ? (
						<section aria-label="Book again" className="rounded-[24px] bg-jungle p-6 text-cream md:p-8">
							<p className="label text-cream/70">Kembali lagi</p>
							<h2 className="display-sm mt-2 text-cream">{trip.phase === 'upcoming' ? 'Bringing friends?' : 'Come back to the valley.'}</h2>
							<p className="mt-3 text-cream/80">
								{trip.phase === 'upcoming' ? `Book another stay at ${trip.villa.title} or one of its neighbours.` : `${trip.villa.title} is waiting for you.`}
							</p>
							<Link href={`/villas/${bookAgain}`} className={buttonClasses('primary', 'md', { className: 'mt-5' })}>
								Book again
							</Link>
						</section>
					) : null}
				</div>
			</div>
		</article>
	);
}
