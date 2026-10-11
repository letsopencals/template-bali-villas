import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
	const { pathname } = req.nextUrl;
	const isAuthenticated = !!req.auth;

	// Protect account pages - redirect to the login page if not authenticated
	if (pathname.startsWith('/account')) {
		if (!isAuthenticated) {
			const login = new URL('/auth/login', req.url);
			login.searchParams.set('callbackUrl', `${pathname}${req.nextUrl.search}`);
			return NextResponse.redirect(login);
		}
	}

	// Redirect authenticated users away from auth pages
	if (pathname.startsWith('/auth')) {
		if (isAuthenticated) {
			return NextResponse.redirect(new URL('/account', req.url));
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: ['/account/:path*', '/auth/:path*'],
};
