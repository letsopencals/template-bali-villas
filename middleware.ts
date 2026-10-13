import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ACCESS_TOKEN_HEADER, CUSTOMER_ID_HEADER } from '@/lib/session-header';

/**
 * 1. Session: this is the only place the guest's access token gets refreshed and written back
 *    to the session cookie (lib/auth.ts). The fresh token is handed to API routes and /account
 *    pages in the same request (lib/session-header.ts).
 * 2. Account pages need a live session (not just a cookie); auth pages bounce signed-in guests.
 */

/** NextAuth's own endpoints (session, csrf, signin, signout, callback...) refresh and set the cookie themselves. */
const NEXTAUTH_ROUTES = /^\/api\/auth\/(session|csrf|providers|signin|signout|callback|error|verify-request)(\/|$)/;

const withSession = auth((req) => {
	const { pathname, search } = req.nextUrl;
	const accessToken = req.auth?.accessToken;

	// Protect account pages - redirect to the login page without a live session
	if (pathname.startsWith('/account') && !accessToken) {
		const login = new URL('/auth/login', req.url);
		login.searchParams.set('callbackUrl', `${pathname}${search}`);
		return NextResponse.redirect(login);
	}

	// Redirect signed-in guests away from auth pages
	if (pathname.startsWith('/auth') && accessToken) {
		return NextResponse.redirect(new URL('/account', req.url));
	}

	// Only we set these headers: drop whatever the browser sent, then pass the fresh token on.
	const headers = new Headers(req.headers);
	headers.delete(ACCESS_TOKEN_HEADER);
	headers.delete(CUSTOMER_ID_HEADER);
	if (accessToken) {
		headers.set(ACCESS_TOKEN_HEADER, accessToken);
		const customerId = req.auth?.customer?.id;
		if (customerId) headers.set(CUSTOMER_ID_HEADER, customerId);
	}
	return NextResponse.next({ request: { headers } });
});

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
	if (NEXTAUTH_ROUTES.test(req.nextUrl.pathname)) return NextResponse.next();
	return withSession(req, ev as never);
}

export const config = {
	// Account and auth pages (protection) and the API routes (token hand-off).
	matcher: ['/account/:path*', '/auth/:path*', '/api/:path*'],
};
