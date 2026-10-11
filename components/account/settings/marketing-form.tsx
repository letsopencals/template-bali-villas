'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { accountRequest } from '@/components/account/trip-detail/account-fetch';

type Channel = 'email' | 'sms' | 'whatsapp';
type ConsentState = 'not_subscribed' | 'subscribed' | 'unsubscribed';

export interface MarketingFormProps {
	emailState: ConsentState;
	smsState: ConsentState;
	whatsappState: ConsentState;
}

const CHANNELS: { key: Channel; label: string; hint: string }[] = [
	{ key: 'email', label: 'Email', hint: 'Seasonal letters from the valley: harvests, ceremonies, quiet weeks.' },
	{ key: 'whatsapp', label: 'WhatsApp', hint: 'The odd last-minute opening at your favourite villa.' },
	{ key: 'sms', label: 'SMS', hint: 'Rarely, and only offers.' },
];

/** Per-channel opt-in switches; each toggle saves on its own. Trip messages are always sent. */
export function MarketingForm(initial: MarketingFormProps) {
	const [on, setOn] = useState<Record<Channel, boolean>>({
		email: initial.emailState === 'subscribed',
		sms: initial.smsState === 'subscribed',
		whatsapp: initial.whatsappState === 'subscribed',
	});
	const [busy, setBusy] = useState<Channel | null>(null);
	const [error, setError] = useState<string | null>(null);

	const toggle = async (key: Channel) => {
		const next = !on[key];
		setBusy(key);
		setError(null);
		setOn((s) => ({ ...s, [key]: next }));
		try {
			await accountRequest('/api/account/marketing-consent', 'PUT', { [key]: next });
		} catch (err) {
			setOn((s) => ({ ...s, [key]: !next }));
			setError(err instanceof Error ? err.message : 'Could not update your preferences.');
		} finally {
			setBusy(null);
		}
	};

	return (
		<div>
			<ul className="divide-y divide-line">
				{CHANNELS.map((c) => (
					<li key={c.key} className="flex items-center justify-between gap-6 py-4">
						<div>
							<p id={`consent-${c.key}`} className="text-ink">
								{c.label}
							</p>
							<p className="text-sm text-ink-muted">{c.hint}</p>
						</div>
						<button
							type="button"
							role="switch"
							aria-checked={on[c.key]}
							aria-labelledby={`consent-${c.key}`}
							disabled={busy === c.key}
							onClick={() => void toggle(c.key)}
							className={clsx(
								'relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60',
								on[c.key] ? 'bg-jungle' : 'bg-sand-strong',
							)}
						>
							<span
								aria-hidden
								className={clsx('absolute top-1 size-5 rounded-full bg-cream shadow transition-transform', on[c.key] ? 'translate-x-6' : 'translate-x-1')}
							/>
						</button>
					</li>
				))}
			</ul>
			{error ? (
				<p role="alert" className="mt-3 text-sm text-danger">
					{error}
				</p>
			) : null}
			<p className="mt-4 text-sm text-ink-muted">Booking confirmations and messages about your trips are always sent.</p>
		</div>
	);
}
