/** JSON request to the template's own /api/account routes; throws the route's `error` message. */
export async function accountRequest<T = unknown>(url: string, method: 'PUT' | 'POST', body?: unknown): Promise<T> {
	const res = await fetch(url, {
		method,
		headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	const data = (await res.json().catch(() => null)) as { error?: string } | null;
	if (!res.ok) {
		if (res.status === 401) throw new Error('Your session has ended. Please sign in again.');
		throw new Error(data?.error || 'Something went wrong. Please try again.');
	}
	return data as T;
}
