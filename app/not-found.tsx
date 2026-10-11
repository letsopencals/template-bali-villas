import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { CanangSari } from '@/components/motifs/canang-sari';
import { TerraceLines } from '@/components/motifs/terrace-lines';

export default function NotFound() {
	return (
		<section className="grain relative flex min-h-[80svh] items-center overflow-hidden pb-24 pt-40">
			<TerraceLines />
			<div className="container-narrow relative flex flex-col items-start gap-6">
				<CanangSari size={64} />
				<p className="label">Page not found</p>
				<h1 className="display-lg">
					This path ends <em className="italic-soft">in the rice field</em>
				</h1>
				<p className="max-w-lg text-ink-muted">The page you were looking for has moved or never existed. The villas are still where we left them.</p>
				<div className="flex flex-wrap gap-3">
					<Link href="/villas" className={buttonClasses('primary', 'lg')}>
						See the villas
					</Link>
					<Link href="/" className={buttonClasses('outline', 'lg')}>
						Back home
					</Link>
				</div>
			</div>
		</section>
	);
}
