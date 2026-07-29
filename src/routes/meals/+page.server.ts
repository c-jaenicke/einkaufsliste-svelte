import { apiJson, apiRequest } from '$lib/server/api';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [plans, recipes, stores, cats] = await Promise.all([
		apiJson('/meal-plans'),
		apiJson('/recipes'),
		apiJson('/stores'),
		apiJson('/categories')
	]);

	return { plans, recipes, stores, cats };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const date = formData.get('date') as string;
		const meal_type = formData.get('meal_type') as string;
		const selection_type = formData.get('selection_type') as string;

		let payload: any = { date, meal_type };

		if (selection_type === 'recipe') {
			payload.recipe_id = parseInt(formData.get('recipe_id') as string);
		} else {
			payload.note = formData.get('note') as string;
		}

		const result = await apiRequest('/meal-plans', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (!result.ok) {
			return fail(result.status, { success: false, error: result.message });
		}

		return { success: true };
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const result = await apiRequest(`/meal-plans/${id}`, { method: 'DELETE' });
		if (!result.ok) {
			return fail(result.status, { success: false, error: result.message });
		}

		return { success: true };
	},
	addRecipeToShoppingList: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('recipe_id') as string;

		const result = await apiRequest(`/recipes/${id}/add`, { method: 'POST' });
		if (!result.ok) {
			return fail(result.status, { success: false, error: result.message });
		}

		return { success: true };
	},
	addWeekIngredients: async ({ request }) => {
		const formData = await request.formData();
		const idsStr = formData.get('recipe_ids') as string;
		if (!idsStr) return { success: true, totalAdded: 0 };

		const ids = idsStr
			.split(',')
			.map((id) => parseInt(id))
			.filter((id) => !isNaN(id));
		let totalAdded = 0;

		for (const rid of ids) {
			const result = await apiRequest(`/recipes/${rid}/add`, { method: 'POST' });
			if (result.ok) {
				totalAdded += result.data.added_count || 0;
			}
		}

		return { success: true, totalAdded };
	}
};
