import Link from 'next/link';
import { clsx } from 'clsx';
import { templateImage } from '@/lib/villa-images';
import { formatPostDate, readingMinutes, type JournalPost } from '@/content/journal';
import { SafeImage } from '@/components/ui/safe-image';

export interface JournalCardProps {
	post: JournalPost;
	/** Large lead card (first post on /journal). */
	lead?: boolean;
	className?: string;
}

/** Journal post card: photo, category, title with its italic half, excerpt, date and reading time. */
export function JournalCard({ post, lead, className }: JournalCardProps) {
	return (
		<Link href={`/journal/${post.slug}`} className={clsx('group block outline-none', className)}>
			<article className={clsx(lead && 'grid items-center gap-8 md:grid-cols-12 md:gap-14')}>
				<div
					className={clsx(
						'image-placeholder relative w-full overflow-hidden transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-terracotta group-focus-visible:ring-offset-4',
						lead ? 'arch aspect-[4/5] md:col-span-6 md:aspect-[5/6]' : 'aspect-[4/3] rounded-[20px]',
					)}
				>
					<SafeImage
						src={templateImage(post.image)}
						alt={post.imageAlt}
						fill
						sizes={lead ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 33vw, 100vw'}
						className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
					/>
				</div>
				<div className={clsx(lead ? 'md:col-span-5 md:col-start-8' : 'mt-6')}>
					<p className="label">{post.category}</p>
					<h3 className={clsx('mt-3 transition-colors group-hover:text-terracotta-deep', lead ? 'display-md' : 'display-sm')}>
						{post.title}
						{post.titleItalic ? (
							<>
								{' '}
								<em className="italic-soft">{post.titleItalic}</em>
							</>
						) : null}
					</h3>
					<p className={clsx('mt-4 text-ink-muted', lead && 'text-[1.08rem]')}>{post.excerpt}</p>
					<p className="tabular label mt-5">
						{formatPostDate(post.date)} · {readingMinutes(post)} min read · {post.author}
					</p>
				</div>
			</article>
		</Link>
	);
}
