import { apiJson, apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [stores, cats] = await Promise.all([apiJson('/stores'), apiJson('/categories')]);

	return { stores, cats };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const ingredientsJson = formData.get('ingredients_json') as string;

		let ingredients: any[] = [];
		try {
			ingredients = JSON.parse(ingredientsJson);
		} catch (e) {
			console.error('Failed to parse recipe ingredients JSON', e);
		}

		const recipePayload = {
			name,
			description,
			ingredients
		};

		// 1. Post recipe details
		const createResult = await apiRequest('/recipes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(recipePayload)
		});
		if (!createResult.ok) {
			return fail(createResult.status, { error: createResult.message });
		}

		// 2. Check for uploaded image file
		const imageFile = formData.get('image') as File | null;
		if (imageFile && imageFile.size > 0) {
			const uploadData = new FormData();
			uploadData.append('file', imageFile);

			const uploadResult = await apiRequest(`/recipes/${createResult.data.id}/image`, {
				method: 'POST',
				body: uploadData
			});
			if (!uploadResult.ok) {
				return fail(uploadResult.status, { error: uploadResult.message });
			}
		}

		throw redirect(303, '/recipes');
	}
};
