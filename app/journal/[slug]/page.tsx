import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { templateImage } from '@/lib/villa-images';
import { getVillas } from '@/lib/server-data';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { formatPostDate, getJournalPost, journalPosts, otherPosts, readingMinutes, wordCount } from '@/content/journal';
import { ArticleBody } from '@/components/marketing/article-body';
import { JournalCard } from '@/components/marketing/journal-card';
import { EditorialImage } from '@/components/marketing/editorial-image';
import { JsonLd } from '@/components/marketing/json-ld';
import { VillaCard } from '@/components/villas/villa-card';
import { IkatRule } from '@/components/motifs/ikat-rule';
import { CanangSari } from '@/components/motifs/canang-sari';
import { Reveal } from '@/components/motion/reveal';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
	return journalPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const post = getJournalPost(slug);
	if (!post) return {};
	const title = post.titleItalic ? `${post.title} ${post.titleItalic}` : post.title;
	const image = templateImage(post.image);
	return {
		title,
		description: post.excerpt,
		alternates: { canonical: `/journal/${post.slug}` },
		authors: [{ name: post.author }],
		openGraph: { type: 'article', title, description: post.excerpt, publishedTime: post.date, authors: [post.author], images: [{ url: image, alt: post.imageAlt }] },
		twitter: { card: 'summary_large_image', title, description: post.excerpt, images: [image] },
	};
}

export default async function JournalArticlePage({ params }: { params: Params }) {
	const { slug } = await params;
	const post = getJournalPost(slug);
	if (!post) notFound();

	const villas = await getVillas();
	const related = post.relatedVillas.map((s) => villas.find((v) => v.slug === s)).filter((v): v is NonNullable<typeof v> => Boolean(v));
	const more = otherPosts(post.slug);
	const title = post.titleItalic ? `${post.title} ${post.titleItalic}` : post.title;

	return (
		<>
			<JsonLd data={articleJsonLd({ slug: post.slug, title, description: post.excerpt, date: post.date, author: post.author, image: templateImage(post.image), wordCount: wordCount(post) })} />
			<JsonLd data={breadcrumbJsonLd([['Journal', '/journal'], [title, `/journal/${post.slug}`]])} />

			<article className="bg-paper">
				<header className="grain relative">
					<div className="container-narrow relative z-[2] pb-12 pt-36 md:pt-44">
						<nav aria-label="Breadcrumb" className="label">
							<Link href="/journal" className="link-underline hover:text-ink">
								Journal
							</Link>
							<span aria-hidden className="mx-2">/</span>
							<span>{post.category}</span>
						</nav>
						<Reveal>
							<h1 className="display-lg mt-6">
								{post.title}
								{post.titleItalic ? (
									<>
										{' '}
										<em className="italic-soft">{post.titleItalic}</em>
									</>
								) : null}
							</h1>
						</Reveal>
						<Reveal delay={0.08}>
							<p className="mt-6 max-w-2xl text-[1.15rem] leading-relaxed text-ink-muted">{post.excerpt}</p>
							<p className="tabular label mt-7">
								By {post.author} · <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {readingMinutes(post)} min read
							</p>
						</Reveal>
					</div>
				</header>

				<div className="container-x">
					<EditorialImage src={templateImage(post.image)} alt={post.imageAlt} aspect="aspect-[4/3] md:aspect-[21/9]" sizes="(min-width: 1440px) 1360px, 100vw" />
				</div>

				<div className="container-narrow pb-20 pt-16 md:pt-20">
					<div className="mx-auto max-w-[680px]">
						<ArticleBody blocks={post.body} />
						<div className="mt-16 flex items-center gap-5">
							<CanangSari size={44} />
							<p className="text-ink-muted">
								Written by {post.author} at{' '}
								<Link href="/about" className="text-terracotta-deep underline underline-offset-4">
									Lumbung Sidemen
								</Link>
								. Questions about anything here? Ask us at reception.
							</p>
						</div>
					</div>
				</div>
			</article>

			{related.length ? (
				<section className="bg-paper-deep">
					<div className="container-x section-y">
						<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
							<div>
								<p className="label">Where to stay for this</p>
								<h2 className="display-md mt-3">
									Houses <em className="italic-soft">close to the story</em>
								</h2>
							</div>
							<Link href="/villas" className="link-underline text-terracotta-deep">
								All ten villas →
							</Link>
						</div>
						<ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
							{related.map((v) => (
								<li key={v.slug}>
									<VillaCard villa={v} />
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}

			{more.length ? (
				<section className="bg-paper">
					<div className="container-x section-y">
						<p className="label">Keep reading</p>
						<IkatRule className="mt-5 max-w-[180px] opacity-60" />
						<ul className="mt-12 grid gap-14 md:grid-cols-2 md:gap-10">
							{more.map((p) => (
								<li key={p.slug}>
									<JournalCard post={p} />
								</li>
							))}
						</ul>
					</div>
				</section>
			) : null}
		</>
	);
}
