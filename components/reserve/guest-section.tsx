'use client';

import { useId } from 'react';
import { siteConfig } from '@/lib/site-config';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Field, Input, Select } from '@/components/ui/input';
import type { StayBooking } from '@/hooks/use-stay-booking';
import { SectionError } from './reserve-section';
import { QuestionsFields } from './questions-fields';
import { BillingFields } from './billing-fields';
import type { BillingDraft, CheckoutAsks, ConsentDraft } from './reserve-model';

export interface ArrivalDraft {
	arrivalTime: string;
	flightNumber: string;
	occasion: string;
}

export const EMPTY_ARRIVAL: ArrivalDraft = { arrivalTime: '', flightNumber: '', occasion: '' };

interface GuestSectionProps {
	booking: StayBooking;
	arrival: ArrivalDraft;
	onArrival(next: ArrivalDraft): void;
	asks: CheckoutAsks;
	billing: BillingDraft;
	onBilling(next: BillingDraft): void;
	consent: ConsentDraft;
	onConsent(next: ConsentDraft): void;
	/** Show "required" errors (after a Continue attempt). */
	showErrors: boolean;
	error: string | null;
	busy: boolean;
	continueLabel: string;
	onContinue(): void;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Step 3: lead guest, arrival, occasion, the store's questions, billing and opt-ins. */
export function GuestSection({
	booking,
	arrival,
	onArrival,
	asks,
	billing,
	onBilling,
	consent,
	onConsent,
	showErrors,
	error,
	busy,
	continueLabel,
	onContinue,
}: GuestSectionProps) {
	const uid = useId();
	const fe = booking.fieldErrors;
	const loggedIn = booking.customerId !== null;
	const errFor = (key: string, ok: boolean, msg: string) => fe[key]?.[0] ?? (showErrors && !ok ? msg : undefined);

	return (
		<div className="flex flex-col gap-10">
			<fieldset className="flex flex-col gap-5">
				<legend className="label mb-4">Lead guest</legend>
				<div className="grid gap-5 sm:grid-cols-2">
					<Field label="First name" htmlFor={`${uid}-fn`} error={errFor('firstName', booking.firstName.trim().length > 0, 'Add your first name')}>
						<Input id={`${uid}-fn`} autoComplete="given-name" value={booking.firstName} onChange={(e) => booking.setFirstName(e.target.value)} invalid={showErrors && !booking.firstName.trim()} />
					</Field>
					<Field label="Last name" htmlFor={`${uid}-ln`} error={errFor('lastName', booking.lastName.trim().length > 0, 'Add your last name')}>
						<Input id={`${uid}-ln`} autoComplete="family-name" value={booking.lastName} onChange={(e) => booking.setLastName(e.target.value)} invalid={showErrors && !booking.lastName.trim()} />
					</Field>
					<Field
						label="Email"
						htmlFor={`${uid}-em`}
						hint={loggedIn ? 'From your account.' : 'Your confirmation and house manual go here.'}
						error={errFor('email', loggedIn || EMAIL_RE.test(booking.email.trim()), 'Add an email we can write to')}
					>
						<Input
							id={`${uid}-em`}
							type="email"
							autoComplete="email"
							value={booking.email}
							readOnly={loggedIn}
							onChange={(e) => booking.setEmail(e.target.value)}
							invalid={showErrors && !loggedIn && !EMAIL_RE.test(booking.email.trim())}
						/>
					</Field>
					<Field
						label="Phone or WhatsApp"
						htmlFor={`${uid}-ph`}
						hint="Your driver and host use this on the day."
						error={errFor('phone', booking.phone.trim().length >= 6, 'Add a number with country code')}
					>
						<Input id={`${uid}-ph`} type="tel" autoComplete="tel" placeholder="+44 7700 900123" value={booking.phone} onChange={(e) => booking.setPhone(e.target.value)} invalid={showErrors && booking.phone.trim().length < 6} />
					</Field>
				</div>
			</fieldset>

			<fieldset className="flex flex-col gap-5">
				<legend className="label mb-4">Arrival</legend>
				<div className="grid gap-5 sm:grid-cols-2">
					<Field label="When you expect to arrive" htmlFor={`${uid}-at`} hint="Helps us have tea and the pool ready.">
						<Select id={`${uid}-at`} value={arrival.arrivalTime} onChange={(e) => onArrival({ ...arrival, arrivalTime: e.target.value })}>
							<option value="">Not sure yet</option>
							{siteConfig.arrivalTimes.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</Select>
					</Field>
					<Field label={<>Flight number<span className="normal-case tracking-normal text-ink-dim"> (optional)</span></>} htmlFor={`${uid}-fl`} hint="If you booked the airport transfer.">
						<Input
							id={`${uid}-fl`}
							value={arrival.flightNumber}
							maxLength={12}
							placeholder="GA 404"
							onChange={(e) => onArrival({ ...arrival, flightNumber: e.target.value.toUpperCase() })}
						/>
					</Field>
				</div>
				<div>
					<p className="label pl-5" id={`${uid}-oc`}>
						Celebrating something?
					</p>
					<div role="group" aria-labelledby={`${uid}-oc`} className="mt-3 flex flex-wrap gap-2">
						{siteConfig.occasions.map((o) => (
							<Chip key={o} size="sm" selected={arrival.occasion === o} onClick={() => onArrival({ ...arrival, occasion: arrival.occasion === o ? '' : o })}>
								{o}
							</Chip>
						))}
					</div>
				</div>
			</fieldset>

			{booking.questions.length > 0 ? (
				<fieldset>
					<legend className="label mb-4">A few things for our hosts</legend>
					<QuestionsFields questions={booking.questions} answers={booking.answers} setAnswers={booking.setAnswers} uploads={booking.uploads} />
				</fieldset>
			) : null}

			<BillingFields asks={asks} billing={billing} onBilling={onBilling} consent={consent} onConsent={onConsent} showErrors={showErrors} />

			{error ? <SectionError>{error}</SectionError> : null}
			<div>
				<Button variant="primary" size="lg" pill onClick={onContinue} disabled={busy || booking.uploads.busy}>
					{busy ? 'Holding the villa…' : booking.uploads.busy ? 'Uploading…' : continueLabel}
				</Button>
			</div>
		</div>
	);
}
