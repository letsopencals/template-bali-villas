/**
 * The backend emits `/account/appointments/{id}/view(?action=...)`, but this
 * template's trip route is `/account/trips/{id}`. Map it while preserving any
 * query string (e.g. `?action=cancel`). Order links map to the account home.
 */
export function normalizeRedirect(path: string): string {
	const appt = path.match(/^\/account\/appointments\/([^/?#]+)(?:\/view)?(\?.*)?$/);
	if (appt) return `/account/trips/${appt[1]}${appt[2] ?? ''}`;
	if (/^\/account\/orders(\/|$|\?)/.test(path) || path === '/account/appointments') return '/account';
	return path;
}
