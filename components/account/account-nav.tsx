'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const LINKS = [
	{ href: '/account', label: 'My trips', match: (p: string) => p === '/account' || p.startsWith('/account/trips') },
	{ href: '/account/settings', label: 'Settings', match: (p: string) => p.startsWith('/account/settings') },
] as const;

/** Pill tab nav at the top of every account page. */
export function AccountNav() {
	const pathname = usePathname() ?? '/account';
	return (
		<nav aria-label="Account" className="flex items-center gap-2">
			{LINKS.map((l) => {
				const active = l.match(pathname);
				return (
					<Link
						key={l.href}
						href={l.href}
						aria-current={active ? 'page' : undefined}
						className={clsx(
							'inline-flex h-9 items-center rounded-full px-4 text-[0.82rem] font-semibold transition-colors',
							active ? 'bg-jungle text-cream' : 'bg-sand text-ink-muted hover:bg-sand-strong hover:text-ink',
						)}
					>
						{l.label}
					</Link>
				);
			})}
		</nav>
	);
}
