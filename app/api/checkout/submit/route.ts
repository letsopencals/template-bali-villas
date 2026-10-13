import '@/lib/opencals';
import { CheckoutService, type SubmitCheckout } from '@opencals/storefront-sdk';
import { getAccessToken, getSessionCustomerId } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { toCheckoutCustomer } from '../customer-payload';
import { shortString } from '../../_lib/guards';

/**
 * POST { stripePaymentIntentId?, trackingData?: { gclid? }, customer?, deliveryAddress? }
 * → CheckoutResponse ({ order, customer, auth? }). `appointmentsSettings` is set
 * server-side ({ markAsScheduled: true }); anything the client sends there is ignored.
 */
export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const raw = (await request.json()) as Record<string, unknown>;
		const token = await getAccessToken();
		const customer = toCheckoutCustomer(raw.customer, raw.deliveryAddress, await getSessionCustomerId());
		const tracking = raw.trackingData && typeof raw.trackingData === 'object' ? (raw.trackingData as Record<string, unknown>) : null;
		const gclid = shortString(tracking?.gclid);
		const body: SubmitCheckout = {
			...(shortString(raw.stripePaymentIntentId) ? { stripePaymentIntentId: shortString(raw.stripePaymentIntentId) } : {}),
			// Built here, not taken from the client: a booking is always confirmed straight away.
			appointmentsSettings: { markAsScheduled: true },
			...(gclid ? { trackingData: { gclid } } : {}),
			// Cast: `customer.deliveryAddress` is accepted by the API but missing from SDK 0.3.14 types.
			...(customer ? { customer: customer as SubmitCheckout['customer'] } : {}),
		};
		const { data } = await CheckoutService.submit({
			body,
			headers: { Authorization: `Bearer ${token ?? ''}`, 'X-Cart-Id': cartId },
			throwOnError: true,
		});
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err, 'Checkout failed');
	}
}
