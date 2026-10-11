'use client';

import { memo, useEffect, useId, useState } from 'react';
import dynamic from 'next/dynamic';
import { clsx } from 'clsx';
import type { CartResponse, CustomerProviderCatalogItem } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import { CanangSari } from '@/components/motifs/canang-sari';
import type { StayBooking } from '@/hooks/use-stay-booking';
import { SectionError } from './reserve-section';
import { CheckRow } from './check-row';
import { PromoCode } from './promo-code';
import { emailHref, whatsappHref } from '@/lib/contact';
import { fmtDay, type ReserveVilla } from './reserve-model';

function PaymentLoading({ label = 'Preparing secure payment…' }: { label?: string }) {
	return (
		<div className="flex items-center gap-3 py-4 text-ink-muted" aria-live="polite">
			<CanangSari size={32} spinning label={label} />
			<span className="text-[0.9rem]">{label}</span>
		</div>
	);
}

function StripeLoading() {
	return <PaymentLoading label="Loading card payment…" />;
}

/** No way to pay right now (providers failed to load, came back empty, or the start failed). */
const PaymentUnavailable = memo(function PaymentUnavailable({ onRetry, busy, startFailed }: { onRetry(): void; busy: boolean; startFailed: boolean }) {
	return (
		<div className="flex flex-col gap-4 rounded-[20px] border border-line-strong bg-cream px-5 py-4" role="status">
			<p className="text-[0.95rem]">
				{startFailed ? 'We couldn’t start the payment.' : 'Payment isn’t available right now.'} Try again, or message us and we&rsquo;ll
				finish the booking with you on{' '}
				<a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="link-underline font-medium text-terracotta-deep">
					WhatsApp
				</a>{' '}
				or by{' '}
				<a href={emailHref} className="link-underline font-medium text-terracotta-deep">
					email
				</a>
				.
			</p>
			<div>
				<Button variant="outline" size="md" pill onClick={onRetry} disabled={busy}>
					{busy ? 'Trying again…' : 'Retry'}
				</Button>
			</div>
		</div>
	);
});

const StripePayment = dynamic(() => import('./stripe-payment'), { ssr: false, loading: StripeLoading });

/** Shown when the start response says there's nothing to charge. */
export const NO_PAYMENT = 'no_payment_required';

interface PaymentSectionProps {
	villa: ReserveVilla;
	booking: StayBooking;
	/** The cart to show and pay (promo override or the hold's cart). */
	cart: CartResponse | null;
	onCart(cart: CartResponse): void;
	freeCancelUntil: string | null;
	policyAccepted: boolean;
	onPolicy(accepted: boolean): void;
	payLabel: string;
	registerPay(pay: (() => void) | null): void;
	onRehold(): void;
	/** Clear a failed payment start / provider load and try again. */
	onRetryPayment(): void;
	rehold: { busy: boolean; label: string } | null;
	error: string | null;
}

function ProviderChoice({ providers, onPick, busy }: { providers: CustomerProviderCatalogItem[]; onPick(name: string): void; busy: boolean }) {
	return (
		<div role="radiogroup" aria-label="How would you like to pay" className="flex flex-col gap-3">
			{providers.map((p) => (
				<button
					key={p.name}
					type="button"
					role="radio"
					aria-checked={false}
					disabled={busy}
					onClick={() => onPick(p.name)}
					className="flex items-center justify-between gap-4 rounded-[20px] border border-line-strong bg-cream px-5 py-4 text-left transition-colors hover:border-terracotta disabled:opacity-50"
				>
					<span>
						<span className="block font-medium">{p.displayName}</span>
						{p.description ? <span className="block text-[0.85rem] text-ink-muted">{p.description}</span> : null}
					</span>
					<span aria-hidden className="h-4 w-4 shrink-0 rounded-full border border-line-strong" />
				</button>
			))}
		</div>
	);
}

