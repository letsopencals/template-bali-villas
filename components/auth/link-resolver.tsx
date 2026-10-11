'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resolveLink, type ResolveLinkResult } from '@/app/auth/actions/resolve-link';
import { buttonClasses } from '@/components/ui/button';
import { AuthShell } from '@/components/auth/auth-shell';
import { CanangSari } from '@/components/motifs/canang-sari';
import { emailHref, whatsappHref } from '@/lib/contact';
import { normalizeRedirect } from '@/lib/link-redirect';

type ErrorCode = NonNullable<ResolveLinkResult['errorCode']>;

const ERROR_COPY: Record<ErrorCode, { title: string; message: string }> = {
	TOKEN_EXPIRED: {
		title: 'This link has\nrested.',
		message: 'Email links expire after a while to keep your booking safe. Sign in with a code instead; it takes a minute.',
	},
	TOKEN_USED: { title: 'Link already\nused.', message: 'Each link works once. Sign in with a code to carry on.' },
	TOKEN_INVALID: { title: 'We don’t know\nthis link.', message: 'It may be incomplete. Try copying the whole link from the email, or sign in with a code.' },
};

export interface LinkResolverProps {
	token: string;
	image?: string | null;
	imageCaption?: string | null;
}

/**
 * Magic-link landing: resolves the token once (server action), then replaces
 * the URL with the target (normalised to /account/trips/{id}?action=...).
 */
export function LinkResolver({ token, image, imageCaption }: LinkResolverProps) {
	const router = useRouter();
	const [status, setStatus] = useState<'resolving' | 'error'>('resolving');
	const [errorCode, setErrorCode] = useState<ErrorCode>('TOKEN_INVALID');
	const ranRef = useRef(false);

	useEffect(() => {
		if (!token || ranRef.current) return;
		ranRef.current = true;

		(async () => {
			try {
				const result = await resolveLink(token);
				if (result.success && result.redirectPath) {
					router.replace(normalizeRedirect(result.redirectPath));
					router.refresh();
					return;
				}
				setErrorCode(result.errorCode ?? 'TOKEN_INVALID');
			} catch {
				setErrorCode('TOKEN_INVALID');
			}
			setStatus('error');
		})();
	}, [token, router]);

	if (status === 'resolving') {
		return (
			<AuthShell label="Secure link · Tautan aman" title={'Sebentar,\none moment.'} centered image={image} imageCaption={imageCaption}>
				<div className="flex flex-col items-center gap-5 text-sm text-ink-muted" role="status">
					<CanangSari size={72} spinning label="Signing you in" />
					Opening your trip…
				</div>
			</AuthShell>
		);
	}

	const copy = ERROR_COPY[errorCode];
	return (
		<AuthShell
			key="error"
			label="Secure link · Tautan aman"
			title={copy.title}
			intro={copy.message}
			image={image}
			imageCaption={imageCaption}
			footer={
				<>
					Need a hand?{' '}
					<a href={whatsappHref} target="_blank" rel="noreferrer" className="link-underline text-ink hover:text-terracotta-deep">
						WhatsApp us
					</a>{' '}
					or{' '}
					<a href={emailHref} className="link-underline text-ink hover:text-terracotta-deep">
						email the team
					</a>
					.
				</>
			}
		>
			<Link href="/auth/login" className={buttonClasses('primary', 'lg', { fullWidth: true })}>
				Sign in with a code
			</Link>
		</AuthShell>
	);
}
