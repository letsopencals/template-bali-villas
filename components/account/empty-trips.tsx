import Link from 'next/link';
import { CanangSari } from '@/components/motifs/canang-sari';
import { buttonClasses } from '@/components/ui/button';

/** No trips yet (or nothing ahead): an offering basket and a way to the villas. */
export function EmptyTrips({ returning = false }: { returning?: boolean }) {
	return (
		<div className="rounded-[24px] bg-sand/60 px-6 py-16 text-center md:py-24">
			<CanangSari size={88} className="mx-auto" />
			<p className="label mt-8">{returning ? 'Sampai jumpa lagi' : 'Belum ada perjalanan'}</p>
			<h2 className="display-sm mt-3">{returning ? 'Nothing booked right now.' : 'No trips yet.'}</h2>
			<p className="mx-auto mt-4 max-w-sm text-ink-muted">
				{returning
					? 'Come back to the valley. The terraces change with every season, and so does the light on Agung.'
					: 'Ten houses in the rice terraces of Sidemen, with Mount Agung across the valley. Your first stay will appear here.'}
			</p>
			<Link href="/villas" className={buttonClasses('primary', 'lg', { className: 'mt-8' })}>
				{returning ? 'Plan another stay' : 'Find your villa'}
			</Link>
		</div>
	);
}
