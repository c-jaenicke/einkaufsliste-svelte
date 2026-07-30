import { apiJson, apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const pets = await apiJson('/pets');

	// Load activity logs for every pet so each gets its own collapsible section.
	const petsWithLogs = await Promise.all(
		pets.map(async (pet: any) => {
			try {
				const logs = await apiJson(`/pets/${pet.id}/logs`);
				return { ...pet, logs };
			} catch {
				return { ...pet, logs: [] };
			}
		})
	);

	return { pets: petsWithLogs };
};

export const actions: Actions = {
	feed: async ({ request }) => {
		const formData = await request.formData();
		const petId = Number(formData.get('pet_id'));
		const amount = formData.get('amount') as string;

		const result = await apiRequest(`/pets/${petId}/feed`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ amount })
		});
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		throw redirect(303, `/pet`);
	},
	toggleLocation: async ({ request }) => {
		const formData = await request.formData();
		const petId = Number(formData.get('pet_id'));

		const result = await apiRequest(`/pets/${petId}/location`, { method: 'PATCH' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		throw redirect(303, `/pet`);
	}
};
