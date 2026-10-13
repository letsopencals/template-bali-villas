import { signOut } from 'next-auth/react';

let leaving = false;

/**
 * An account call came back 401: the session cookie outlived the guest's session (refresh
 * token expired or replaced by a sign-in elsewhere). Clear it and send them to sign in, coming
 * back to this page after. Client only.
 */
export function onSessionExpired() {
	if (leaving || typeof window === 'undefined') return;
	leaving = true;
	const back = window.location.pathname + window.location.search;
	void signOut({ callbackUrl: `/auth/login?callbackUrl=${encodeURIComponent(back)}` });
}
