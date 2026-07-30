import { apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	new: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const color = formData.get('color') as string;

		const result = await apiRequest('/categories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, color })
		});
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		throw redirect(303, '/more');
	}
};
