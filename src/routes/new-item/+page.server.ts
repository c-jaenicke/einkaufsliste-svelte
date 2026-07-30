import { apiJson, apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [stores, cats] = await Promise.all([apiJson('/stores'), apiJson('/categories')]);

	return { stores, cats };
};

export const actions: Actions = {
	new: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const note = formData.get('note') as string;
		const amount = Number(formData.get('amount'));
		const store = Number(formData.get('store'));
		const cat = Number(formData.get('cat'));
		const favorite = formData.get('favorite') === 'on';

		const item = {
			name,
			note,
			amount,
			store_id: store,
			category_id: cat,
			favorite
		};

		const result = await apiRequest('/items', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(item)
		});
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		// Upload the image (if provided) now that the item has an id
		const imageFile = formData.get('image') as File | null;
		if (imageFile && imageFile.size > 0) {
			const uploadData = new FormData();
			uploadData.append('file', imageFile);

			const uploadResult = await apiRequest(`/items/${result.data.id}/image`, {
				method: 'POST',
				body: uploadData
			});
			if (!uploadResult.ok) {
				return fail(uploadResult.status, { error: uploadResult.message });
			}
		}

		throw redirect(303, '/');
	}
};
