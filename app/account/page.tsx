import type { Metadata } from 'next';
import { EmptyTrips } from '@/components/account/empty-trips';
import { NextTripHero } from '@/components/account/next-trip-hero';
import { SessionExpired } from '@/components/account/session-expired';
import { AccountError } from '@/components/account/account-error';
import { TripCard } from '@/components/account/trip-card';
import { TripSection } from '@/components/account/trip-section';
import { groupTrips, hasFeedback, isRealTrip, isTransferAddOn, toTrip } from '@/components/account/trip-model';
import { getAppointment, getAuthHeaders, getProfile, getVillaLookup, listAppointments, villaFor } from './_lib/account-data';

export const metadata: Metadata = { title: 'My trips', robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

/** How many past stays to check for a missing review (one detail call each). */
const REVIEW_CHECK_LIMIT = 12;

export default async function AccountPage() {
	const headers = await getAuthHeaders();
	if (!headers) return <SessionExpired />;

	const [appointments, profile, lookup] = await Promise.all([listAppointments(headers), getProfile(headers), getVillaLookup()]);
	if (!appointments.ok) {
		if (appointments.status === 401) return <SessionExpired />;
		return <AccountError title="We couldn’t load your trips." body="Something went wrong on our side. Please try again in a moment, or message us and we’ll check your booking." backHref="/account" backLabel="Try again" />;
	}

	const now = Date.now();
	const trips = appointments.data.filter(isRealTrip).map((a) => toTrip(a, villaFor(lookup, a.product), now));
	const { next, upcoming, past, cancelled } = groupTrips(trips);
	const firstName = profile.ok ? profile.data.firstName?.trim() : null;

	// Detail calls: the next trip (for its add-ons) and recent past stays (for feedback answers).
	const [nextDetail, ...pastDetails] = await Promise.all([
		next ? getAppointment(next.id, headers) : Promise.resolve(null),
		...past.slice(0, REVIEW_CHECK_LIMIT).map((t) => getAppointment(t.id, headers)),
	]);
	const hasTransfer = nextDetail?.ok ? nextDetail.data.addOns.some((a) => isTransferAddOn(a.addOn)) : false;
	const needsReview = new Set(
		past.slice(0, REVIEW_CHECK_LIMIT).filter((_, i) => {
			const d = pastDetails[i];
			return d?.ok ? !hasFeedback(d.data) : false;
		}).map((t) => t.id),
	);

	return (
		<div>
			<header className="max-w-3xl">
				<p className="label">My trips · Perjalanan saya</p>
				<h1 className="display-md mt-3">
					Selamat datang{firstName ? <>, <span className="italic-soft">{firstName}</span></> : null}.
				</h1>
				<p className="mt-4 text-lg text-ink-muted">
					{next
						? next.phase === 'current'
							? 'You’re with us in Sidemen right now. Everything for your stay is below.'
							: 'Your next stay in the valley is coming up. Here’s everything you need before you travel.'
						: trips.length > 0
							? 'No stays booked right now. The rice terraces will be here when you’re ready.'
							: 'This is where your stays in Sidemen will live.'}
				</p>
			</header>

			<div className="mt-10 lg:mt-12">
				{next ? <NextTripHero trip={next} hasTransfer={hasTransfer} /> : <EmptyTrips returning={trips.length > 0} />}
			</div>

			{upcoming.length > 0 ? (
				<TripSection title="Upcoming" local="Akan datang" count={upcoming.length}>
					{upcoming.map((t) => (
						<TripCard key={t.id} trip={t} />
					))}
				</TripSection>
			) : null}

			{past.length > 0 ? (
				<TripSection title="Past stays" local="Kenangan" count={past.length}>
					{past.map((t) => (
						<TripCard key={t.id} trip={t} needsReview={needsReview.has(t.id)} />
					))}
				</TripSection>
			) : null}

			{cancelled.length > 0 ? (
				<TripSection title="Cancelled" local="Dibatalkan" count={cancelled.length}>
					{cancelled.map((t) => (
						<TripCard key={t.id} trip={t} />
					))}
				</TripSection>
			) : null}
		</div>
	);
}
