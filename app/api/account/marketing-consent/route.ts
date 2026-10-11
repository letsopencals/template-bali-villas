import '@/lib/opencals';
import { SelfService, type MarketingConsentInput } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-error-handler';

const CHANNELS = ['email', 'sms', 'whatsapp'] as const;

/** The guest's marketing preferences per channel. */
export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;
	try {
		const { data } = await SelfService.getMarketingConsent({ headers: auth.headers });
		return NextResponse.json(
			data ? { emailState: data.emailState, smsState: data.smsState, whatsappState: data.whatsappState } : null,
		);
	} catch (err) {
		return handleApiError(err);
	}
}

/** PUT { email?, sms?, whatsapp? } (booleans only). */
export async function PUT(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	const input: MarketingConsentInput = {};
	for (const c of CHANNELS) {
		const v = (body as Record<string, unknown> | null)?.[c];
		if (typeof v === 'boolean') input[c] = v;
	}
	if (Object.keys(input).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

	try {
		const { data } = await SelfService.updateMarketingConsent({ body: input, headers: auth.headers });
		return NextResponse.json(
			data ? { emailState: data.emailState, smsState: data.smsState, whatsappState: data.whatsappState } : null,
		);
	} catch (err) {
		return handleApiError(err, 'Could not update your preferences');
	}
}
