import { json } from '@sveltejs/kit';

// Liveness/readiness probe target. Deliberately doesn't call the backend so
// a backend outage doesn't also fail the frontend's own health check.
export function GET() {
	return json({ status: 'ok' });
}
