/**
 * The middleware refreshes the guest's access token (and persists it in the session cookie),
 * then hands the fresh token, and the customer id it belongs to, to the API route or /account
 * page in the same request through these headers. Server code reads them instead of calling
 * `auth()` again: that would see the old cookie and try to refresh a second time, and the
 * backend rotates refresh tokens (each works once).
 */
export const ACCESS_TOKEN_HEADER = 'x-oc-access-token';
export const CUSTOMER_ID_HEADER = 'x-oc-customer-id';
