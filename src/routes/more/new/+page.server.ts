import { apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	new: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const type = formData.get('type') as string;
		let payload: any = { name };

		if (type === 'category') {
			payload.color = formData.get('color') as string;
		}

		const endpoint = type === 'category' ? '/categories' : '/stores';
		const result = await apiRequest(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		throw redirect(303, '/more');
	}
};
