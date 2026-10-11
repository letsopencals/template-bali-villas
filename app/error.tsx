'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, buttonClasses } from '@/components/ui/button';
import { CanangSari } from '@/components/motifs/canang-sari';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<section className="grain flex min-h-[80svh] items-center pb-24 pt-40">
			<div className="container-narrow flex flex-col items-start gap-6">
				<CanangSari size={64} />
				<p className="label">Something went wrong</p>
				<h1 className="display-lg">
					A small hiccup <em className="italic-soft">in the valley</em>
				</h1>
				<p className="max-w-lg text-ink-muted">We couldn’t load this page. Please try again; if it keeps happening, message us on WhatsApp and we will sort it out.</p>
				<div className="flex flex-wrap gap-3">
					<Button size="lg" onClick={reset}>
						Try again
					</Button>
					<Link href="/" className={buttonClasses('outline', 'lg')}>
						Back home
					</Link>
				</div>
			</div>
		</section>
	);
}
