import { AmenityIcon } from '@/components/villa/amenity-icon';

/** Icon grid of what the house has. */
export function Amenities({ amenities }: { amenities: string[] }) {
	if (amenities.length === 0) return null;
	return (
		<section aria-labelledby="amenities-title">
			<p className="label">In the house</p>
			<h2 id="amenities-title" className="display-sm mt-3">
				What’s here
			</h2>
			<ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
				{amenities.map((a) => (
					<li key={a} className="flex items-center gap-3.5 border-b border-line pb-4 text-[0.98rem]">
						<AmenityIcon name={a} />
						{a}
					</li>
				))}
			</ul>
		</section>
	);
}
