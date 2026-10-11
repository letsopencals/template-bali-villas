'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { accountRequest } from '@/components/account/trip-detail/account-fetch';

export interface ProfileFormProps {
	firstName: string;
	lastName: string;
	phone: string;
	email: string;
}

/** Name and phone (editable) plus the sign-in email (read-only). */
export function ProfileForm(initial: ProfileFormProps) {
	const router = useRouter();
	const [firstName, setFirstName] = useState(initial.firstName);
	const [lastName, setLastName] = useState(initial.lastName);
	const [phone, setPhone] = useState(initial.phone);
	const [saving, setSaving] = useState(false);
	const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

	const dirty = firstName !== initial.firstName || lastName !== initial.lastName || phone !== initial.phone;

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!firstName.trim()) {
			setStatus({ ok: false, text: 'Please add your first name.' });
			return;
		}
		setSaving(true);
		setStatus(null);
		try {
			await accountRequest('/api/account/profile', 'PUT', {
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				phone: phone.trim() || undefined,
			});
			setStatus({ ok: true, text: 'Saved. Sudah tersimpan.' });
			router.refresh();
		} catch (err) {
			setStatus({ ok: false, text: err instanceof Error ? err.message : 'Could not save your details.' });
		} finally {
			setSaving(false);
		}
	};

	return (
		<form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
			<Field label="First name" htmlFor="profile-first">
				<Input id="profile-first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={100} required />
			</Field>
			<Field label="Last name" htmlFor="profile-last">
				<Input id="profile-last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} />
			</Field>
			<Field label="Phone" htmlFor="profile-phone" hint="With country code, so the driver can reach you on arrival.">
				<Input id="profile-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} placeholder="+44 7700 900123" />
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
