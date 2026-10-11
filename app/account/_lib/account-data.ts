import '@/lib/opencals';
import { cache } from 'react';
import {
	AppointmentService,
	FeedbackQuestionService,
	InvoiceService,
	OpencalsApiError,
	SelfService,
	type AppointmentDetailResponse,
	type AppointmentListItemResponse,
	type FeedbackQuestionResponse,
	type InvoiceResponse,
	type MarketingConsentResponse,
	type SelfServiceProfileResponse,
} from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { getVillas, type Villa } from '@/lib/server-data';
import { publicPayload } from '@/lib/public-payload';
import type { TripVilla } from '@/components/account/trip-model';

/**
 * Server-only readers for /account (private folder, not a route). Each call
 * carries the signed-in guest's bearer token. Never import from a client file.
 */

export type AccountResult<T> = { ok: true; data: T } | { ok: false; status: number };

export type AuthHeaders = { Authorization: string };

/** Bearer headers for the current session, or null when signed out / the token refresh failed. */
export const getAuthHeaders = cache(async (): Promise<AuthHeaders | null> => {
	const token = await getAccessToken();
	return token ? { Authorization: `Bearer ${token}` } : null;
});

function failure(err: unknown): { ok: false; status: number } {
	if (err instanceof OpencalsApiError) return { ok: false, status: err.status };
	console.error('[account]', err);
	return { ok: false, status: 500 };
}

/** Every appointment of the guest (newest first). Cart holds are filtered later by `isRealTrip`. */
export async function listAppointments(headers: AuthHeaders): Promise<AccountResult<AppointmentListItemResponse[]>> {
	try {
		const { data } = await AppointmentService.list({
			query: { take: 100, page: 1, orderBy: 'from', order: 'DESC' },
			headers,
		});
		return { ok: true, data: publicPayload(data?.data ?? []) };
	} catch (err) {
		return failure(err);
	}
}

export const getAppointment = cache(async (id: string, headers: AuthHeaders): Promise<AccountResult<AppointmentDetailResponse>> => {
	try {
		const { data } = await AppointmentService.find({ path: { appointmentId: id }, headers });
		if (!data) return { ok: false, status: 404 };
		return { ok: true, data: publicPayload(data) };
	} catch (err) {
		return failure(err);
	}
});

/** Invoices and paid receipts for an order. Empty on failure (receipts are a nice-to-have here). */
export async function listInvoices(orderId: string, headers: AuthHeaders): Promise<InvoiceResponse[]> {
	try {
		const { data } = await InvoiceService.list({ path: { orderId }, headers });
		return Array.isArray(data) ? data.filter((i) => i.status !== 'void' && i.status !== 'draft') : [];
	} catch {
		return [];
	}
}

/** The store's feedback questions for a product (English). Empty on failure. */
export async function listFeedbackQuestions(productId: string): Promise<FeedbackQuestionResponse[]> {
	try {
		const { data } = await FeedbackQuestionService.listTranslations({ path: { productId, language: 'en' } });
		return Array.isArray(data) ? [...data].sort((a, b) => a.order - b.order) : [];
	} catch {
		return [];
	}
}

/** The guest's own profile, slimmed to what the account UI shows (the raw response also carries a password field). */
export interface ProfileView {
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	phone: string | null;
}

function toProfileView(p: SelfServiceProfileResponse): ProfileView {
	return { firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone };
}

export const getProfile = cache(async (headers: AuthHeaders): Promise<AccountResult<ProfileView>> => {
	try {
		const { data } = await SelfService.getProfile({ headers });
		if (!data) return { ok: false, status: 404 };
		return { ok: true, data: toProfileView(data) };
	} catch (err) {
		return failure(err);
	}
});

/** Marketing consent, or null when the guest has none yet (no address on file) or it can't be read. */
export async function getMarketingConsent(headers: AuthHeaders): Promise<MarketingConsentResponse | null> {
	try {
		const { data } = await SelfService.getMarketingConsent({ headers });
		return data ?? null;
	} catch {
		return null;
	}
}

/* --------------------------------------------------------------- villas */

function tripVillaOf(v: Villa): TripVilla {
	return { slug: v.slug, title: v.title, type: v.content?.type ?? null, image: v.image };
}

/** slug (and variant slug) → villa summary for trip cards. */
export const getVillaLookup = cache(async (): Promise<Map<string, TripVilla>> => {
	const villas = await getVillas();
	const map = new Map<string, TripVilla>();
	for (const v of villas) {
		const summary = tripVillaOf(v);
		map.set(v.slug, summary);
		for (const variant of v.product.variants ?? []) if (variant.slug && !map.has(variant.slug)) map.set(variant.slug, summary);
	}
	return map;
});

/** The villa for an appointment's product, falling back to the appointment's own product fields. */
export function villaFor(
	lookup: Map<string, TripVilla>,
	product: { slug: string; title: string; image?: { url?: string | null } | null } | null | undefined,
): TripVilla {
	const hit = product?.slug ? lookup.get(product.slug) : undefined;
	if (hit) return hit;
	return { slug: product?.slug ?? '', title: product?.title ?? 'Your villa', type: null, image: product?.image?.url ?? null };
}
