import Link from 'next/link';
import { CanangSari } from '@/components/motifs/canang-sari';
import { buttonClasses } from '@/components/ui/button';
import { emailHref, whatsappHref } from '@/lib/contact';

/** Generic "couldn't load" state for account pages (API down, 404 trip, ...). */
export function AccountError({ title, body, backHref = '/account', backLabel = 'Back to my trips' }: { title: string; body: string; backHref?: string; backLabel?: string }) {
	return (
		<div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
			<CanangSari size={72} />
			<p className="label mt-8">Maaf</p>
			<h1 className="display-sm mt-3">{title}</h1>
			<p className="mt-4 text-ink-muted">{body}</p>
			<div className="mt-8 flex flex-wrap justify-center gap-3">
				<Link href={backHref} className={buttonClasses('primary', 'md')}>
					{backLabel}
				</Link>
				<a href={whatsappHref} target="_blank" rel="noreferrer" className={buttonClasses('outline', 'md')}>
					WhatsApp us
				</a>
			</div>
			<a href={emailHref} className="link-underline mt-6 text-sm text-ink-muted">
				Or email the team
			</a>
		</div>
	);
}
