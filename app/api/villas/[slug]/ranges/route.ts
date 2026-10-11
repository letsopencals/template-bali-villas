import '@/lib/opencals';
import { ProductService, type CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment-timezone';
import { handleApiError } from '@/lib/api-error-handler';
import { siteConfig } from '@/lib/site-config';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Merged availability ranges for one villa.
 *
 * GET /api/villas/{slug}/ranges?from=YYYY-MM-DD&to=YYYY-MM-DD[&timezone][&locationId][&duration]
 *
 * Wraps `ProductService.getCurrentAvailabilitiesMerged` (one call, full booking
 * horizon). On the villas' continuous schedule a range spans every free night
 * between bookings. `from` / `to` are optional local dates (in `timezone`,
 * default Asia/Makassar) and only trim the response to ranges that overlap
 * [from 00:00, to+1 00:00). `duration` (seconds) asks the backend for ranges
 * long enough for that stay. The response is `CurrentAvailabilitySlot[]` with
 * UTC dates/times, the same as the SDK; nights are checked on the client with
 * `lib/stay.ts` (`isNightAvailable`, `latestCheckout`, `fitsStay`).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const sp = request.nextUrl.searchParams;
	const timezone = sp.get('timezone') || siteConfig.timezone;
	const locationId = sp.get('locationId') || undefined;
	const duration = sp.get('duration') || undefined;
	if (duration && !/^\d+$/.test(duration)) {
		return NextResponse.json({ error: 'duration must be whole seconds' }, { status: 400 });
	}
	const from = sp.get('from');
	const to = sp.get('to');

	if ((from && !DATE_RE.test(from)) || (to && !DATE_RE.test(to))) {
		return NextResponse.json({ error: 'from/to must be YYYY-MM-DD' }, { status: 400 });
	}
	if (!moment.tz.zone(timezone)) {
		return NextResponse.json({ error: 'Unknown timezone' }, { status: 400 });
	}

	try {
		const { data: product } = await ProductService.getBySlug({ path: { slug }, throwOnError: true });

		const { data } = await ProductService.getCurrentAvailabilitiesMerged({
			path: { productId: product.id },
			query: { timezone, locationId, duration },
			throwOnError: true,
		});
		const ranges: CurrentAvailabilitySlot[] = Array.isArray(data) ? data : [];

		const windowStart = from ? moment.tz(from, 'YYYY-MM-DD', timezone).valueOf() : -Infinity;
		const windowEnd = to ? moment.tz(to, 'YYYY-MM-DD', timezone).add(1, 'day').valueOf() : Infinity;

		const trimmed = ranges.filter((r) => {
			const start = Date.parse(`${r.fromDate}T${r.fromTime}Z`);
			const end = Date.parse(`${r.toDate}T${r.toTime}Z`);
			return end > windowStart && start < windowEnd;
		});

		return NextResponse.json(trimmed);
	} catch (err) {
		return handleApiError(err);
	}
}
