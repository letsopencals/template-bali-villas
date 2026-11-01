import { memo } from 'react';
import type { PaymentInstructions } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { buttonClasses } from '@/components/ui/button';

const DUE = new Intl.DateTimeFormat('en-GB', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
	timeZone: siteConfig.timezone,
});

function dueText(iso: string | null | undefined): string | null {
	if (!iso) return null;
	const at = new Date(iso);
	return Number.isNaN(at.getTime()) ? null : `${DUE.format(at)} WITA`;
}

interface HowToPayProps {
	/** From checkout (kept for this tab); null after the page is opened elsewhere. */
	instructions: PaymentInstructions | null;
	/** Booking reference, quoted on a bank transfer. */
	reference: string;
	/** The order's own deadline, used when the instructions are gone. */
	paymentDueAt: string | null;
}

/** Bank details, the invoice link or a pay-at-the-villa note, with the deadline. Falls back to "see your email". */
export const HowToPay = memo(function HowToPay({ instructions, reference, paymentDueAt }: HowToPayProps) {
	const provider = instructions?.provider ?? null;
	const due = dueText(instructions?.dueAt ?? paymentDueAt);
	const invoiceUrl = instructions?.hostedInvoiceUrl?.startsWith('https://') ? instructions.hostedInvoiceUrl : null;
	const bank = instructions?.bankDetails;
	const details = (
		[
			['Account name', bank?.accountName],
			['Bank', bank?.bankName],
			['IBAN / account', bank?.iban],
			['SWIFT / BIC', bank?.swift],
			['Reference', provider === 'bank_transfer' && reference ? reference : null],
		] as Array<[string, string | null | undefined]>
	).filter((row): row is [string, string] => typeof row[1] === 'string' && row[1].trim() !== '');

	let lead: string;
	if (provider === 'stripe_invoice') lead = invoiceUrl ? 'Pay your invoice online with the secure link below. A copy is in your inbox.' : 'Your invoice is on its way by email, with a secure link to pay online.';
	else if (provider === 'bank_transfer') lead = bank ? 'Please transfer the total to our account below.' : 'Our bank details are in your confirmation email.';
	else if (provider === 'cash') lead = 'Nothing is charged online. You settle with our team at the villa.';
	else lead = 'How to pay is in your confirmation email.';

	return (
		<div className="rounded-[24px] border border-terracotta/40 bg-cream p-6">
			<p className="label">Cara membayar · How to pay</p>
			<p className="mt-3 text-[0.95rem] text-ink-muted">{lead}</p>
			{details.length > 0 ? (
				<dl className="mt-4">
					{details.map(([label, value]) => (
						<div key={label} className="flex flex-col gap-0.5 border-b border-line py-2.5 last:border-b-0">
							<dt className="label">{label}</dt>
							<dd className="tabular break-all select-all">{value}</dd>
						</div>
					))}
				</dl>
			) : null}
			{invoiceUrl ? (
				<a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className={buttonClasses('primary', 'lg', { fullWidth: true, pill: true, className: 'mt-5' })}>
					Pay invoice
				</a>
			) : null}
			{due ? (
				<p className="mt-4 text-[0.88rem] text-ink-muted">
					Please pay by <span className="tabular text-ink">{due}</span>. An unpaid booking may be cancelled after that.
				</p>
			) : null}
		</div>
	);
});
