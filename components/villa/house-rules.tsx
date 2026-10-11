import type { StayTimes } from '@/lib/stay';

/** House rules plus check-in and check-out times. */
export function HouseRules({ rules, stayTimes }: { rules: string[]; stayTimes: StayTimes }) {
	return (
		<section aria-labelledby="house-rules-title">
			<p className="label">Good to know</p>
			<h2 id="house-rules-title" className="display-sm mt-3">
				House rules
			</h2>
			<dl className="mt-8 grid grid-cols-2 gap-4">
				<div className="rounded-[20px] bg-sand/60 p-4">
					<dt className="label">Check in</dt>
					<dd className="tabular mt-1 font-display text-[1.4rem]">from {stayTimes.checkIn}</dd>
				</div>
				<div className="rounded-[20px] bg-sand/60 p-4">
					<dt className="label">Check out</dt>
					<dd className="tabular mt-1 font-display text-[1.4rem]">by {stayTimes.checkOut}</dd>
				</div>
			</dl>
			{rules.length > 0 ? (
				<ul className="mt-6 flex flex-col gap-3 text-[0.98rem]">
					{rules.map((r) => (
						<li key={r} className="flex gap-3">
							<span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rotate-45 bg-terracotta" />
							{r}
						</li>
					))}
				</ul>
			) : null}
		</section>
	);
}
