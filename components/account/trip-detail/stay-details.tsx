import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { DetailCard, DetailRow } from '@/components/account/trip-detail/detail-card';
import { formatLongDate, formatTripGuests, nightsLabel, type Trip } from '@/components/account/trip-model';

/** Dates with check-in/out times, nights, guests, arrival, flight, occasion and booked add-ons. */
export function StayDetails({ trip, addOns }: { trip: Trip; addOns: AppointmentDetailResponse['addOns'] }) {
	return (
		<DetailCard label="Rincian menginap" title="Your stay">
			<dl className="divide-y divide-line">
				<DetailRow label="Check-in">
					{formatLongDate(trip.checkin)}
					<span className="block text-sm text-ink-muted">from {trip.stayTimes.checkIn}</span>
				</DetailRow>
				<DetailRow label="Check-out">
					{formatLongDate(trip.checkout)}
					<span className="block text-sm text-ink-muted">by {trip.stayTimes.checkOut}</span>
				</DetailRow>
				<DetailRow label="Length">{nightsLabel(trip.nights)}</DetailRow>
				{trip.guests ? <DetailRow label="Guests">{formatTripGuests(trip.guests)}</DetailRow> : null}
				{trip.arrivalTime ? <DetailRow label="Arrival">{trip.arrivalTime}</DetailRow> : null}
				{trip.flightNumber ? <DetailRow label="Flight">{trip.flightNumber}</DetailRow> : null}
				{trip.occasion ? <DetailRow label="Occasion">{trip.occasion}</DetailRow> : null}
				{addOns.length > 0 ? (
					<DetailRow label="Extras">
						{addOns.map((a) => (
							<span key={a.id} className="block">
								{a.addOn?.title ?? 'Extra'}
								{a.quantity > 1 ? ` × ${a.quantity}` : ''}
							</span>
						))}
					</DetailRow>
				) : null}
			</dl>
		</DetailCard>
	);
}
