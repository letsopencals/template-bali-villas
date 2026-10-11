import type { Metadata } from 'next';
import { AccountNav } from '@/components/account/account-nav';

export const metadata: Metadata = {
	title: 'My trips',
	robots: { index: false, follow: false },
};

/** Paper shell for /account/*: clears the fixed header, then a small tab nav (My trips / Settings). */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="grain min-h-screen bg-paper pb-24 pt-28 lg:pb-32 lg:pt-32">
			<div className="container-x">
				<AccountNav />
				<div className="mt-10 lg:mt-14">{children}</div>
			</div>
		</div>
	);
}
