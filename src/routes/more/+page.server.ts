import { apiJson, apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [stores, cats] = await Promise.all([apiJson('/stores'), apiJson('/categories')]);

	return { stores, cats };
};

export const actions: Actions = {
	deleteStore: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		const result = await apiRequest(`/stores/${id}`, { method: 'DELETE' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		throw redirect(303, '/more');
	},
	deleteCategory: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		const result = await apiRequest(`/categories/${id}`, { method: 'DELETE' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		throw redirect(303, '/more');
	}
};
