import { siteConfig } from '@/lib/site-config';
import type { ConfirmedStay } from './confirmed-model';

/**
 * Client-side .ics for a confirmed stay: a short check-in event and a short
 * check-out event, at the real slot instants (15:00 and 11:00 WITA as UTC), so
 * every calendar shows them in the guest's own zone correctly.
 */

const HOUR = 3_600_000;

function stamp(ms: number): string {
	return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function esc(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function vevent(uid: string, start: number, end: number, title: string, description: string, now: number): string[] {
	const a = siteConfig.contact.address;
	return [
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${stamp(now)}`,
		`DTSTART:${stamp(start)}`,
		`DTEND:${stamp(end)}`,
		`SUMMARY:${esc(title)}`,
		`LOCATION:${esc(`${a.line1}, ${a.city}, ${a.region} ${a.postalCode}, ${a.country}`)}`,
		`DESCRIPTION:${esc(description)}`,
		'END:VEVENT',
	];
}

export function icsHref(stays: readonly ConfirmedStay[], reference: string): string {
	const now = Date.now();
	const ref = reference ? `Booking ${reference}. ` : '';
	const contact = `Questions: ${siteConfig.contact.email} or WhatsApp ${siteConfig.contact.whatsapp}.`;
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:-//${siteConfig.name}//Stay//EN`,
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		...stays.flatMap((s) => {
			const inAt = Date.parse(s.from);
			const outAt = Date.parse(s.to);
			return [
				...vevent(`${s.appointmentId}-in@lumbung`, inAt, inAt + HOUR, `Check in at ${s.villaTitle}, ${siteConfig.name}`, `${ref}Check-in from ${s.checkInTime} WITA.${s.flightNumber ? ` Flight ${s.flightNumber}.` : ''} ${contact}`, now),
				...vevent(`${s.appointmentId}-out@lumbung`, outAt - HOUR, outAt, `Check out of ${s.villaTitle}`, `${ref}Check-out by ${s.checkOutTime} WITA. ${contact}`, now),
			];
		}),
		'END:VCALENDAR',
	];
	return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}
