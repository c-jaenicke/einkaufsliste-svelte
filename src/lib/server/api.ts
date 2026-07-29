import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

// Read at request time (not build time) so the same built image can be
// deployed with a different backend URL per environment (docker-compose vs
// k8s) via a runtime env var, instead of baking it in at `vite build`.
export const API_BASE = env.API_BASE;

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
	try {
		const body = await res.json();
		if (body?.detail) return body.detail;
	} catch {
		// Response body wasn't JSON - fall through to the generic message.
	}
	return fallback;
}

/**
 * For `load()` functions: fetches JSON from the backend, and turns a
 * non-2xx response into a SvelteKit error page (instead of letting
 * `res.json()` throw an opaque parse error on an error body).
 */
export async function apiJson<T = any>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, init);
	if (!res.ok) {
		const message = await extractErrorMessage(res, `Request to ${path} failed (${res.status})`);
		throw error(res.status, message);
	}
	return res.json();
}

export type ApiResult<T = any> =
	{ ok: true; data: T } | { ok: false; status: number; message: string };

/**
 * For form actions: fetches from the backend and reports failure instead of
 * silently continuing (e.g. redirecting) as if the request had succeeded.
 */
export async function apiRequest<T = any>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
	const res = await fetch(`${API_BASE}${path}`, init);
	if (!res.ok) {
		const message = await extractErrorMessage(res, `Request to ${path} failed (${res.status})`);
		return { ok: false, status: res.status, message };
	}
	// Every mutating endpoint in this API returns a JSON body (even if just {"status": "..."}).
	const data = await res.json();
	return { ok: true, data };
}
