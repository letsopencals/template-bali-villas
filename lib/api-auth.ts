import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_HEADER, CUSTOMER_ID_HEADER } from '@/lib/session-header';

/**
 * The signed-in guest's access token, as refreshed by the middleware for this request
 * (see lib/session-header.ts). Null when signed out or the session has expired.
 * Only available in API routes and /account pages (the middleware's matcher).
 */
export async function getAccessToken(): Promise<string | null> {
	return (await headers()).get(ACCESS_TOKEN_HEADER) || null;
}

/** The signed-in guest's customer id (from the same session as `getAccessToken`), or null. */
export async function getSessionCustomerId(): Promise<string | null> {
	const h = await headers();
	return h.get(ACCESS_TOKEN_HEADER) ? h.get(CUSTOMER_ID_HEADER) || null : null;
}

/**
 * Returns auth headers for SDK calls, or a 401 NextResponse if not authenticated.
 */
export async function requireAuth(): Promise<
	| { headers: { Authorization: string }; error?: never }
	| { headers?: never; error: NextResponse }
> {
	const token = await getAccessToken();
	if (!token) {
		return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
	}
	return { headers: { Authorization: `Bearer ${token}` } };
}