/** Step 4: promo code, policy consent, then Stripe / no-payment / manual confirm. */
export function PaymentSection({
	villa,
	booking,
	cart,
	onCart,
	freeCancelUntil,
	policyAccepted,
	onPolicy,
	payLabel,
	registerPay,
	onRehold,
	onRetryPayment,
	rehold,
	error,
}: PaymentSectionProps) {
	const uid = useId();
	const [rulesOpen, setRulesOpen] = useState(false);
	const { providers, provider, paymentData, selectProvider, submitCheckout, submitting, providersLoaded, providersFailed, providerFailed } = booking;
	// Single provider whose start failed, or nothing to pick from once the list is in.
	const unavailable = !provider && !submitting && (providersFailed || (providersLoaded && providers.length === 0) || (providerFailed && providers.length === 1));
	const responseProvider = paymentData?.provider as string | undefined;
	const manual = responseProvider === 'cash' || responseProvider === 'bank_transfer';
	const confirmOnly = responseProvider === NO_PAYMENT || manual;

	// Confirm-only branches register their own trigger for the sticky bar.
	useEffect(() => {
		if (!confirmOnly) return;
		registerPay(policyAccepted && !submitting ? () => void submitCheckout() : null);
		return () => registerPay(null);
	}, [confirmOnly, policyAccepted, submitting, submitCheckout, registerPay]);

	if (rehold) {
		return (
			<div className="flex flex-col gap-4">
				<p className="text-[0.95rem] text-ink-muted">Your details changed since we held {villa.title}, so we need to update the hold before you pay.</p>
				{error ? <SectionError>{error}</SectionError> : null}
				<div>
					<Button variant="primary" size="lg" pill onClick={onRehold} disabled={rehold.busy}>
						{rehold.busy ? 'Updating your hold…' : rehold.label}
					</Button>
				</div>
			</div>
		);
	}

	const policy = (
		<CheckRow checked={policyAccepted} onChange={onPolicy} required>
			{villa.allowCustomerCancel && freeCancelUntil ? (
				<>
					I understand I can cancel for free until <span className="tabular font-medium">{fmtDay(freeCancelUntil)}</span> from my trip page, and that
					later changes go through the team.{' '}
				</>
			) : (
				<>I understand changes and cancellations for this stay go through the team. </>
			)}
			I&rsquo;ll respect the{' '}
			<button type="button" className="link-underline font-medium text-terracotta-deep" aria-expanded={rulesOpen} aria-controls={`${uid}-rules`} onClick={() => setRulesOpen((v) => !v)}>
				house rules
			</button>
			.
		</CheckRow>
	);

	return (
		<div className="flex flex-col gap-7">
			{cart ? <PromoCode cartId={cart.id} appliedCode={cart.appliedDiscountCode} onCart={onCart} /> : null}

			<div className="flex flex-col gap-3 rounded-[24px] border border-line bg-paper-deep/60 p-5">
				{policy}
				{rulesOpen ? (
					<ul id={`${uid}-rules`} className="ml-9 list-disc space-y-1 pl-4 text-[0.88rem] text-ink-muted">
						{villa.houseRules.length > 0 ? villa.houseRules.map((r) => <li key={r}>{r}</li>) : <li>Quiet hours from 22:00. No parties or events. Please treat the house as a home.</li>}
					</ul>
				) : null}
			</div>

			{paymentData?.provider === 'stripe' && paymentData.clientSecret ? (
				<div className={clsx('transition-opacity duration-300', !policyAccepted && 'opacity-70')}>
					<StripePayment
						key={paymentData.clientSecret}
						clientSecret={paymentData.clientSecret}
						publishableKey={paymentData.publishableKey}
						stripeAccountId={paymentData.stripeAccountId}
						payLabel={payLabel}
						disabled={!policyAccepted || submitting}
						onSuccess={(id) => void submitCheckout(id)}
						onError={(m) => booking.setError(m)}
						registerPay={registerPay}
					/>
					{!policyAccepted ? <p className="mt-3 text-center text-[0.82rem] text-ink-muted">Tick the box above to pay.</p> : null}
				</div>
			) : confirmOnly ? (
				<div className="flex flex-col gap-4">
					<p className="text-[0.95rem]">
						{responseProvider === NO_PAYMENT
							? 'Nothing to pay today. Confirm and the villa is yours.'
							: manual
								? (providers.find((p) => p.name === responseProvider)?.description ?? 'You pay our team directly. Details are in your confirmation email.')
								: null}
					</p>
					<Button variant="primary" size="lg" pill fullWidth onClick={() => void submitCheckout()} disabled={!policyAccepted || submitting}>
						{submitting ? 'Confirming…' : 'Confirm booking'}
					</Button>
				</div>
			) : !provider && providers.length > 1 && !providersFailed ? (
				<ProviderChoice providers={providers} onPick={(n) => void selectProvider(n)} busy={submitting} />
			) : unavailable ? (
				<PaymentUnavailable onRetry={onRetryPayment} busy={submitting} startFailed={providerFailed && !providersFailed} />
			) : (
				<PaymentLoading />
			)}

			{error ? <SectionError>{error}</SectionError> : null}
			{paymentData?.provider === 'stripe' ? (
				<p className="flex items-center gap-2 text-[0.8rem] text-ink-muted">
					<LockGlyph /> Payments are encrypted and processed by Stripe. We never see your card.
				</p>
			) : null}
		</div>
	);
}

export function LockGlyph({ className = 'h-3.5 w-3.5' }: { className?: string }) {
	return (
		<svg aria-hidden viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
			<rect x="3" y="7" width="10" height="7" rx="2" />
			<path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
		</svg>
	);
}
