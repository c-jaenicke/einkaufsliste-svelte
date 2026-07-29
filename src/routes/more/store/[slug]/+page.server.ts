import { apiJson, apiRequest } from '$lib/server/api';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const name = params.slug;

	const [items, stores, categories] = await Promise.all([
		apiJson(`/items?store_name=${encodeURIComponent(name)}`),
		apiJson('/stores'),
		apiJson('/categories')
	]);

	return { name, items, stores, categories };
};

export const actions: Actions = {
	switch: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		const result = await apiRequest(`/items/${id}/status`, { method: 'PATCH' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}
	}
};
