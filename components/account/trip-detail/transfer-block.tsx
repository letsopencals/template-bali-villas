import type { AppointmentDetailResponse, AddOnListItemResponse } from '@opencals/storefront-sdk';
import { DetailCard } from '@/components/account/trip-detail/detail-card';
import { isTransferAddOn, formatMoney, type Trip } from '@/components/account/trip-model';
import { buttonClasses } from '@/components/ui/button';
import { whatsappHref } from '@/lib/contact';

/**
 * Airport transfer (anchor #transfer). Booked → the details. Not booked → the
 * Storefront API can't add an add-on to an existing booking, so we offer a
 * prefilled WhatsApp message with the transfer price when the villa sells one.
 */
export function TransferBlock({
	trip,
	booked,
	offer,
	currency,
}: {
	trip: Trip;
	booked: AppointmentDetailResponse['addOns'];
	offer: AddOnListItemResponse | null;
	currency: string;
}) {
	const transfer = booked.find((a) => isTransferAddOn(a.addOn));
	const message = encodeURIComponent(
		`Hi Lumbung Sidemen! I'd like an airport transfer for booking ${trip.reference} (${trip.villa.title}, check-in ${trip.checkin}).${trip.flightNumber ? ` Flight ${trip.flightNumber}.` : ''}${trip.arrivalTime ? ` Arriving ${trip.arrivalTime}.` : ''}`,
	);
	return (
		<DetailCard id="transfer" label="Jemputan bandara" title="Airport transfer">
			{transfer ? (
				<div className="flex items-start gap-4">
					<span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-full bg-moss" />
					<div>
						<p className="text-ink">
							{transfer.addOn?.title ?? 'Airport transfer'} is booked{transfer.quantity > 1 ? ` (× ${transfer.quantity})` : ''}.
						</p>
						<p className="mt-1 text-sm text-ink-muted">
							Your driver waits in arrivals at Ngurah Rai (DPS) with a Lumbung sign.{' '}
							{trip.flightNumber ? `We track flight ${trip.flightNumber}, so delays are fine.` : 'Send us your flight number so we can track delays.'} The drive to Sidemen takes about two hours.
						</p>
					</div>
				</div>
			) : (
				<div>
					<p className="text-ink">
						The road up to Sidemen is beautiful and winding. Let our driver bring you from Ngurah Rai (DPS), about two hours.
						{offer ? (
							<>
								{' '}
								<span className="tabular">{formatMoney(offer.price, currency)}</span> per car.
							</>
						) : null}
					</p>
					<p className="mt-2 text-sm text-ink-muted">Extras can’t be added online after booking yet, so message us and we’ll add it to your trip.</p>
					<a href={`${whatsappHref}?text=${message}`} target="_blank" rel="noreferrer" className={buttonClasses('secondary', 'md', { className: 'mt-5' })}>
						Request a transfer on WhatsApp
					</a>
				</div>
			)}
		</DetailCard>
	);
}
