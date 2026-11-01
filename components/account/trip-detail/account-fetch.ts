import { onSessionExpired } from '@/lib/session-expired';
import { readFieldErrors, type ApiFieldErrors } from '@/lib/field-errors';

/** A failed account request: the route's `error` message, plus the API's field errors when it sent any. */
export class AccountRequestError extends Error {
	constructor(
		message: string,
		readonly fieldErrors: ApiFieldErrors = [],
	) {
		super(message);
	}
}

/** JSON request to the template's own /api/account routes; throws an `AccountRequestError` with the route's message. */
export async function accountRequest<T = unknown>(url: string, method: 'PUT' | 'POST', body?: unknown): Promise<T> {
	const res = await fetch(url, {
		method,
		headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const data = (await res.json().catch(() => null)) as { error?: string } | null;
	if (!res.ok) {
		if (res.status === 401) {
			onSessionExpired();
			throw new Error('Your session has ended. Please sign in again.');
		}
		throw new AccountRequestError(data?.error || 'Something went wrong. Please try again.', readFieldErrors(data));
	}
	return data as T;
}
