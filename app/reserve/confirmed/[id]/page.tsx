import type { Metadata } from 'next';
import { ConfirmedView } from '@/components/reserve/confirmed/confirmed-view';

export const metadata: Metadata = { title: 'Booking confirmed', robots: { index: false } };

type Params = Promise<{ id: string }>;

export default async function ConfirmedPage({ params }: { params: Params }) {
	const { id } = await params;
	return <ConfirmedView orderId={id} />;
}
