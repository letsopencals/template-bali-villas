'use client';

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { motion, type Transition } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { clsx } from 'clsx';
import { EASE_SOFT } from '@/components/motion/easing';
import { siteConfig } from '@/lib/site-config';
import {
	addDays,
	DEFAULT_STAY_TIMES,
	fitsStay,
	isNightAvailable,
	latestCheckout,
	nightsBetween,
	todayIn,
	type AvailabilityRange,
	type StayTimes,
} from '@/lib/stay';

/**
 * Two-month stay picker (one month below `md`, or when `months={1}`).
 *
 * - Dates are local `YYYY-MM-DD` in `timezone` (the store timezone, Asia/Makassar).
 * - A day is a check-in candidate when its night is free (`isNightAvailable`)
 *   AND a stay of `minNights` from it fits. Booked nights are struck through
 *   (ink-dim on paper-deep). A free night that can't make the minimum is dimmed.
 * - Once check-in is chosen, check-out days run from check-in + `minNights` to
 *   `latestCheckout` (capped at `maxNights`). The check-out day itself may be a
 *   booked night: guests leave at 11:00 and the next ones arrive at 15:00.
 * - Selected range: terracotta ends with a terracotta/12 band (DESIGN.md §2).
 * - Keyboard: arrows move by day/week, PageUp/PageDown by month, Home/End to
 *   the start/end of the week, Enter/Space selects. Roving tabindex.
 */
export interface StayValue {
	checkin: string | null;
	checkout: string | null;
}

export interface StayCalendarProps {
	ranges: readonly AvailabilityRange[];
	value: StayValue;
	onChange(v: StayValue): void;
	/** Store timezone. Default siteConfig.timezone. */
	timezone?: string;
	/** Check-in/out times (stayTimesFor(product)). Default 15:00 / 11:00. */
	stayTimes?: StayTimes;
	/** Shortest stay. Default 1. */
	minNights?: number;
	/** Longest stay. Default siteConfig.stay.maxNights. */
	maxNights?: number;
	/** Force one or two months. Default 2 (one on mobile). */
	months?: 1 | 2;
	/** Earliest selectable check-in. Default today in `timezone`. */
	minDate?: string;
	/** Ranges are still loading: days stay neutral and unclickable. */
	loading?: boolean;
	/** Show the key and the check-in/out times under the grid. Default true. */
	showLegend?: boolean;
	/** Cream on jungle instead of ink on paper. */
	onDark?: boolean;
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const;
const MONTH_FMT = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const SHORT_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const DAY_LABEL_FMT = new Intl.DateTimeFormat('en-GB', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	timeZone: 'UTC',
});

const FILL_TRANSITION: Transition = { duration: 0.45, ease: EASE_SOFT };
const CAP_TRANSITION: Transition = { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 };
const NO_TRANSITION: Transition = { duration: 0 };
const FILL_INITIAL = { scaleX: 0, opacity: 0 };
const FILL_ANIMATE = { scaleX: 1, opacity: 1 };

/* ------------------------------------------------------------- date maths */

/** First of the month for a date, 'YYYY-MM-01'. */
function monthStart(date: string): string {
	return `${date.slice(0, 7)}-01`;
}

function addMonths(month: string, n: number): string {
	const y = Number(month.slice(0, 4));
	const m = Number(month.slice(5, 7));
	const d = new Date(Date.UTC(y, m - 1 + n, 1));
	return d.toISOString().slice(0, 10);
}

function toUtcDate(date: string): Date {
	return new Date(`${date}T00:00:00Z`);
}

/** Monday-first weekday index 0..6. */
function weekdayIndex(date: string): number {
	return (toUtcDate(date).getUTCDay() + 6) % 7;
}

