import { Reveal } from '@/components/motion/reveal';

export interface ContactChannel {
	label: string;
	local: string;
	value: string;
	href: string;
	external: boolean;
	note: string;
}

/** Three large contact tiles: WhatsApp, phone, email. */
export function ContactChannels({ channels }: { channels: readonly ContactChannel[] }) {
	return (
		<ul className="grid gap-5 md:grid-cols-3">
			{channels.map((c, i) => (
				<Reveal as="li" key={c.label} delay={i * 0.06}>
					<a
						href={c.href}
						{...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
						className="group flex h-full flex-col rounded-[24px] bg-sand p-7 transition-colors hover:bg-sand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
					>
						<span className="label">{c.label}</span>
						<span className="mt-1 font-display text-[0.95rem] italic text-terracotta-deep">{c.local}</span>
						<span className="tabular mt-6 break-all font-display text-[1.45rem] leading-snug text-ink transition-colors group-hover:text-terracotta-deep">{c.value}</span>
						<span className="mt-3 text-[0.9rem] text-ink-muted">{c.note}</span>
						<span aria-hidden className="mt-6 text-terracotta transition-transform duration-300 group-hover:translate-x-1">→</span>
					</a>
				</Reveal>
			))}
		</ul>
	);
}
