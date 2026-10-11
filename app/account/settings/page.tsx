import type { Metadata } from 'next';
import { AccountError } from '@/components/account/account-error';
import { SessionExpired } from '@/components/account/session-expired';
import { DetailCard } from '@/components/account/trip-detail/detail-card';
import { ProfileForm } from '@/components/account/settings/profile-form';
import { MarketingForm } from '@/components/account/settings/marketing-form';
import { SignOutButton } from '@/components/account/settings/sign-out-button';
import { getAuthHeaders, getMarketingConsent, getProfile } from '../_lib/account-data';

export const metadata: Metadata = { title: 'Settings', robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
	const headers = await getAuthHeaders();
	if (!headers) return <SessionExpired />;

	const [profile, consent] = await Promise.all([getProfile(headers), getMarketingConsent(headers)]);
	if (!profile.ok) {
		if (profile.status === 401) return <SessionExpired />;
		return <AccountError title="We couldn’t load your details." body="Something went wrong on our side. Please try again in a moment." backHref="/account/settings" backLabel="Try again" />;
	}
	const p = profile.data;

	return (
		<div className="max-w-3xl">
			<header>
				<p className="label">Settings · Pengaturan</p>
				<h1 className="display-md mt-3">Your details</h1>
				<p className="mt-4 text-lg text-ink-muted">We use these for your bookings and to welcome you on arrival.</p>
			</header>

			<div className="mt-10 space-y-6">
				<DetailCard label="Profil" title="Profile">
					<ProfileForm firstName={p.firstName ?? ''} lastName={p.lastName ?? ''} phone={p.phone ?? ''} email={p.email ?? ''} />
				</DetailCard>

				{consent ? (
					<DetailCard label="Kabar dari lembah" title="News from the valley">
						<MarketingForm emailState={consent.emailState} smsState={consent.smsState} whatsappState={consent.whatsappState} />
					</DetailCard>
				) : null}

				<DetailCard label="Keluar" title="Sign out">
					<p className="mb-5 text-ink-muted">You can sign back in any time with a code sent to your email.</p>
					<SignOutButton />
				</DetailCard>
			</div>
		</div>
	);
}
