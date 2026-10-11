'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { FIELD_LABEL, Notice } from '@/components/auth/auth-feedback';

/**
 * Passwordless sign-in: email → 6-digit code (the `login-code` provider).
 * Emails also carry a magic link that lands on /link/[token]. There is no
 * password or sign-up step: an account is created when a guest books.
 * The page (RSC) reads the query and picks the photo; this is the client form.
 */

const emailSchema = z.string().min(1, 'Email is required').email('Please enter a valid email');

type Step = 'email' | 'code';

const TEXT_LINK = 'w-full text-center text-sm text-ink-muted transition-colors hover:text-terracotta-deep disabled:opacity-40';

const INTRO: Record<Step, string> = {
	email: 'Sign in to see your stays, change dates, add arrival details and download receipts. No password: we email you a code.',
	code: 'Cek email Anda. Enter the code we just sent.',
};

const TITLE: Record<Step, string> = {
	email: 'Selamat\ndatang.',
	code: 'Check your\ninbox.',
};

export interface LoginFormProps {
	/** Same-site path to go to after sign-in (already validated by the page). */
	callbackUrl: string;
	initialEmail?: string;
	image?: string | null;
	imageCaption?: string | null;
}

export function LoginForm({ callbackUrl, initialEmail = '', image, imageCaption }: LoginFormProps) {
	const router = useRouter();

	const [step, setStep] = useState<Step>('email');
	const [email, setEmail] = useState(initialEmail);
	const [code, setCode] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown <= 0) return;
		const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(id);
	}, [cooldown]);

	const sendCode = async () => {
		setError(null);
		const parsed = emailSchema.safeParse(email.trim());
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? 'Please enter a valid email');
			return;
		}
		setLoading(true);
		try {
			const res = await fetch('/api/auth/request-login-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: parsed.data }),
			});
			if (!res.ok && res.status !== 404) throw new Error('request failed');
			setCooldown(60);
			setCode('');
			setStep('code');
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const verifyCode = async () => {
		setError(null);
		if (code.trim().length < 6) {
			setError('Enter the 6-digit code from your email.');
			return;
		}
		setLoading(true);
		try {
			const result = await signIn('login-code', { email: email.trim(), code: code.trim(), redirect: false });
			if (result?.error) {
				setError('That code is invalid or expired. Please try again.');
			} else {
				router.push(callbackUrl);
				router.refresh();
			}
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const useDifferentEmail = () => {
		setError(null);
		setCode('');
		setStep('email');
	};

	return (
		<AuthShell
			title={TITLE[step]}
			intro={INTRO[step]}
			image={image}
			imageCaption={imageCaption}
			footer={
				<>
					No account yet? One is made for you when you book. <AuthLink href="/villas">See the villas</AuthLink>
				</>
			}
		>
			{error ? <Notice className="mb-6">{error}</Notice> : null}

			{step === 'email' ? (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void sendCode();
					}}
					className="space-y-5"
				>
					<div>
						<label htmlFor="login-email" className={FIELD_LABEL}>
							Email
						</label>
						<Input
							id="login-email"
							type="email"
							autoComplete="email"
							autoFocus
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
						/>
					</div>
					<Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
						{loading ? 'Sending…' : 'Email me a code'}
					</Button>
				</form>
			) : (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						void verifyCode();
					}}
					className="space-y-5"
				>
					<p className="text-sm text-ink-muted">
						We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>. It also has a link you can tap instead.
					</p>
					<Input
						type="text"
						inputMode="numeric"
						autoComplete="one-time-code"
						autoFocus
						maxLength={6}
						value={code}
						onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
						placeholder="000000"
						aria-label="6-digit login code"
						className="tabular h-14 text-center text-xl tracking-[0.6em]"
					/>
					<Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
						{loading ? 'Checking…' : 'Sign in'}
					</Button>
					<button type="button" onClick={() => void sendCode()} disabled={cooldown > 0 || loading} className={TEXT_LINK}>
						{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
					</button>
					<button type="button" onClick={useDifferentEmail} className={TEXT_LINK}>
						Use a different email
					</button>
				</form>
			)}
		</AuthShell>
	);
}
