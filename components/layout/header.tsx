'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';
import { bookCta } from '@/lib/contact';
import { buttonClasses } from '@/components/ui/button';
import { LumbungMark } from '@/components/motifs/lumbung-mark';
import { MenuOverlay } from '@/components/layout/menu-overlay';

const SCROLL_THRESHOLD = 32;

/**
 * Routes whose first section is a full-bleed photo/video hero: the header
 * starts transparent with cream text there. Everywhere else it is paper.
 * Page agents add a route here (TODO for the foundation owner) rather than
 * restyling the header from the page.
 */
export const TRANSPARENT_HEADER_ROUTES: readonly RegExp[] = [/^\/$/, /^\/experiences$/, /^\/about$/, /^\/getting-there$/];

/**
 * Fixed site header (z-60). Transparent over the hero, then paper with a
 * hairline once the page scrolls. Desktop shows siteConfig.nav inline; the
 * hamburger opens the jungle menu overlay at every breakpoint.
 */
export function Header() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const closeMenu = useCallback(() => setMenuOpen(false), []);
	const overHero = TRANSPARENT_HEADER_ROUTES.some((r) => r.test(pathname));
	const solid = scrolled || !overHero;
	const light = menuOpen || !solid; // cream text
	const tripsHref = session?.customer ? '/account' : '/auth/login';

	return (
		<>
			<header
				className={clsx(
					'fixed inset-x-0 top-0 z-[60] transition-[background-color,border-color,color] duration-500',
					menuOpen ? 'border-b border-transparent bg-transparent' : solid ? 'border-b border-line bg-paper/95 backdrop-blur-md' : 'border-b border-transparent bg-transparent',
				)}
			>
				{!solid && !menuOpen ? <div aria-hidden className="scrim-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-32" /> : null}
				<div className="container-x flex h-[72px] items-center justify-between gap-6 lg:h-20">
					<Link href="/" aria-label={`${siteConfig.name} home`} className="shrink-0">
						<LumbungMark onDark={light} size={34} />
					</Link>

					<nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
						{siteConfig.nav.map((link) => {
							const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
							return (
								<Link
									key={link.href}
									href={link.href}
									aria-current={active ? 'page' : undefined}
									className={clsx(
										'link-underline text-[0.9rem] font-medium transition-colors',
										light ? (active ? 'text-cream' : 'text-cream/80 hover:text-cream') : active ? 'text-terracotta-deep' : 'text-ink hover:text-terracotta-deep',
									)}
								>
									{link.label}
								</Link>
							);
						})}
					</nav>

					<div className="flex items-center gap-2">
						<Link
							href={tripsHref}
							className={clsx(
								'hidden h-10 items-center rounded-full px-4 text-[0.9rem] font-medium transition-colors sm:inline-flex',
								light ? 'text-cream hover:bg-cream/10' : 'text-ink hover:bg-sand',
							)}
						>
							My trips
						</Link>
						<Link href={bookCta.href} className={buttonClasses('primary', 'sm', { className: 'max-sm:hidden' })}>
							Book
						</Link>
						<button
							type="button"
							onClick={() => setMenuOpen((o) => !o)}
							aria-label={menuOpen ? 'Close menu' : 'Open menu'}
							aria-expanded={menuOpen}
							aria-controls="site-menu"
							className={clsx('group flex h-11 w-11 flex-col items-center justify-center gap-[6px] rounded-full transition-colors', light ? 'hover:bg-cream/10' : 'hover:bg-sand')}
						>
							<span className={clsx('block h-[1.5px] w-5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]', light ? 'bg-cream' : 'bg-ink', menuOpen && 'translate-y-[3.75px] rotate-45')} />
							<span className={clsx('block h-[1.5px] w-5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]', light ? 'bg-cream' : 'bg-ink', menuOpen && '-translate-y-[3.75px] -rotate-45')} />
						</button>
					</div>
				</div>
			</header>

			<MenuOverlay open={menuOpen} onClose={closeMenu} tripsHref={tripsHref} />
		</>
	);
}
