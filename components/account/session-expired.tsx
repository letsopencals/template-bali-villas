'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { CanangSari } from '@/components/motifs/canang-sari';
import { Button } from '@/components/ui/button';

/**
 * Shown when the session cookie exists but the API rejects its token. Signing
 * out (instead of redirecting) avoids a login ↔ account redirect loop, because
 * the middleware still sees a session.
 */
export function SessionExpired() {
	const [busy, setBusy] = useState(false);
	return (
		<div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
			<CanangSari size={72} />
			<p className="label mt-8">Sampai jumpa lagi</p>
			<h1 className="display-sm mt-3">Your session has ended.</h1>
			<p className="mt-4 text-ink-muted">For your security we sign you out after a while. Sign in again with a code to see your trips.</p>
			<Button
				className="mt-8"
				disabled={busy}
				onClick={() => {
					setBusy(true);
					void signOut({ callbackUrl: '/auth/login?callbackUrl=%2Faccount' });
				}}
			>
				{busy ? 'Signing out…' : 'Sign in again'}
			</Button>
		</div>
	);
}
