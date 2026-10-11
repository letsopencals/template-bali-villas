import { emailHref, phoneHref, whatsappHref } from '@/lib/contact';
import { siteConfig } from '@/lib/site-config';

/** WhatsApp / phone / email for when something can't be done online. */
export function ContactUs() {
	return (
		<div className="mt-6 rounded-[20px] bg-sand/60 p-5">
			<p className="label">Hubungi kami · Talk to us</p>
			<p className="mt-2 text-sm text-ink-muted">{siteConfig.contact.hours}</p>
			<div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.95rem]">
				<a href={whatsappHref} target="_blank" rel="noreferrer" className="link-underline">
					WhatsApp {siteConfig.contact.whatsapp}
				</a>
				<a href={phoneHref} className="link-underline">
					Call
				</a>
				<a href={emailHref} className="link-underline">
					{siteConfig.contact.email}
				</a>
			</div>
		</div>
	);
}
