import { apiJson, apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.slug;

	let item;
	try {
		item = await apiJson(`/items/${id}`);
	} catch {
		throw redirect(303, '/');
	}

	const [stores, categories] = await Promise.all([apiJson('/stores'), apiJson('/categories')]);

	return { item, stores, categories };
};

export const actions: Actions = {
	save: async ({ request, params }) => {
		const id = params.slug;
		const formData = await request.formData();

		const name = formData.get('name') as string;
		const note = formData.get('note') as string;
		const amount = Number(formData.get('amount'));
		const store = Number(formData.get('store'));
		const cat = Number(formData.get('cat'));
		const favorite = formData.get('favorite') === 'on';

		// 1. Update basic item details
		const itemPayload = {
			name,
			note,
			amount,
			store_id: store,
			category_id: cat,
			favorite
		};

		const updateResult = await apiRequest(`/items/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(itemPayload)
		});
		if (!updateResult.ok) {
			return fail(updateResult.status, { error: updateResult.message });
		}

		// 2. Check for uploaded image file
		const imageFile = formData.get('image') as File | null;
		if (imageFile && imageFile.size > 0) {
			const uploadData = new FormData();
			uploadData.append('file', imageFile);

			const uploadResult = await apiRequest(`/items/${id}/image`, {
				method: 'POST',
				body: uploadData
			});
			if (!uploadResult.ok) {
				return fail(uploadResult.status, { error: uploadResult.message });
			}
		}

		throw redirect(303, '/');
	},
	uploadImage: async ({ request, params }) => {
		const id = params.slug;
		const formData = await request.formData();
		const imageFile = formData.get('image') as File | null;
		if (!imageFile || imageFile.size === 0) {
			return fail(400, { error: 'Keine Bilddatei angegeben' });
		}

		const uploadData = new FormData();
		uploadData.append('file', imageFile);

		const uploadResult = await apiRequest(`/items/${id}/image`, {
			method: 'POST',
			body: uploadData
		});
		if (!uploadResult.ok) {
			return fail(uploadResult.status, { error: uploadResult.message });
		}

		return { success: true };
	},
	delete: async ({ params }) => {
		const id = params.slug;
		const result = await apiRequest(`/items/${id}`, { method: 'DELETE' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}
		throw redirect(303, '/');
	},
	deleteImage: async ({ params }) => {
		const id = params.slug;
		const result = await apiRequest(`/items/${id}/image`, { method: 'DELETE' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}
		// Redirect back to edit page to refresh state
		throw redirect(303, `/item/${id}`);
	}
};
