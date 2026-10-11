'use client';

import { memo, useCallback } from 'react';
import { clsx } from 'clsx';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Stepper } from '@/components/ui/stepper';
import { SafeImage } from '@/components/ui/safe-image';
import { CanangSari } from '@/components/motifs/canang-sari';
import { SectionError } from './reserve-section';
import { addOnControl, addOnImage, addOnMax, money, shortLine } from './reserve-model';

interface AddOnCardProps {
	addOn: AddOnListItemResponse;
	quantity: number;
	currency: string;
	villaImage: string | null;
	maxGuests: number;
	nights: number;
	onChange(id: string, quantity: number): void;
}

const AddOnCard = memo(function AddOnCard({ addOn, quantity, currency, villaImage, maxGuests, nights, onChange }: AddOnCardProps) {
	const control = addOnControl(addOn);
	const selected = quantity > 0;
	const unit = addOn.durationMultiplied ? 'per night' : control === 'toggle' ? 'per stay' : 'each';
	const toggle = useCallback(() => onChange(addOn.id, selected ? 0 : 1), [onChange, addOn.id, selected]);
	const step = useCallback((q: number) => onChange(addOn.id, q), [onChange, addOn.id]);
	return (
		<li
			className={clsx(
				'flex flex-col overflow-hidden rounded-[24px] border bg-cream transition-[border-color,box-shadow] duration-300',
				selected ? 'border-terracotta/60 shadow-[0_0_0_1px_var(--color-terracotta)]' : 'border-line',
			)}
		>
			<div className="image-placeholder relative aspect-[16/10] overflow-hidden">
				<SafeImage src={addOnImage(addOn, villaImage)} alt="" fill sizes="(min-width: 1024px) 22rem, 90vw" className="object-cover" />
			</div>
			<div className="flex flex-1 flex-col gap-3 p-5">
				<div className="flex items-baseline justify-between gap-3">
					<h3 className="font-display text-[1.2rem] leading-tight">{addOn.title}</h3>
					<p className="tabular shrink-0 text-[0.95rem] text-terracotta-deep">
						{money(addOn.price, currency)} <span className="text-[0.78rem] text-ink-muted">{unit}</span>
					</p>
				</div>
				{addOn.description ? <p className="text-[0.9rem] text-ink-muted">{shortLine(addOn.description)}</p> : null}
				<div className="mt-auto flex items-center justify-between gap-3 pt-2">
					{control === 'toggle' ? (
						<Chip selected={selected} onClick={toggle} size="sm" aria-label={`${selected ? 'Remove' : 'Add'} ${addOn.title}`}>
							{selected ? 'Added' : 'Add to stay'}
						</Chip>
					) : (
						<Stepper value={quantity} onChange={step} min={0} max={addOnMax(addOn, maxGuests)} label={addOn.title} size="sm" />
					)}
					{selected && addOn.durationMultiplied && nights > 0 ? (
						<span className="tabular text-[0.8rem] text-ink-muted">× {nights} nights</span>
					) : null}
				</div>
			</div>
		</li>
	);
});

interface AddOnsSectionProps {
	addOns: AddOnListItemResponse[];
	loading: boolean;
	selected: Map<string, number>;
	onChange(id: string, quantity: number): void;
	currency: string;
	villaImage: string | null;
	maxGuests: number;
	nights: number;
	error: string | null;
	busy: boolean;
	continueLabel: string;
	onContinue(): void;
}

/** Step 2: add-on cards (photo, price, a line, a toggle or a count). */
export function AddOnsSection({ addOns, loading, selected, onChange, currency, villaImage, maxGuests, nights, error, busy, continueLabel, onContinue }: AddOnsSectionProps) {
	return (
		<div className="flex flex-col gap-7">
			{loading && addOns.length === 0 ? (
				<div className="flex items-center gap-3 text-ink-muted">
					<CanangSari size={36} spinning label="Loading extras" />
					<span className="text-[0.9rem]">Gathering the extras for this house…</span>
				</div>
			) : addOns.length === 0 ? (
				<p className="text-[0.95rem] text-ink-muted">Nothing extra to add for this house. Our hosts can arrange most things once you arrive.</p>
			) : (
				<ul className="grid gap-5 sm:grid-cols-2">
					{addOns.map((a) => (
						<AddOnCard
							key={a.id}
							addOn={a}
							quantity={selected.get(a.id) ?? 0}
							currency={currency}
							villaImage={villaImage}
							maxGuests={maxGuests}
							nights={nights}
							onChange={onChange}
						/>
					))}
				</ul>
			)}
			{error ? <SectionError>{error}</SectionError> : null}
			<div>
				<Button variant="primary" size="lg" pill onClick={onContinue} disabled={busy}>
					{busy ? 'Updating your stay…' : continueLabel}
				</Button>
			</div>
		</div>
	);
}
