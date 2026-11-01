'use client';

import { useId, useMemo } from 'react';
import { Field, Input, Select, fieldDescribedBy } from '@/components/ui/input';
import type { FieldErrorMap } from '@/lib/field-errors';
import { CheckRow } from './check-row';
import { countryOptions, type BillingDraft, type CheckoutAsks, type ConsentDraft } from './reserve-model';

interface BillingFieldsProps {
	asks: CheckoutAsks;
	billing: BillingDraft;
	onBilling(next: BillingDraft): void;
	consent: ConsentDraft;
	onConsent(next: ConsentDraft): void;
	showErrors: boolean;
	/** API errors keyed `billingAddress.<field>` (see lib/field-errors). */
	fieldErrors?: FieldErrorMap;
	onClearFieldError?(key: string): void;
}

function req(r: 'hidden' | 'optional' | 'required') {
	return r === 'required' ? <span className="text-terracotta"> *</span> : <span className="normal-case tracking-normal text-ink-dim"> (optional)</span>;
}

/** Billing address and marketing opt-ins, each only when the store's checkout settings ask for them. */
export function BillingFields({ asks, billing, onBilling, consent, onConsent, showErrors, fieldErrors = {}, onClearFieldError }: BillingFieldsProps) {
	const uid = useId();
	const countries = useMemo(() => countryOptions(), []);
	const set = (key: keyof BillingDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		onBilling({ ...billing, [key]: e.target.value });
		onClearFieldError?.(`billingAddress.${key}`);
	};
	/** The API's message for the field, else "required" after a Continue attempt. */
	const missing = (key: keyof BillingDraft, required: boolean) =>
		fieldErrors[`billingAddress.${key}`]?.join(' ') || (showErrors && required && !billing[key].trim() ? 'Needed for your invoice' : undefined);
	/** aria-invalid and aria-describedby for a control whose Field shows `error`. */
	const a11y = (id: string, error: string | undefined) => ({ invalid: !!error, 'aria-describedby': fieldDescribedBy(id, error) });
	const showAddress = asks.billing !== 'hidden';
	const showCompany = asks.company !== 'hidden';
	const showVat = asks.vat !== 'hidden';
	const anyConsent = asks.consent.email || asks.consent.sms || asks.consent.whatsapp;
	const addrRequired = asks.billing === 'required';
	const errors = {
		companyName: missing('companyName', asks.company === 'required'),
		taxRegistrationId: missing('taxRegistrationId', asks.vat === 'required'),
		addressLine1: missing('addressLine1', addrRequired),
		addressLine2: missing('addressLine2', false),
		city: missing('city', addrRequired),
		state: missing('state', false),
		postalCode: missing('postalCode', addrRequired),
		country: missing('country', addrRequired),
	};

	return (
		<>
			{showAddress || showCompany || showVat ? (
				<fieldset className="flex flex-col gap-5">
					<legend className="label mb-4">Billing details</legend>
					{showCompany || showVat ? (
						<div className="grid gap-5 sm:grid-cols-2">
							{showCompany ? (
								<Field label={<>Company{req(asks.company)}</>} htmlFor={`${uid}-co`} error={errors.companyName}>
									<Input id={`${uid}-co`} {...a11y(`${uid}-co`, errors.companyName)} autoComplete="organization" value={billing.companyName} onChange={set('companyName')} />
								</Field>
							) : null}
							{showVat ? (
								<Field label={<>VAT or tax number{req(asks.vat)}</>} htmlFor={`${uid}-vat`} error={errors.taxRegistrationId}>
									<Input id={`${uid}-vat`} {...a11y(`${uid}-vat`, errors.taxRegistrationId)} value={billing.taxRegistrationId} onChange={set('taxRegistrationId')} />
								</Field>
							) : null}
						</div>
					) : null}
					{showAddress ? (
						<>
							<Field label={<>Address{req(asks.billing)}</>} htmlFor={`${uid}-a1`} error={errors.addressLine1}>
								<Input id={`${uid}-a1`} {...a11y(`${uid}-a1`, errors.addressLine1)} autoComplete="address-line1" value={billing.addressLine1} onChange={set('addressLine1')} />
							</Field>
							<Field label="Address line 2" htmlFor={`${uid}-a2`} error={errors.addressLine2}>
								<Input id={`${uid}-a2`} {...a11y(`${uid}-a2`, errors.addressLine2)} autoComplete="address-line2" value={billing.addressLine2} onChange={set('addressLine2')} />
							</Field>
							<div className="grid gap-5 sm:grid-cols-2">
								<Field label={<>City{req(asks.billing)}</>} htmlFor={`${uid}-city`} error={errors.city}>
									<Input id={`${uid}-city`} {...a11y(`${uid}-city`, errors.city)} autoComplete="address-level2" value={billing.city} onChange={set('city')} />
								</Field>
								<Field label="State or region" htmlFor={`${uid}-state`} error={errors.state}>
									<Input id={`${uid}-state`} {...a11y(`${uid}-state`, errors.state)} autoComplete="address-level1" value={billing.state} onChange={set('state')} />
								</Field>
								<Field label={<>Postcode{req(asks.billing)}</>} htmlFor={`${uid}-zip`} error={errors.postalCode}>
									<Input id={`${uid}-zip`} {...a11y(`${uid}-zip`, errors.postalCode)} autoComplete="postal-code" value={billing.postalCode} onChange={set('postalCode')} />
								</Field>
								<Field label={<>Country{req(asks.billing)}</>} htmlFor={`${uid}-country`} error={errors.country}>
									<Select id={`${uid}-country`} {...a11y(`${uid}-country`, errors.country)} autoComplete="country" value={billing.country} onChange={set('country')}>
										<option value="">Choose…</option>
										{countries.map((c) => (
											<option key={c.code} value={c.code}>
												{c.name}
											</option>
										))}
									</Select>
								</Field>
							</div>
						</>
					) : null}
				</fieldset>
			) : null}
			{anyConsent ? (
				<fieldset className="flex flex-col gap-3">
					<legend className="label mb-3">Staying in touch</legend>
					{asks.consent.email ? (
						<CheckRow checked={consent.email} onChange={(c) => onConsent({ ...consent, email: c })}>
							Send me the occasional letter from Sidemen by email: new houses, quiet seasons, rice harvest dates.
						</CheckRow>
					) : null}
					{asks.consent.sms ? (
						<CheckRow checked={consent.sms} onChange={(c) => onConsent({ ...consent, sms: c })}>
							Text me offers and news.
						</CheckRow>
					) : null}
					{asks.consent.whatsapp ? (
						<CheckRow checked={consent.whatsapp} onChange={(c) => onConsent({ ...consent, whatsapp: c })}>
							Message me offers and news on WhatsApp.
						</CheckRow>
					) : null}
				</fieldset>
			) : null}
		</>
	);
}
