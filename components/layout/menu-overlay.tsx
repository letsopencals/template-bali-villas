'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { siteConfig } from '@/lib/site-config';
import { addressLines, bookCta, emailHref, phoneHref, secondaryNav, whatsappHref } from '@/lib/contact';
import { EASE_EXPO } from '@/components/motion/easing';
import { TerraceLines } from '@/components/motifs/terrace-lines';
import { SidemenNow } from '@/components/layout/sidemen-now';
import { useModalOverlay } from '@/components/ui/use-overlay';

const PANEL: Variants = {
	hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
	visible: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.8, ease: EASE_EXPO } },
	exit: { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.6, ease: EASE_EXPO, delay: 0.1 } },
};
const PANEL_REDUCED: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.2 } },
	exit: { opacity: 0, transition: { duration: 0.2 } },
};
const LIST: Variants = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
	exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};
const ITEM: Variants = {
	hidden: { y: '110%' },
	visible: { y: '0%', transition: { duration: 0.9, ease: EASE_EXPO } },
	exit: { y: '110%', transition: { duration: 0.4, ease: EASE_EXPO } },
};
const FADE: Variants = {
	hidden: { opacity: 0, y: 12 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EXPO, delay: 0.55 } },
	exit: { opacity: 0, transition: { duration: 0.2 } },
};

export interface MenuOverlayProps {
	open: boolean;
	onClose: () => void;
	/** "My trips" target (/account or /auth/login). */
	tripsHref?: string;
}

/**
 * Full-screen jungle menu (z-55, under the header so the close button stays
 * on top). Big Fraunces links, secondary links and the contact block. Closes on
 * route change and Escape, traps focus, pauses Lenis and body scroll.
 */
export function MenuOverlay({ open, onClose, tripsHref = '/account' }: MenuOverlayProps) {
	const pathname = usePathname();
	const reduce = useReducedMotion();
	const panelRef = useRef<HTMLDivElement>(null);
	const lastPath = useRef(pathname);
	useModalOverlay(open, onClose, panelRef);

	useEffect(() => {
		if (lastPath.current !== pathname) {
			lastPath.current = pathname;
			onClose();
		}
	}, [pathname, onClose]);

	const links = [...siteConfig.nav, bookCta];
	const secondary = secondaryNav.map((l) => (l.href === '/account' ? { ...l, href: tripsHref } : l));

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					id="site-menu"
					ref={panelRef}
					role="dialog"
					aria-modal="true"
					aria-label="Site menu"
					data-lenis-prevent
					className="on-dark fixed inset-0 z-[55] overflow-y-auto bg-jungle text-cream"
					variants={reduce ? PANEL_REDUCED : PANEL}
					initial="hidden"
					animate="visible"
					exit="exit"
				>
					<TerraceLines onDark />
					<div className="container-x relative grid min-h-full gap-14 pb-12 pt-32 lg:grid-cols-[1fr_340px] lg:pt-36">
						<motion.ul variants={LIST} className="flex flex-col">
							{links.map((link, i) => (
								<li key={link.href} className="overflow-hidden border-b border-line-on-dark">
									<motion.div variants={reduce ? undefined : ITEM}>
										<Link href={link.href} onClick={onClose} className="group flex items-baseline gap-5 py-3 lg:gap-8 lg:py-4">
											<span className="tabular w-8 text-xs text-cream/50 transition-colors group-hover:text-terracotta-bright">{String(i + 1).padStart(2, '0')}</span>
											<span className="font-display text-[clamp(2.2rem,6vw,4.75rem)] font-light leading-[1.05] tracking-[-0.02em] transition-[color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:italic group-hover:text-terracotta-bright">
												{link.label}
											</span>
										</Link>
									</motion.div>
								</li>
							))}
						</motion.ul>

						<motion.aside variants={FADE} className="flex flex-col justify-end gap-10 text-[0.95rem]">
							<ul className="flex flex-wrap gap-x-6 gap-y-3">
								{secondary.map((link) => (
									<li key={link.label}>
										<Link href={link.href} onClick={onClose} className="link-underline text-cream/80 hover:text-cream">
											{link.label}
										</Link>
									</li>
								))}
							</ul>

							<div className="space-y-2">
								<p className="label">Talk to the family</p>
								<a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="block text-lg hover:text-terracotta-bright">
									WhatsApp {siteConfig.contact.whatsapp}
								</a>
								<a href={phoneHref} className="block text-cream/75 hover:text-cream">
									{siteConfig.contact.phone}
								</a>
								<a href={emailHref} className="block text-cream/75 hover:text-cream">
									{siteConfig.contact.email}
								</a>
							</div>

							<div className="space-y-1.5">
								<p className="label">Find us</p>
								{addressLines().map((l) => (
									<p key={l} className="text-cream/75">
										{l}
									</p>
								))}
								<p className="pt-1 text-cream/55">{siteConfig.contact.hours}</p>
							</div>

							<SidemenNow onDark />
						</motion.aside>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
