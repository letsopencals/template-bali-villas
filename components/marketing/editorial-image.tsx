import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { RevealImage } from '@/components/motion/reveal';

export interface EditorialImageProps {
	src: string;
	alt: string;
	/** Aspect class, e.g. `aspect-[4/5]`. */
	aspect?: string;
	arch?: boolean;
	caption?: string;
	sizes?: string;
	className?: string;
	from?: 'up' | 'down' | 'left' | 'right';
}

/** A wiped-in editorial photo with the placeholder gradient behind it and an optional caption on a terracotta rule. */
export function EditorialImage({ src, alt, aspect = 'aspect-[4/5]', arch, caption, sizes = '(min-width: 1024px) 45vw, 100vw', className, from = 'up' }: EditorialImageProps) {
	return (
		<figure className={className}>
			<RevealImage from={from} className={clsx('image-placeholder w-full', aspect, arch ? 'arch' : 'rounded-[20px]')}>
				<SafeImage src={src} alt={alt} fill sizes={sizes} className="object-cover" />
			</RevealImage>
			{caption ? (
				<figcaption className="mt-4 flex items-center gap-3 text-[0.85rem] text-ink-muted">
					<span aria-hidden className="h-px w-8 shrink-0 bg-terracotta" />
					{caption}
				</figcaption>
			) : null}
		</figure>
	);
}
