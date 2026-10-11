import '@/lib/opencals';
import { CartService, OpencalsApiError } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { readCartId } from '../cart-id';
import { publicPayload } from '@/lib/public-payload';

/**
 * Promo codes on the cart. Both return the updated `CartResponse`.
 * A backend 404 (unknown code) is passed on as 400, so the client can tell a
 * rejected code apart from this route not existing.
 */
function promoError(err: unknown) {
	if (err instanceof OpencalsApiError && err.status === 404) {
		return NextResponse.json({ error: err.message || 'That code didn’t work.' }, { status: 400 });
	}
	return handleApiError(err);
}

async function headersFor(request: NextRequest) {
	const token = await getAccessToken();
	return { Authorization: `Bearer ${token ?? ''}`, 'X-Cart-Id': readCartId(request) };
}

export async function POST(request: NextRequest) {
	const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
	const code = typeof body?.code === 'string' ? body.code.trim().slice(0, 100) : '';
	if (!code) return NextResponse.json({ error: 'Enter a code.' }, { status: 400 });

	try {
		const { data } = await CartService.applyCode({ body: { code }, headers: await headersFor(request), throwOnError: true });
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return promoError(err);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { data } = await CartService.removeCode({ headers: await headersFor(request), throwOnError: true });
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return promoError(err);
	}
}
