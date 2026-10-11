import type { AppointmentDetailResponse, InvoiceResponse } from '@opencals/storefront-sdk';
import { DetailCard, DetailRow } from '@/components/account/trip-detail/detail-card';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatShortDate, parseUtc } from '@/components/account/trip-model';
import { siteConfig } from '@/lib/site-config';

type Order = NonNullable<AppointmentDetailResponse['order']>;

const PROVIDER: Record<string, string> = {
	stripe: 'Card',
	cash: 'Cash',
	bank_transfer: 'Bank transfer',
	shopify: 'Shopify',
	no_payment_required: 'No payment needed',
};

const TX_TYPE: Record<string, string> = {
	authorization: 'Card hold',
	capture: 'Payment',
	sale: 'Payment',
	refund: 'Refund',
	void: 'Hold released',
};

function localDate(value: string): string {
	const ms = parseUtc(value);
	if (!Number.isFinite(ms)) return '';
	const date = new Intl.DateTimeFormat('en-CA', { timeZone: siteConfig.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ms);
	return formatShortDate(date);
}

function paymentBadge(order: Order): { label: string; tone: 'moss' | 'terracotta' | 'neutral' } {
	if (order.refundStatus === 'fully-refunded') return { label: 'Refunded', tone: 'neutral' };
	if (order.refundStatus === 'partially-refunded') return { label: 'Partly refunded', tone: 'neutral' };
	if (order.paymentStatus === 'paid' || order.isFullyPaid) return { label: 'Paid', tone: 'moss' };
	if (order.paymentStatus === 'partially-paid') return { label: 'Partly paid', tone: 'terracotta' };
	return { label: 'Not paid yet', tone: 'terracotta' };
}

/**
 * Order totals, transactions and receipt links. Totals are the order's (it may
 * cover more than this trip if several villas were booked together).
 */
export function Payments({ order, invoices }: { order: Order | null; invoices: InvoiceResponse[] }) {
	if (!order) {
		return (
			<DetailCard label="Pembayaran" title="Payment">
				<p className="text-ink-muted">There’s no payment on this booking yet. We’ll be in touch if anything is due.</p>
			</DetailCard>
		);
	}
	const cur = order.paymentCurrencyCode;
	const badge = paymentBadge(order);
	const txs = (order.transactions ?? []).filter((t) => t.status === 'success' && t.type !== 'void' && t.type !== 'authorization');
	const links = invoices.filter((i) => i.externalUrl);

	return (
		<DetailCard label="Pembayaran" title="Payment">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm text-ink-muted">Order {order.name}</p>
				<Badge tone={badge.tone} dot>
					{badge.label}
				</Badge>
			</div>
			<dl className="mt-4 divide-y divide-line">
				<DetailRow label="Subtotal">{formatMoney(order.subtotal, cur)}</DetailRow>
				{order.totalTax > 0 ? <DetailRow label={order.taxesIncluded ? 'Taxes (included)' : 'Taxes'}>{formatMoney(order.totalTax, cur)}</DetailRow> : null}
				<DetailRow label="Total">
					<span className="font-semibold">{formatMoney(order.total, cur)}</span>
				</DetailRow>
				<DetailRow label="Paid">{formatMoney(order.paidTotal, cur)}</DetailRow>
				{order.refundedTotal > 0 ? <DetailRow label="Refunded">{formatMoney(order.refundedTotal, cur)}</DetailRow> : null}
				{order.dueToPay > 0 ? (
					<DetailRow label="Still to pay">
						<span className="text-terracotta-deep">{formatMoney(order.dueToPay, cur)}</span>
					</DetailRow>
				) : null}
			</dl>

			{txs.length > 0 ? (
				<ul className="mt-6 space-y-2 text-sm">
					{txs.map((t, i) => (
						<li key={`${t.createdAt}-${i}`} className="flex items-baseline justify-between gap-3 text-ink-muted">
							<span>
								{TX_TYPE[t.type] ?? 'Payment'} · {PROVIDER[t.provider] ?? t.provider}
								<span className="tabular ml-2 text-ink-dim">{localDate(t.createdAt)}</span>
							</span>
							<span className="tabular text-ink">
								{t.type === 'refund' ? '−' : ''}
								{formatMoney(t.amount, t.currencyCode || cur)}
							</span>
						</li>
					))}
				</ul>
			) : null}

			{links.length > 0 ? (
				<div className="mt-6 border-t border-line pt-5">
					<p className="label">Receipts · Kuitansi</p>
					<ul className="mt-3 space-y-2">
						{links.map((inv) => (
							<li key={inv.id}>
								<a href={inv.externalUrl} target="_blank" rel="noreferrer" className="link-underline text-[0.95rem] text-ink">
									{inv.kind === 'receipt' ? 'Receipt' : 'Invoice'} {inv.number} · {formatMoney(inv.amountDue, inv.currencyCode || cur)}
									{inv.status === 'paid' ? '' : inv.status === 'sent' ? ' (due)' : ''}
								</a>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</DetailCard>
	);
}
