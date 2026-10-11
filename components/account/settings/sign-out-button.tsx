'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
	const [busy, setBusy] = useState(false);
	return (
		<Button
			variant="outline"
			disabled={busy}
			onClick={() => {
				setBusy(true);
				void signOut({ callbackUrl: '/' });
			}}
		>
			{busy ? 'Signing out…' : 'Sign out · Sampai jumpa'}
		</Button>
	);
}