function daysInMonth(month: string): number {
	const y = Number(month.slice(0, 4));
	const m = Number(month.slice(5, 7));
	return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Grid weeks for a month: arrays of 7 (date | null for padding). */
function monthGrid(month: string): Array<Array<string | null>> {
	const lead = weekdayIndex(month);
	const total = daysInMonth(month);
	const cells: Array<string | null> = Array.from({ length: lead }, () => null);
	for (let i = 0; i < total; i++) cells.push(addDays(month, i));
	while (cells.length % 7 !== 0) cells.push(null);
	const weeks: Array<Array<string | null>> = [];
	for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
	return weeks;
}

/* ---------------------------------------------------------------- types */

type DayState = {
	disabled: boolean;
	/** Booked night: struck through. */
	struck: boolean;
	/** Free night, but a stay of minNights from it doesn't fit (or under the min). */
	short: boolean;
	isStart: boolean;
	isEnd: boolean;
	inRange: boolean;
	inPreview: boolean;
	/** Hovered return candidate (outlined cap). */
	isPreviewEnd: boolean;
	/** Band continues to the right / left of a cap. */
	joinRight: boolean;
	joinLeft: boolean;
	/** A return date is chosen (strong tint) vs. a hover preview (light tint). */
	rangeCommitted: boolean;
	isToday: boolean;
};

/* ------------------------------------------------------------- component */

export function StayCalendar({
	ranges,
	value,
	onChange,
	timezone = siteConfig.timezone,
	stayTimes = DEFAULT_STAY_TIMES,
	minNights = 1,
	maxNights = siteConfig.stay.maxNights,
	months = 2,
	minDate,
	loading = false,
	showLegend = true,
	onDark = false,
}: StayCalendarProps) {
	const reduce = useReducedMotion();
	const uid = useId();
	const today = useMemo(() => todayIn(timezone), [timezone]);
	const earliest = minDate && minDate > today ? minDate : today;
	const minN = Math.max(1, Math.floor(minNights));
	const maxN = Math.max(minN, Math.floor(maxNights));

	const { checkin, checkout } = value;
	const pickingCheckout = checkin !== null && checkout === null;

	const [viewMonth, setViewMonth] = useState(() => monthStart(checkin ?? earliest));
	const [focusDate, setFocusDate] = useState<string>(() => checkin ?? earliest);
	const [hoverDate, setHoverDate] = useState<string | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const shouldFocusRef = useRef(false);

	// Follow an externally-set check-in (e.g. from the URL) into view.
	useEffect(() => {
		if (!checkin) return;
		setViewMonth((vm) => {
			const end = addMonths(vm, months);
			return checkin >= vm && checkin < end ? vm : monthStart(checkin);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [checkin]);

	const latest = useMemo(
		() => (checkin ? latestCheckout(ranges, checkin, timezone, stayTimes, maxN) : null),
		[ranges, checkin, timezone, stayTimes, maxN],
	);
	const earliestCheckout = checkin ? addDays(checkin, minN) : null;

	const visibleMonths = useMemo(() => Array.from({ length: months }, (_, i) => addMonths(viewMonth, i)), [viewMonth, months]);

	// Night lookups for every visible date (one pass per ranges/month change).
	const { freeNights, checkinOk } = useMemo(() => {
		const free = new Set<string>();
		const ok = new Set<string>();
		for (const m of visibleMonths) {
			const n = daysInMonth(m);
			for (let i = 0; i < n; i++) {
				const d = addDays(m, i);
				if (d < earliest || !isNightAvailable(ranges, d, timezone, stayTimes)) continue;
				free.add(d);
				if (minN === 1 || fitsStay(ranges, d, addDays(d, minN), timezone, stayTimes)) ok.add(d);
			}
		}
		return { freeNights: free, checkinOk: ok };
	}, [visibleMonths, ranges, timezone, stayTimes, earliest, minN]);

	const isCheckoutCandidate = useCallback(
		(d: string) => pickingCheckout && latest !== null && earliestCheckout !== null && d >= earliestCheckout && d <= latest,
		[pickingCheckout, latest, earliestCheckout],
	);

	const isSelectable = useCallback(
		(d: string) => {
			if (d < earliest) return false;
			// While choosing check-out, nothing past the latest reachable check-out is
			// clickable. Earlier valid days still restart the selection.
			if (pickingCheckout && checkin !== null && d > checkin) return isCheckoutCandidate(d);
			if (pickingCheckout && d === checkin) return true;
			return checkinOk.has(d);
		},
		[earliest, pickingCheckout, checkin, isCheckoutCandidate, checkinOk],
	);

	const previewEnd = pickingCheckout && hoverDate && isCheckoutCandidate(hoverDate) ? hoverDate : null;

	const stateFor = useCallback(
		(d: string): DayState => {
			const selectable = !loading && isSelectable(d);
			const candidate = isCheckoutCandidate(d);
			const struck = !loading && d >= earliest && !freeNights.has(d) && !candidate && d !== checkout;
			const short = !loading && !selectable && !struck && d >= earliest && d !== checkin && d !== checkout;
			return {
				disabled: !selectable,
				struck,
				short,
				isStart: d === checkin,
				isEnd: d === checkout,
				inRange: checkin !== null && checkout !== null && d > checkin && d < checkout,
				inPreview: checkin !== null && previewEnd !== null && d > checkin && d < previewEnd,
				isPreviewEnd: previewEnd !== null && d === previewEnd,
				joinRight: d === checkin && (checkout !== null || previewEnd !== null),
				joinLeft: (checkout !== null && d === checkout) || (previewEnd !== null && d === previewEnd),
				rangeCommitted: checkout !== null,
				isToday: d === today,
			};
		},
		[loading, isSelectable, isCheckoutCandidate, earliest, freeNights, checkin, checkout, previewEnd, today],
	);

	const select = useCallback(
		(d: string) => {
			if (loading || !isSelectable(d)) return;
			if (pickingCheckout && isCheckoutCandidate(d)) {
				onChange({ checkin, checkout: d });
				return;
			}
			if (pickingCheckout && d === checkin) {
				onChange({ checkin: null, checkout: null });
				return;
			}
			if (checkinOk.has(d)) onChange({ checkin: d, checkout: null });
		},
		[loading, isSelectable, pickingCheckout, isCheckoutCandidate, onChange, checkin, checkinOk],
	);

	const moveFocus = useCallback(
		(next: string) => {
			setFocusDate(next);
			shouldFocusRef.current = true;
			setViewMonth((vm) => {
				const end = addMonths(vm, months);
				if (next < vm) return monthStart(next);
				if (next >= end) return addMonths(monthStart(next), -(months - 1));
				return vm;
			});
		},
		[months],
	);

	// Move DOM focus after a keyboard move re-renders the grid.
	useEffect(() => {
		if (!shouldFocusRef.current) return;
		shouldFocusRef.current = false;
		const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`);
		el?.focus();
	}, [focusDate, viewMonth]);

	const onKeyDown = useCallback(
		(e: KeyboardEvent<HTMLButtonElement>, d: string) => {
			let next: string | null = null;
			switch (e.key) {
				case 'ArrowLeft':
					next = addDays(d, -1);
					break;
				case 'ArrowRight':
					next = addDays(d, 1);
					break;
				case 'ArrowUp':
					next = addDays(d, -7);
					break;
				case 'ArrowDown':
					next = addDays(d, 7);
					break;
				case 'Home':
					next = addDays(d, -weekdayIndex(d));
					break;
				case 'End':
					next = addDays(d, 6 - weekdayIndex(d));
					break;
				case 'PageUp': {
					const m = addMonths(monthStart(d), -1);
					next = addDays(m, Math.min(Number(d.slice(8)), daysInMonth(m)) - 1);
					break;
				}
				case 'PageDown': {
					const m = addMonths(monthStart(d), 1);
					next = addDays(m, Math.min(Number(d.slice(8)), daysInMonth(m)) - 1);
					break;
				}
				case 'Enter':
				case ' ':
					e.preventDefault();
					select(d);
					return;
				default:
					return;
			}
			e.preventDefault();
			if (next < monthStart(earliest)) return;
			moveFocus(next);
		},
		[select, moveFocus, earliest],
	);

	const canGoBack = viewMonth > monthStart(earliest);
	// Roving tabindex target must be on screen.
	const lastVisible = addDays(addMonths(viewMonth, months), -1);
	const tabStop =
		focusDate >= viewMonth && focusDate <= lastVisible ? focusDate : checkin && checkin >= viewMonth && checkin <= lastVisible ? checkin : viewMonth;

	const nights = checkin && checkout ? nightsBetween(checkin, checkout) : 0;
	const minLabel = minN > 1 ? ` (min ${minN} nights)` : '';
	const status = loading
		? 'Checking availability…'
		: !checkin
			? `Choose your check-in date${minLabel}`
			: !checkout
				? latest && earliestCheckout && latest >= earliestCheckout
					? `Now choose check-out${minLabel}`
					: 'No free check-out from this date. Choose another check-in.'
				: `${nights} ${nights === 1 ? 'night' : 'nights'} · ${SHORT_FMT.format(toUtcDate(checkin))} → ${SHORT_FMT.format(toUtcDate(checkout))}`;

	return (
		<div className={clsx('select-none', onDark ? 'text-cream' : 'text-ink')}>
			<div className="mb-5 flex items-center justify-between gap-3">
				<p className={clsx('label', onDark && 'on-dark')} aria-live="polite">
					{status}
				</p>
				<div className="flex items-center gap-1.5">
					<NavButton label="Previous month" disabled={!canGoBack} onClick={() => setViewMonth((vm) => addMonths(vm, -1))} dir="prev" onDark={onDark} />
					<NavButton label="Next month" onClick={() => setViewMonth((vm) => addMonths(vm, 1))} dir="next" onDark={onDark} />
				</div>
			</div>

			<div
				ref={gridRef}
				aria-busy={loading || undefined}
				className={clsx('grid gap-x-10 gap-y-8 transition-opacity duration-300', months === 2 ? 'md:grid-cols-2' : '', loading ? 'animate-pulse opacity-50' : '')}
				onMouseLeave={() => setHoverDate(null)}
			>
				{visibleMonths.map((m, idx) => (
					<MonthGrid
						key={m}
						month={m}
						hideOnMobile={idx > 0}
						uid={uid}
						tabStop={tabStop}
						stateFor={stateFor}
						onSelect={select}
						onHover={setHoverDate}
						onKeyDown={onKeyDown}
						onFocusDay={setFocusDate}
						reduce={!!reduce}
						onDark={onDark}
					/>
				))}
			</div>

			{showLegend ? (
				<div className={clsx('mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.72rem]', onDark ? 'text-cream/70' : 'text-ink-muted')}>
					<span className="inline-flex items-center gap-2">
						<span className="h-2.5 w-2.5 rounded-full bg-terracotta" aria-hidden /> Selected
					</span>
					<span className="inline-flex items-center gap-2">
						<span className={clsx('h-2.5 w-2.5 rounded-full border', onDark ? 'border-line-on-dark' : 'border-line-strong')} aria-hidden /> Free
					</span>
					<span className="inline-flex items-center gap-2">
						<span className={clsx('tabular rounded px-1 line-through decoration-ink-dim', onDark ? 'bg-jungle-soft text-cream/50' : 'bg-paper-deep text-ink-dim')} aria-hidden>
							14
						</span>
						Booked
					</span>
					<span className="tabular ml-auto">
						Check in from {stayTimes.checkIn} · Check out by {stayTimes.checkOut}
					</span>
				</div>
			) : null}
		</div>
	);
}

/* ------------------------------------------------------------- pieces */

function NavButton({
	label,
	onClick,
	disabled,
	dir,
	onDark,
}: {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	dir: 'prev' | 'next';
	onDark?: boolean;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				'flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:border-terracotta hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-30',
				onDark ? 'border-line-on-dark text-cream' : 'border-line-strong text-ink',
			)}
		>
			<svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
				<path d={dir === 'prev' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'} strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		</button>
	);
}

interface MonthGridProps {
	month: string;
	hideOnMobile: boolean;
	uid: string;
	tabStop: string;
	stateFor: (d: string) => DayState;
	onSelect: (d: string) => void;
	onHover: (d: string | null) => void;
	onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, d: string) => void;
	onFocusDay: (d: string) => void;
	reduce: boolean;
	onDark: boolean;
}

function MonthGrid({ month, hideOnMobile, uid, tabStop, stateFor, onSelect, onHover, onKeyDown, onFocusDay, reduce, onDark }: MonthGridProps) {
	const weeks = useMemo(() => monthGrid(month), [month]);
	const labelId = `${uid}-${month}`;
	return (
		<div className={clsx(hideOnMobile && 'hidden md:block')}>
			<p id={labelId} className="mb-4 font-display text-[1.2rem]">
				{MONTH_FMT.format(toUtcDate(month))}
			</p>
			<div role="grid" aria-labelledby={labelId} className="w-full">
				<div role="row" className="grid grid-cols-7">
					{WEEKDAYS.map((w) => (
						<span
							key={w}
							role="columnheader"
							aria-label={w}
							className={clsx('pb-2 text-center text-[0.66rem] font-semibold uppercase tracking-[0.14em]', onDark ? 'text-cream/50' : 'text-ink-dim')}
						>
							{w}
						</span>
					))}
				</div>
				{weeks.map((week, wi) => (
					<div role="row" key={wi} className="grid grid-cols-7">
						{week.map((d, di) =>
							d ? (
								<DayCell
									key={d}
									date={d}
									state={stateFor(d)}
									tabbable={d === tabStop}
									uid={uid}
									onSelect={onSelect}
									onHover={onHover}
									onKeyDown={onKeyDown}
									onFocusDay={onFocusDay}
									reduce={reduce}
									onDark={onDark}
									col={di}
								/>
							) : (
								<span key={`pad-${wi}-${di}`} role="gridcell" aria-hidden className="aspect-square" />
							),
						)}
					</div>
				))}
			</div>
		</div>
	);
}

interface DayCellProps {
	date: string;
	state: DayState;
	tabbable: boolean;
	uid: string;
	col: number;
	onSelect: (d: string) => void;
	onHover: (d: string | null) => void;
	onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, d: string) => void;
	onFocusDay: (d: string) => void;
	reduce: boolean;
	onDark: boolean;
}

const DayCell = memo(function DayCell({
	date,
	state,
	tabbable,
	uid,
	col,
	onSelect,
	onHover,
	onKeyDown,
	onFocusDay,
	reduce,
	onDark,
}: DayCellProps) {
	const { disabled, struck, short, isStart, isEnd, inRange, inPreview, isPreviewEnd, joinRight, joinLeft, rangeCommitted, isToday } = state;
	const isCap = isStart || isEnd;
	const selected = isCap || inRange;
	const label = `${DAY_LABEL_FMT.format(toUtcDate(date))}${struck ? ', booked' : ''}${short ? ', unavailable' : ''}${isStart ? ', check-in' : ''}${isEnd ? ', check-out' : ''}`;
	const fillTransition = reduce ? NO_TRANSITION : { ...FILL_TRANSITION, delay: Math.min(col * 0.025, 0.15) };

	return (
		<div role="gridcell" aria-selected={selected} className="relative aspect-square p-[1px]">
			{/* Range band, animated fill from the left. Caps get a half band joining the range. */}
			{inRange || inPreview ? (
				<motion.span
					aria-hidden
					className={clsx('absolute inset-x-0 inset-y-[3px] origin-left', inRange ? 'bg-terracotta/12' : 'bg-terracotta/6')}
					initial={reduce ? false : FILL_INITIAL}
					animate={FILL_ANIMATE}
					transition={fillTransition}
				/>
			) : null}
			{joinRight ? (
				<motion.span
					aria-hidden
					className={clsx('absolute inset-y-[3px] left-1/2 right-0 origin-left', rangeCommitted ? 'bg-terracotta/12' : 'bg-terracotta/6')}
					initial={reduce ? false : FILL_INITIAL}
					animate={FILL_ANIMATE}
					transition={fillTransition}
				/>
			) : null}
			{joinLeft ? (
				<motion.span
					aria-hidden
					className={clsx('absolute inset-y-[3px] left-0 right-1/2 origin-left', isEnd ? 'bg-terracotta/12' : 'bg-terracotta/6')}
					initial={reduce ? false : FILL_INITIAL}
					animate={FILL_ANIMATE}
					transition={fillTransition}
				/>
			) : null}
			{isCap ? (
				<motion.span
					aria-hidden
					layoutId={reduce ? undefined : `${uid}-${isStart ? 'start' : 'end'}`}
					className="absolute inset-[3px] rounded-full bg-terracotta"
					transition={reduce ? NO_TRANSITION : CAP_TRANSITION}
				/>
			) : isPreviewEnd ? (
				<span aria-hidden className={clsx('absolute inset-[3px] rounded-full border border-terracotta', onDark ? 'bg-jungle' : 'bg-paper')} />
			) : null}
			<button
				type="button"
				data-date={date}
				tabIndex={tabbable ? 0 : -1}
				aria-label={label}
				aria-disabled={disabled || undefined}
				onClick={() => onSelect(date)}
				onMouseEnter={() => onHover(date)}
				onFocus={() => {
					onFocusDay(date);
					onHover(date);
				}}
				onKeyDown={(e) => onKeyDown(e, date)}
				className={clsx(
					'tabular relative z-[1] flex h-full w-full items-center justify-center rounded-full text-[0.86rem] outline-none transition-colors duration-200',
					'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta',
					isCap
						? 'font-semibold text-cream'
						: struck
							? clsx('cursor-not-allowed line-through decoration-1', onDark ? 'bg-jungle-soft text-cream/40 decoration-cream/40' : 'bg-paper-deep text-ink-dim decoration-ink-dim')
							: disabled
								? clsx('cursor-not-allowed', onDark ? 'text-cream/40' : 'text-ink-dim')
								: inRange || inPreview
									? clsx(onDark ? 'text-cream' : 'text-terracotta-deep', 'hover:bg-terracotta/10')
									: clsx(onDark ? 'text-cream hover:bg-jungle-soft' : 'text-ink hover:bg-sand'),
				)}
			>
				{Number(date.slice(8))}
				{isToday && !isCap ? (
					<span aria-hidden className="absolute bottom-[16%] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-terracotta" />
				) : null}
			</button>
		</div>
	);
});

