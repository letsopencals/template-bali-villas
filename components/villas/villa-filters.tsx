'use client';

import { clsx } from 'clsx';
import { Chip } from '@/components/ui/chip';
import {
	BEDROOM_OPTIONS,
	COLLECTION_OPTIONS,
	POOL_OPTIONS,
	PRICE_OPTIONS,
	type ExplorerFilters,
	type PoolFilter,
	type PriceBand,
} from '@/components/villas/villa-summary';
import type { VillaCollection } from '@/lib/villa-content';

export interface VillaFiltersProps {
	value: ExplorerFilters;
	onChange(patch: Partial<ExplorerFilters>): void;
	className?: string;
}

/** Collection, bedrooms, pool and price chips. Each group toggles off when tapped again. */
export function VillaFilters({ value, onChange, className }: VillaFiltersProps) {
	return (
		<div className={clsx('flex flex-col gap-6', className)}>
			<FilterGroup label="Kind of house">
				<Chip size="sm" selected={value.collection === null} onClick={() => onChange({ collection: null })}>
					All ten
				</Chip>
				{COLLECTION_OPTIONS.map((c) => (
					<Chip
						key={c.value}
						size="sm"
						title={c.blurb}
						selected={value.collection === c.value}
						onClick={() => onChange({ collection: value.collection === c.value ? null : (c.value as VillaCollection) })}
					>
						{c.label}
					</Chip>
				))}
			</FilterGroup>
			<div className="flex flex-wrap gap-x-10 gap-y-6">
				<FilterGroup label="Bedrooms">
					{BEDROOM_OPTIONS.map((n) => (
						<Chip key={n} size="sm" className="tabular" selected={value.bedrooms === n} onClick={() => onChange({ bedrooms: value.bedrooms === n ? null : n })}>
							{n === 3 ? '3+' : n}
						</Chip>
					))}
				</FilterGroup>
				<FilterGroup label="Pool">
					{POOL_OPTIONS.map((o) => (
						<Chip key={o.value} size="sm" selected={value.pool === o.value} onClick={() => onChange({ pool: value.pool === o.value ? null : (o.value as PoolFilter) })}>
							{o.label}
						</Chip>
					))}
				</FilterGroup>
				<FilterGroup label="Per night">
					{PRICE_OPTIONS.map((o) => (
						<Chip key={o.value} size="sm" className="tabular" selected={value.price === o.value} onClick={() => onChange({ price: value.price === o.value ? null : (o.value as PriceBand) })}>
							{o.label}
						</Chip>
					))}
				</FilterGroup>
			</div>
		</div>
	);
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<fieldset className="min-w-0">
			<legend className="label mb-2.5">{label}</legend>
			<div className="flex flex-wrap gap-2">{children}</div>
		</fieldset>
	);
}
