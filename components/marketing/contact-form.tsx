'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button, buttonClasses } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { CanangSari } from '@/components/motifs/canang-sari';

export interface ContactFormProps {
	email: string;
	/** wa.me base link (no query). */
	whatsappHref: string;
	/** Villa names for the optional "which house" select. */
	villas: readonly string[];
}

interface Values {
	name: string;
	email: string;
	villa: string;
	dates: string;
	message: string;
}

type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { name: '', email: '', villa: '', dates: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: Values): Errors {
	const e: Errors = {};
	if (!v.name.trim()) e.name = 'Tell us your name.';
	if (!EMAIL_RE.test(v.email.trim())) e.email = 'We need an email address to reply to.';
	if (v.message.trim().length < 10) e.message = 'A few more words, please.';
	return e;
}

function compose(v: Values): { subject: string; body: string } {
	const subject = `Question from ${v.name.trim()}${v.villa ? ` about ${v.villa}` : ''}`;
	const lines = [v.message.trim(), '', `Name: ${v.name.trim()}`, `Email: ${v.email.trim()}`];
	if (v.villa) lines.push(`Villa: ${v.villa}`);
	if (v.dates.trim()) lines.push(`Dates: ${v.dates.trim()}`);
	return { subject, body: lines.join('\n') };
}

/**
 * Contact form with no backend: it validates, then opens the guest's email app
 * with a pre-filled message (mailto). The success state offers WhatsApp and the
 * plain address in case no mail app opened.
 */
export function ContactForm({ email, whatsappHref, villas }: ContactFormProps) {
	const id = useId();
	const [values, setValues] = useState<Values>(EMPTY);
	const [errors, setErrors] = useState<Errors>({});
	const [sent, setSent] = useState<{ subject: string; body: string } | null>(null);

	const set = (key: keyof Values) => (e: { target: { value: string } }) => {
		const value = e.target.value;
		setValues((prev) => ({ ...prev, [key]: value }));
		if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
	};

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const found = validate(values);
		setErrors(found);
		if (Object.keys(found).length) {
			const first = (['name', 'email', 'message'] as const).find((k) => found[k]);
			if (first) document.getElementById(`${id}-${first}`)?.focus();
			return;
		}
		const msg = compose(values);
		setSent(msg);
		window.location.href = `mailto:${email}?subject=${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(msg.body)}`;
	};

	if (sent) {
		const wa = `${whatsappHref}?text=${encodeURIComponent(`${sent.subject}\n\n${sent.body}`)}`;
		return (
			<div role="status" className="flex flex-col items-start gap-5 rounded-[24px] bg-sand p-8">
				<CanangSari size={52} />
				<p className="font-display text-[1.1rem] italic text-terracotta-deep">Terima kasih</p>
				<h3 className="display-sm">Your email app should have opened with the message ready to send.</h3>
				<p className="text-ink-muted">
					If it didn’t, write to <a href={`mailto:${email}`} className="text-terracotta-deep underline underline-offset-4">{email}</a>, or send the same message on WhatsApp. We usually reply within the day.
				</p>
				<div className="flex flex-wrap gap-3">
					<a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClasses('secondary', 'md')}>
						Send on WhatsApp
					</a>
					<Button variant="ghost" onClick={() => setSent(null)}>
						Edit the message
					</Button>
				</div>
			</div>
		);
	}

	return (
		<form noValidate onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
			<Field label="Your name" htmlFor={`${id}-name`} error={errors.name}>
				<Input id={`${id}-name`} name="name" autoComplete="name" value={values.name} onChange={set('name')} invalid={Boolean(errors.name)} required />
			</Field>
			<Field label="Email" htmlFor={`${id}-email`} error={errors.email}>
				<Input id={`${id}-email`} name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={set('email')} invalid={Boolean(errors.email)} required />
			</Field>
			{villas.length ? (
				<Field label="Which house (optional)" htmlFor={`${id}-villa`}>
					<Select id={`${id}-villa`} name="villa" value={values.villa} onChange={set('villa')}>
						<option value="">Not sure yet</option>
						{villas.map((v) => (
							<option key={v} value={v}>
								{v}
							</option>
						))}
					</Select>
				</Field>
			) : null}
			<Field label="Dates (optional)" htmlFor={`${id}-dates`} hint="Roughly is fine, e.g. “a week in March”">
				<Input id={`${id}-dates`} name="dates" value={values.dates} onChange={set('dates')} />
			</Field>
			<Field label="Your message" htmlFor={`${id}-message`} error={errors.message} className="sm:col-span-2">
				<Textarea id={`${id}-message`} name="message" rows={6} value={values.message} onChange={set('message')} invalid={Boolean(errors.message)} required />
			</Field>
			<div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-[0.85rem] text-ink-muted">This opens your email app with the message filled in. Nothing is stored on this site.</p>
				<Button type="submit" size="lg">
					Write to us
				</Button>
			</div>
		</form>
	);
}
