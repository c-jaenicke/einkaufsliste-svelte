import { apiJson, apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const recipes = await apiJson('/recipes');

	// Fetch detail details for each recipe (to show ingredients on page)
	const recipesWithDetails = [];
	for (const r of recipes) {
		try {
			recipesWithDetails.push(await apiJson(`/recipes/${r.id}`));
		} catch {
			recipesWithDetails.push({ ...r, ingredients: [] });
		}
	}

	return { recipes: recipesWithDetails };
};

export const actions: Actions = {
	addToList: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		const result = await apiRequest(`/recipes/${id}/add`, { method: 'POST' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		// Redirect to main shopping list page to show added ingredients
		throw redirect(303, '/');
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		const result = await apiRequest(`/recipes/${id}`, { method: 'DELETE' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		throw redirect(303, '/recipes');
	}
};
