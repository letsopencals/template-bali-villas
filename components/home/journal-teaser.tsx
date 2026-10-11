import Link from 'next/link';
import { journalPosts } from '@/content/journal';
import { JournalCard } from '@/components/marketing/journal-card';
import { Reveal } from '@/components/motion/reveal';
import { buttonClasses } from '@/components/ui/button';
import { SectionHeading } from '@/components/home/section-heading';

/** Journal teaser: the three newest posts (harvest, joglo, offerings), using the journal's own card. */
export function JournalTeaser() {
	const posts = journalPosts.slice(0, 3);
	if (posts.length === 0) return null;
	return (
		<section aria-labelledby="journal-title" className="bg-paper">
			<div className="container-x section-y">
				<SectionHeading
					id="journal-title"
					eyebrow="From the journal"
					title={
						<>
							Notes on the valley, <em className="italic-soft">the houses and the days</em>
						</>
					}
					aside={
						<Link href="/journal" className={buttonClasses('outline', 'md')}>
							Read the journal
						</Link>
					}
				/>
				<ul className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
					{posts.map((post, i) => (
						<Reveal as="li" key={post.slug} delay={0.08 * i}>
							<JournalCard post={post} />
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	);
}
