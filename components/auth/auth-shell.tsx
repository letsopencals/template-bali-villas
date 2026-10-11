import Link from 'next/link';
import { clsx } from 'clsx';
import { Wordmark } from '@/components/layout/wordmark';
import { Reveal, RevealText } from '@/components/motion/reveal';
import { IkatRule } from '@/components/motifs/ikat-rule';
import { SafeImage } from '@/components/ui/safe-image';
import { siteConfig } from '@/lib/site-config';
import { templateImage } from '@/lib/villa-images';

const FALLBACK_IMAGE = templateImage('about/valley');

export interface AuthShellProps {
	label?: string;
	/** Display heading. Use `\n` for deliberate line breaks. */
	title: string;
	intro?: React.ReactNode;
	/** Centre the copy (status screens: verifying, link resolving, errors). */
	centered?: boolean;
	children?: React.ReactNode;
	/** Line under the card (e.g. "No account yet? ..."). */
	footer?: React.ReactNode;
	/** Photo for the left half (a villa from the store). Defaults to the valley. */
	image?: string | null;
	/** Villa name shown on the photo. */
	imageCaption?: string | null;
}

/**
 * Split auth layout: a villa photo under a jungle scrim with a glass
 * "Selamat datang" card on large screens, the form on paper on the right.
 * Phones get a short photo band above the form.
 */
export function AuthShell({ label = 'Your trips · Perjalanan Anda', title, intro, centered, children, footer, image, imageCaption }: AuthShellProps) {
	const src = image || FALLBACK_IMAGE;
	return (
		<section className="relative grid min-h-screen bg-paper lg:grid-cols-[1.05fr_1fr]">
			<aside className="relative hidden p-3 pt-[92px] lg:block" aria-hidden>
				<div className="image-placeholder relative h-full overflow-hidden rounded-[24px]">
					<SafeImage src={src} alt="" fill sizes="52vw" className="object-cover" priority />
					<div className="absolute inset-0 bg-gradient-to-t from-jungle-deep/85 via-jungle-deep/25 to-transparent" />
					{imageCaption ? (
						<p className="glass absolute right-6 top-6 rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink">
							{imageCaption}
						</p>
					) : null}
					<div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
						<Wordmark layout="stacked" onDark className="text-6xl xl:text-7xl" />
						<IkatRule tone="cream" className="mt-8 w-40 opacity-80" />
						<p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-cream/85">
							<span className="italic-soft text-xl text-cream">Selamat datang.</span>
							<br />
							Your stays, arrival details and receipts, all in one place. Mount Agung will be waiting.
						</p>
					</div>
				</div>
			</aside>

			<div className="flex flex-col">
				<div className="image-placeholder relative mt-[72px] h-40 overflow-hidden lg:hidden" aria-hidden>
					<SafeImage src={src} alt="" fill sizes="100vw" className="object-cover" priority />
					<div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/30 to-jungle-deep/30" />
				</div>
				<div className="flex flex-1 items-center justify-center px-6 pb-20 pt-10 lg:px-16 lg:pt-32">
					<div className={clsx('w-full max-w-[420px]', centered && 'text-center')}>
						<Link href="/" className="mb-10 inline-block lg:hidden" aria-label={`${siteConfig.name} home`}>
							<Wordmark />
						</Link>
						<p className="label mb-5">{label}</p>
						<RevealText as="h1" text={title} trigger="mount" className="display-md text-[clamp(2.2rem,4vw,3.2rem)] text-ink" lineClassName="pb-[0.06em]" />
						{intro ? <div className="mt-5 text-[0.95rem] leading-relaxed text-ink-muted">{intro}</div> : null}
						<Reveal delay={0.15} className="mt-10">
							{children}
						</Reveal>
						{footer ? <div className="mt-10 border-t border-line pt-6 text-sm text-ink-muted">{footer}</div> : null}
					</div>
				</div>
			</div>
		</section>
	);
}

/** Inline text link used in auth footers. */
export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link href={href} className="link-underline text-ink hover:text-terracotta-deep">
			{children}
		</Link>
	);
}
