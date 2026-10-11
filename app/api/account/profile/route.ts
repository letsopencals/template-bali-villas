import '@/lib/opencals';
import { SelfService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

// The SDK profile type carries more than the UI needs (including a password field); return only these.
const publicProfile = <T extends { firstName?: unknown; lastName?: unknown; email?: unknown; phone?: unknown }>(p: T | undefined) =>
	p ? { firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone } : null;

export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await SelfService.getProfile({ headers: auth.headers });
		return NextResponse.json(publicProfile(data));
	} catch (err) {
		return handleApiError(err);
	}
}

export async function PUT(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const raw = ((await request.json()) ?? {}) as Record<string, unknown>;
		// Strings only (trimmed, capped); anything else is left out of the update.
		const body: { firstName?: string; lastName?: string; phone?: string } = {};
		for (const key of ['firstName', 'lastName', 'phone'] as const) {
			const v = raw[key];
			if (typeof v === 'string') body[key] = v.trim().slice(0, key === 'phone' ? 40 : 100);
		}
		const { data } = await SelfService.updateProfile({ body, headers: auth.headers });
		return NextResponse.json(publicProfile(data));
	} catch (err) {
		return handleApiError(err);
	}
}
