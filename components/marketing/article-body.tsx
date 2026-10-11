import type { JournalBlock } from '@/content/journal';

/** Renders a journal post body. Prose column, display h2s, italic pull quotes and term asides. */
export function ArticleBody({ blocks }: { blocks: readonly JournalBlock[] }) {
	return (
		<div className="text-[1.08rem] leading-[1.8] text-ink md:text-[1.14rem]">
			{blocks.map((b, i) => (
				<ArticleBlock key={i} block={b} first={i === 0} />
			))}
		</div>
	);
}

function ArticleBlock({ block: b, first }: { block: JournalBlock; first: boolean }) {
	switch (b.type) {
		case 'p':
			return (
				<p className={first ? 'mt-0 first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-[4.2rem] first-letter:font-light first-letter:leading-[0.85] first-letter:text-terracotta' : 'mt-6'}>
					{b.text}
				</p>
			);
		case 'h2':
			return <h2 className="display-sm mt-14 text-ink">{b.text}</h2>;
		case 'quote':
			return (
				<blockquote className="my-12 border-l-2 border-terracotta pl-6 md:-ml-8 md:pl-8">
					<p className="font-display text-[1.6rem] font-light leading-snug md:text-[1.9rem]">
						<em className="italic-soft">“{b.text}”</em>
					</p>
					{b.cite ? <footer className="label mt-4">{b.cite}</footer> : null}
				</blockquote>
			);
		case 'list':
			return (
				<ul className="mt-6 space-y-3">
					{b.items.map((item) => (
						<li key={item} className="flex gap-4">
							<span aria-hidden className="mt-[0.75rem] h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
							<span>{item}</span>
						</li>
					))}
				</ul>
			);
		case 'term':
			return (
				<aside className="my-10 flex flex-col gap-1 rounded-[24px] bg-sand px-7 py-6 sm:flex-row sm:items-baseline sm:gap-6">
					<span className="font-display text-[1.5rem] italic text-terracotta-deep">{b.term}</span>
					<span className="text-[0.98rem] leading-relaxed text-ink-muted">{b.meaning}</span>
				</aside>
			);
	}
}
