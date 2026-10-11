'use client';

import { useId, useMemo } from 'react';
import { Field, Input, Select } from '@/components/ui/input';
import { CheckRow } from './check-row';
import { countryOptions, type BillingDraft, type CheckoutAsks, type ConsentDraft } from './reserve-model';

interface BillingFieldsProps {
	asks: CheckoutAsks;
	billing: BillingDraft;
	onBilling(next: BillingDraft): void;
	consent: ConsentDraft;
	onConsent(next: ConsentDraft): void;
	showErrors: boolean;
}

function req(r: 'hidden' | 'optional' | 'required') {
	return r === 'required' ? <span className="text-terracotta"> *</span> : <span className="normal-case tracking-normal text-ink-dim"> (optional)</span>;
}

/** Billing address and marketing opt-ins, each only when the store's checkout settings ask for them. */
export function BillingFields({ asks, billing, onBilling, consent, onConsent, showErrors }: BillingFieldsProps) {
	const uid = useId();
	const countries = useMemo(() => countryOptions(), []);
	const set = (key: keyof BillingDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onBilling({ ...billing, [key]: e.target.value });
	const missing = (key: keyof BillingDraft, required: boolean) => (showErrors && required && !billing[key].trim() ? 'Needed for your invoice' : undefined);
	const showAddress = asks.billing !== 'hidden';
	const showCompany = asks.company !== 'hidden';
	const showVat = asks.vat !== 'hidden';
	const anyConsent = asks.consent.email || asks.consent.sms || asks.consent.whatsapp;
	const addrRequired = asks.billing === 'required';

	return (
		<>
			{showAddress || showCompany || showVat ? (
				<fieldset className="flex flex-col gap-5">
					<legend className="label mb-4">Billing details</legend>
					{showCompany || showVat ? (
						<div className="grid gap-5 sm:grid-cols-2">
							{showCompany ? (
								<Field label={<>Company{req(asks.company)}</>} htmlFor={`${uid}-co`} error={missing('companyName', asks.company === 'required')}>
									<Input id={`${uid}-co`} autoComplete="organization" value={billing.companyName} onChange={set('companyName')} />
								</Field>
							) : null}
							{showVat ? (
								<Field label={<>VAT or tax number{req(asks.vat)}</>} htmlFor={`${uid}-vat`} error={missing('taxRegistrationId', asks.vat === 'required')}>
									<Input id={`${uid}-vat`} value={billing.taxRegistrationId} onChange={set('taxRegistrationId')} />
								</Field>
							) : null}
						</div>
					) : null}
					{showAddress ? (
						<>
							<Field label={<>Address{req(asks.billing)}</>} htmlFor={`${uid}-a1`} error={missing('addressLine1', addrRequired)}>
								<Input id={`${uid}-a1`} autoComplete="address-line1" value={billing.addressLine1} onChange={set('addressLine1')} />
							</Field>
							<Field label="Address line 2" htmlFor={`${uid}-a2`}>
								<Input id={`${uid}-a2`} autoComplete="address-line2" value={billing.addressLine2} onChange={set('addressLine2')} />
							</Field>
							<div className="grid gap-5 sm:grid-cols-2">
								<Field label={<>City{req(asks.billing)}</>} htmlFor={`${uid}-city`} error={missing('city', addrRequired)}>
									<Input id={`${uid}-city`} autoComplete="address-level2" value={billing.city} onChange={set('city')} />
								</Field>
								<Field label="State or region" htmlFor={`${uid}-state`}>
									<Input id={`${uid}-state`} autoComplete="address-level1" value={billing.state} onChange={set('state')} />
								</Field>
								<Field label={<>Postcode{req(asks.billing)}</>} htmlFor={`${uid}-zip`} error={missing('postalCode', addrRequired)}>
									<Input id={`${uid}-zip`} autoComplete="postal-code" value={billing.postalCode} onChange={set('postalCode')} />
								</Field>
								<Field label={<>Country{req(asks.billing)}</>} htmlFor={`${uid}-country`} error={missing('country', addrRequired)}>
									<Select id={`${uid}-country`} autoComplete="country" value={billing.country} onChange={set('country')}>
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
