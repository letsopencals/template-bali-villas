import type { VillaContent } from '@/lib/villa-content';
import { DetailCard } from '@/components/account/trip-detail/detail-card';

/** House manual (wifi + tips, only before/during the stay) and the house rules. */
export function HouseGuide({ content, showManual }: { content: VillaContent; showManual: boolean }) {
	return (
		<>
			{showManual ? (
				<DetailCard label="Panduan rumah" title="House manual">
					<div className="rounded-[20px] bg-sand/60 p-4">
						<p className="label">Wifi</p>
						<p className="mt-1 text-ink">{content.houseManual.wifi}</p>
					</div>
					{content.houseManual.tips.length > 0 ? (
						<ul className="mt-5 space-y-3">
							{content.houseManual.tips.map((tip) => (
								<li key={tip} className="flex gap-3 text-[0.95rem] text-ink">
									<span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-terracotta" />
									{tip}
								</li>
							))}
						</ul>
					) : null}
				</DetailCard>
			) : null}
			{content.houseRules.length > 0 ? (
				<DetailCard label="Aturan rumah" title="House rules">
					<ul className="space-y-3">
						{content.houseRules.map((rule) => (
							<li key={rule} className="flex gap-3 text-[0.95rem] text-ink">
								<span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-moss" />
								{rule}
							</li>
						))}
					</ul>
				</DetailCard>
			) : null}
		</>
	);
}
