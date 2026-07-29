import { apiJson, apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.slug;

	let recipe;
	try {
		recipe = await apiJson(`/recipes/${id}`);
	} catch {
		throw redirect(303, '/recipes');
	}

	const [stores, cats] = await Promise.all([apiJson('/stores'), apiJson('/categories')]);

	return { recipe, stores, cats };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const id = params.slug;
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

		// 1. Update basic recipe details and replace ingredients
		const updateResult = await apiRequest(`/recipes/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(recipePayload)
		});
		if (!updateResult.ok) {
			return fail(updateResult.status, { error: updateResult.message });
		}

		// 2. Check for uploaded image file
		const imageFile = formData.get('image') as File | null;
		if (imageFile && imageFile.size > 0) {
			const uploadData = new FormData();
			uploadData.append('file', imageFile);

			const uploadResult = await apiRequest(`/recipes/${id}/image`, {
				method: 'POST',
				body: uploadData
			});
			if (!uploadResult.ok) {
				return fail(uploadResult.status, { error: uploadResult.message });
			}
		}

		throw redirect(303, '/recipes');
	},
	delete: async ({ params }) => {
		const id = params.slug;
		const result = await apiRequest(`/recipes/${id}`, { method: 'DELETE' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}
		throw redirect(303, '/recipes');
	},
	deleteImage: async ({ params }) => {
		const id = params.slug;
		const result = await apiRequest(`/recipes/${id}/image`, { method: 'DELETE' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}
		throw redirect(303, `/recipes/${id}`);
	}
};
