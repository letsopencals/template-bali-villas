'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadStripe, type Appearance } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';


/** Stripe Elements on paper: cream fields, terracotta focus, pill-ish 14px radius, Figtree. */
const APPEARANCE: Appearance = {
	theme: 'flat',
	variables: {
		colorPrimary: '#b4502e',
		colorBackground: '#fbf8f2',
		colorText: '#1e1a16',
		colorTextSecondary: '#6b6158',
		colorTextPlaceholder: '#9a8f84',
		colorDanger: '#a23b2a',
		fontFamily: 'Figtree, system-ui, sans-serif',
		spacingUnit: '4px',
		borderRadius: '14px',
	},
	rules: {
		'.Input': { border: '1px solid rgba(30, 26, 22, 0.18)', boxShadow: 'none', padding: '12px 16px' },
		'.Input:focus': { border: '1px solid #b4502e', boxShadow: '0 0 0 1px #b4502e' },
		'.Tab': { border: '1px solid rgba(30, 26, 22, 0.18)', boxShadow: 'none' },
		'.Tab--selected': { border: '1px solid #b4502e', backgroundColor: '#f4eee4' },
		'.Label': { fontWeight: '600', fontSize: '12px', letterSpacing: '0.04em', color: '#6b6158' },
	},
};

const ELEMENT_OPTIONS = { layout: 'tabs' as const };

export interface StripePaymentProps {
	clientSecret: string;
	/** Per-mode (test/live) key from the checkout start response; falls back to the env key. */
	publishableKey?: string | null;
	stripeAccountId?: string | null;
	/** "Pay $1,240". */
	payLabel: string;
	/** Policy not accepted yet etc. */
	disabled?: boolean;
	onSuccess(paymentIntentId: string): void;
	onError(message: string): void;
	/** Registers a pay trigger for the mobile sticky bar (null when not ready). */
	registerPay?(pay: (() => void) | null): void;
}

/** Stripe Payment Element + a terracotta "Pay $total" button. Loaded with next/dynamic (ssr: false). */
export default function StripePayment({ clientSecret, publishableKey, stripeAccountId, payLabel, disabled, onSuccess, onError, registerPay }: StripePaymentProps) {
	const key = publishableKey;
	const stripePromise = useMemo(() => (key ? loadStripe(key, stripeAccountId ? { stripeAccount: stripeAccountId } : undefined) : null), [key, stripeAccountId]);
	const options = useMemo(() => ({ clientSecret, appearance: APPEARANCE }), [clientSecret]);

	if (!stripePromise) {
		return (
			<p role="alert" className="rounded-[20px] border border-danger/25 bg-danger/[0.06] px-5 py-4 text-[0.92rem]">
				Card payments aren&rsquo;t set up for this site yet. Write to us and we&rsquo;ll hold the villa while we sort it out.
			</p>
		);
	}
	return (
		<Elements stripe={stripePromise} options={options}>
			<StripeForm payLabel={payLabel} disabled={disabled} onSuccess={onSuccess} onError={onError} registerPay={registerPay} />
		</Elements>
	);
}

type StripeFormProps = Pick<StripePaymentProps, 'payLabel' | 'disabled' | 'onSuccess' | 'onError' | 'registerPay'>;

function StripeForm({ payLabel, disabled, onSuccess, onError, registerPay }: StripeFormProps) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);
	const [ready, setReady] = useState(false);

	const pay = useCallback(async () => {
		if (!stripe || !elements || processing || disabled) return;
		setProcessing(true);
		try {
			const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
			if (error) onError(error.message ?? 'Your card was not charged. Try again or use another card.');
			else if (paymentIntent?.id) onSuccess(paymentIntent.id);
			else onError('We could not confirm the payment. Your card was not charged.');
		} catch (err) {
			onError(err instanceof Error ? err.message : 'Payment failed');
		} finally {
			setProcessing(false);
		}
	}, [stripe, elements, processing, disabled, onError, onSuccess]);

	const canPay = !!stripe && !!elements && ready && !processing && !disabled;

	useEffect(() => {
		if (!registerPay) return;
		registerPay(canPay ? () => void pay() : null);
		return () => registerPay(null);
	}, [registerPay, canPay, pay]);

	return (
		<div className="flex flex-col gap-6">
			<PaymentElement options={ELEMENT_OPTIONS} onReady={() => setReady(true)} />
			<Button variant="primary" size="lg" pill fullWidth onClick={() => void pay()} disabled={!canPay} aria-busy={processing}>
				{processing ? 'Confirming with your bank…' : payLabel}
			</Button>
		</div>
	);
}
