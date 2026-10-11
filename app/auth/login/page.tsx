import { LoginForm } from '@/components/auth/login-form';
import { getAuthImage } from '../_lib/auth-image';
// Only same-site paths are allowed as callbacks (no backslashes, same origin once resolved).
import { safeCallback } from '@/app/api/_lib/guards';

type Search = Promise<{ callbackUrl?: string | string[]; email?: string | string[] }>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Passwordless sign-in: email → 6-digit code. A villa photo of the day sits beside the form. */
export default async function LoginPage({ searchParams }: { searchParams: Search }) {
	const [query, image] = await Promise.all([searchParams, getAuthImage()]);
	return (
		<LoginForm
			callbackUrl={safeCallback(first(query.callbackUrl))}
			initialEmail={first(query.email) ?? ''}
			image={image.src}
			imageCaption={image.villa}
		/>
	);
}
