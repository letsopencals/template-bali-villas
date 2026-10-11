'use client';

import { useId, useState } from 'react';
import type { CartResponse } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Discount codes go through `/api/cart/discount-code` (POST { code } / DELETE,
 * X-Cart-Id), which wraps the SDK's CartService.applyCode / removeCode.
 */
const ENDPOINT = '/api/cart/discount-code';

const CODE_MESSAGES: Record<string, string> = {
	CODE_NOT_FOUND: 'We don’t recognise that code. Check the spelling and try again.',
	CODE_EXPIRED: 'That code has expired.',
	CODE_DISABLED: 'That code is no longer active.',
	CODE_LIMIT_REACHED: 'That code has been used as many times as it can be.',
	CODE_CUSTOMER_INELIGIBLE: 'That code isn’t available for this booking.',
	CODE_NO_MATCHING_ITEMS: 'That code doesn’t apply to this villa or these extras.',
	CODE_NO_CREDIT: 'There’s no credit left on that code.',
	minimum_requirement_not_met: 'This stay doesn’t meet the code’s minimum yet.',
};

interface PromoCodeProps {
	cartId: string;
	appliedCode: string | null;
	onCart(cart: CartResponse): void;
}

export function PromoCode({ cartId, appliedCode, onCart }: PromoCodeProps) {
	const uid = useId();
	const [open, setOpen] = useState(false);
	const [code, setCode] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const call = async (method: 'POST' | 'DELETE') => {
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(ENDPOINT, {
				method,
				headers: { 'Content-Type': 'application/json', 'X-Cart-Id': cartId },
				body: method === 'POST' ? JSON.stringify({ code: code.trim() }) : undefined,
			});
			const data = (await res.json().catch(() => null)) as (CartResponse & { error?: string; message?: string; code?: string }) | null;
			if (res.status === 404 && !data?.code) throw new Error('Promo codes aren’t available on this site yet.');
			if (!res.ok || !data?.id) throw new Error((data?.code && CODE_MESSAGES[data.code]) || data?.error || data?.message || 'That code didn’t work.');
			onCart(data);
			if (method === 'POST') {
				setCode('');
				setOpen(false);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'That code didn’t work.');
		} finally {
			setBusy(false);
		}
	};

	if (appliedCode) {
		return (
			<div className="flex items-center justify-between gap-4 rounded-full border border-moss/40 bg-moss-soft/60 px-5 py-2.5 text-[0.9rem]">
				<span>
					Code <span className="tabular font-medium uppercase">{appliedCode}</span> applied
				</span>
				<button type="button" onClick={() => void call('DELETE')} disabled={busy} className="link-underline text-ink-muted hover:text-ink">
					Remove
				</button>
			</div>
		);
	}

	if (!open) {
		return (
			<button type="button" onClick={() => setOpen(true)} className="link-underline self-start text-[0.92rem] font-medium text-terracotta-deep">
				Have a promo code?
			</button>
		);
	}

	return (
		<form
			className="flex flex-col gap-2"
			onSubmit={(e) => {
				e.preventDefault();
				if (code.trim()) void call('POST');
			}}
		>
			<label htmlFor={`${uid}-code`} className="label pl-5">
				Promo code
			</label>
			<div className="flex gap-2">
				<Input id={`${uid}-code`} value={code} autoComplete="off" autoCapitalize="characters" onChange={(e) => setCode(e.target.value)} invalid={!!error} className="flex-1 uppercase" />
				<Button type="submit" variant="outline" size="md" pill disabled={busy || !code.trim()}>
					{busy ? 'Checking…' : 'Apply'}
				</Button>
			</div>
			{error ? (
				<p role="alert" className="pl-5 text-[0.82rem] text-danger">
					{error}
				</p>
			) : null}
		</form>
	);
}
