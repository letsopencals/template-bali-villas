import type { Metadata } from 'next';
import { LinkResolver } from '@/components/auth/link-resolver';
import { getAuthImage } from '@/app/auth/_lib/auth-image';

export const metadata: Metadata = { title: 'Opening your trip', robots: { index: false, follow: false } };

type Params = Promise<{ token: string }>;

/** Magic link from booking emails: resolves on the client, then redirects. */
export default async function LinkPage({ params }: { params: Params }) {
	const [{ token }, image] = await Promise.all([params, getAuthImage()]);
	return <LinkResolver token={token} image={image.src} imageCaption={image.villa} />;
}
