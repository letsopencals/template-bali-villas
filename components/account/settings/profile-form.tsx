'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Field, Input, fieldDescribedBy } from '@/components/ui/input';
import { AccountRequestError, accountRequest } from '@/components/account/trip-detail/account-fetch';
import { PHONE_HINT, PHONE_PLACEHOLDER, mapFieldErrors, phoneProblem, withoutField, type FieldErrorMap } from '@/lib/field-errors';

export interface ProfileFormProps {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
}

const PROFILE_FIELDS = ['firstName', 'lastName', 'phone'] as const;
const PHONE_FIELD_HINT = `${PHONE_HINT}, so the driver can reach you on arrival.`;

/** Name and phone (editable) plus the sign-in email (read-only). */
export function ProfileForm(initial: ProfileFormProps) {
	const router = useRouter();
	const [firstName, setFirstName] = useState(initial.firstName);
	const [lastName, setLastName] = useState(initial.lastName);
	const [phone, setPhone] = useState(initial.phone);
	const [saving, setSaving] = useState(false);
	const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
	const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

	const dirty = firstName !== initial.firstName || lastName !== initial.lastName || phone !== initial.phone;
	const errorOf = (key: string) => fieldErrors[key]?.join(' ') || undefined;
	const firstError = errorOf('firstName');
	const lastError = errorOf('lastName');
	const phoneError = errorOf('phone');

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!firstName.trim()) {
			setStatus({ ok: false, text: 'Please add your first name.' });
			return;
		}
		const phoneCheck = phoneProblem(phone);
		if (phoneCheck) {
			setFieldErrors((prev) => ({ ...prev, phone: [phoneCheck] }));
			setStatus(null);
			return;
		}
		setSaving(true);
		setStatus(null);
		setFieldErrors({});
		try {
			await accountRequest('/api/account/profile', 'PUT', {
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				phone: phone.trim() || undefined,
			});
			setStatus({ ok: true, text: 'Saved. Sudah tersimpan.' });
			router.refresh();
		} catch (err) {
			const { byField, unmapped } = mapFieldErrors(err instanceof AccountRequestError ? err.fieldErrors : [], PROFILE_FIELDS);
			if (Object.keys(byField).length > 0) {
				// Messages sit under their fields; only what has no field goes in the status line.
				setFieldErrors(byField);
				setStatus(unmapped.length > 0 ? { ok: false, text: unmapped.join(' ') } : null);
			} else {
				setStatus({ ok: false, text: err instanceof Error ? err.message : 'Could not save your details.' });
			}
		} finally {
			setSaving(false);
		}
	};

	return (
		<form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
			<Field label="First name" htmlFor="profile-first" error={firstError}>
				<Input
					id="profile-first"
					autoComplete="given-name"
					value={firstName}
					onChange={(e) => {
						setFirstName(e.target.value);
						setFieldErrors((prev) => withoutField(prev, 'firstName'));
					}}
					maxLength={100}
					required
					invalid={!!firstError}
					aria-describedby={fieldDescribedBy('profile-first', firstError)}
				/>
			</Field>
			<Field label="Last name" htmlFor="profile-last" error={lastError}>
				<Input
					id="profile-last"
					autoComplete="family-name"
					value={lastName}
					onChange={(e) => {
						setLastName(e.target.value);
						setFieldErrors((prev) => withoutField(prev, 'lastName'));
					}}
					maxLength={100}
					invalid={!!lastError}
					aria-describedby={fieldDescribedBy('profile-last', lastError)}
				/>
			</Field>
			<Field label="Phone" htmlFor="profile-phone" hint={PHONE_FIELD_HINT} error={phoneError}>
				<Input
					id="profile-phone"
					type="tel"
					autoComplete="tel"
					value={phone}
					onChange={(e) => {
						setPhone(e.target.value);
						setFieldErrors((prev) => withoutField(prev, 'phone'));
					}}
					maxLength={40}
					placeholder={PHONE_PLACEHOLDER}
					invalid={!!phoneError}
					aria-describedby={fieldDescribedBy('profile-phone', phoneError, PHONE_FIELD_HINT)}
				/>
			</Field>
			<Field label="Email" htmlFor="profile-email" hint="You sign in with this email. To change it, message us.">
				<Input id="profile-email" type="email" value={initial.email} readOnly disabled />
			</Field>
			<div className="flex flex-wrap items-center gap-4 sm:col-span-2">
				<Button type="submit" disabled={saving || !dirty}>
					{saving ? 'Saving…' : 'Save details'}
				</Button>
				{status ? (
					<p role={status.ok ? 'status' : 'alert'} className={status.ok ? 'text-sm text-moss' : 'text-sm text-danger'}>
						{status.text}
					</p>
				) : null}
			</div>
		</form>
	);
}
