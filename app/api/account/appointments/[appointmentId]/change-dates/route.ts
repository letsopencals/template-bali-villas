import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-error-handler';
import { siteConfig } from '@/lib/site-config';
import { fromStaySlot, nightsBetween, stayTimesFor, todayIn, toStaySlot } from '@/lib/stay';
import { isRealDate } from '../../../../_lib/guards';

function toIso(value: string): string {
	return /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value.replace(' ', 'T')}Z`;
}

/**
 * PUT { checkin, checkout } (local YYYY-MM-DD) → reschedules the guest's own
 * stay. The UTC slot is built here with `toStaySlot` and the villa's own
 * check-in/out times, so clients never build slots. Only same-length moves are
 * accepted: the backend doesn't reprice an order on reschedule.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ appointmentId: string }> }) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	const { checkin, checkout } = (body ?? {}) as { checkin?: unknown; checkout?: unknown };
	if (!isRealDate(checkin) || !isRealDate(checkout)) {
		return NextResponse.json({ error: 'checkin and checkout must be real YYYY-MM-DD dates' }, { status: 400 });
	}
	if (checkin < todayIn(siteConfig.timezone)) {
		return NextResponse.json({ error: 'Check-in can’t be in the past' }, { status: 400 });
	}
	const nights = nightsBetween(checkin, checkout);
	if (!(nights >= 1)) return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 });

	try {
		const { data: appointment } = await AppointmentService.find({ path: { appointmentId }, headers: auth.headers });
		if (!appointment) return NextResponse.json({ error: 'Trip not found' }, { status: 404 });

		const current = fromStaySlot(toIso(appointment.from), toIso(appointment.to), siteConfig.timezone);
		if (nights !== current.nights) {
			return NextResponse.json(
				{ error: `Online date changes keep the same length (${current.nights} nights). Message us to shorten or extend your stay.` },
				{ status: 422 },
			);
		}
		if (checkin === current.checkin) return NextResponse.json({ error: 'Those are already your dates' }, { status: 422 });

		const slot = {
			productId: appointment.productId,
			locationId: appointment.locationId ?? undefined,
			...toStaySlot(checkin, checkout, siteConfig.timezone, stayTimesFor(appointment.product)),
		};
		const { data } = await AppointmentService.reschedule({
			path: { appointmentId },
			body: { slot, notifyCustomer: true },
			headers: auth.headers,
		});
		return NextResponse.json({ id: data?.id ?? appointmentId, checkin, checkout });
	} catch (err) {
		return handleApiError(err, 'Could not change the dates');
	}
}
