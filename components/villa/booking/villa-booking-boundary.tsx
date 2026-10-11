'use client';

import { Suspense, type ReactNode } from 'react';
import { UrlStaySync, VillaBookingProvider } from '@/components/villa/booking/booking-context';
import type { BookingVilla } from '@/components/villa/villa-page-data';

/**
 * Wraps the villa page body in the shared booking state. Server-rendered
 * children pass straight through; only the URL reader suspends, so the static
 * page never needs a duplicate fallback.
 */
export function VillaBookingBoundary({ villa, children }: { villa: BookingVilla; children: ReactNode }) {
	return (
		<VillaBookingProvider villa={villa}>
			<Suspense fallback={null}>
				<UrlStaySync />
			</Suspense>
			{children}
		</VillaBookingProvider>
	);
}
