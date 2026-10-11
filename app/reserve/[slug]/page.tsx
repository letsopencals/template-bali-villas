import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getStoreSettings, getVilla } from '@/lib/server-data';
import { ReserveView } from '@/components/reserve/reserve-view';
import { parseReserveParams, toReserveVilla } from '@/components/reserve/reserve-model';

export const metadata: Metadata = { title: 'Reserve', robots: { index: false } };

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ReservePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
	const [{ slug }, sp] = await Promise.all([params, searchParams]);
	const [detail, settings] = await Promise.all([getVilla(slug), getStoreSettings()]);
	if (!detail) notFound();

	const villa = toReserveVilla(detail);
	const { stay, guests } = parseReserveParams(sp, villa);

	return <ReserveView villa={villa} initialStay={stay} initialGuests={guests} checkoutSettings={settings?.checkoutSettings ?? null} />;
}
