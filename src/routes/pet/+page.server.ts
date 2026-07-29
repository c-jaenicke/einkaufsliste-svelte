import { apiJson, apiRequest } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// 1. Load all pets
	const pets = await apiJson('/pets');

	if (pets.length === 0) {
		return { pets: [], selectedPet: null, logs: [] };
	}

	// 2. Resolve selected pet ID from query params or default to first pet
	const selectedIdParam = url.searchParams.get('id');
	let selectedId = selectedIdParam ? Number(selectedIdParam) : pets[0].id;

	// Ensure the selected ID actually exists, otherwise fallback
	let selectedPet = pets.find((p: any) => p.id === selectedId);
	if (!selectedPet) {
		selectedPet = pets[0];
		selectedId = selectedPet.id;
	}

	// 3. Load logs for the selected pet
	const logs = await apiJson(`/pets/${selectedId}/logs`);

	return { pets, selectedPet, logs };
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

		throw redirect(303, `/pet?id=${petId}`);
	},
	toggleLocation: async ({ request }) => {
		const formData = await request.formData();
		const petId = Number(formData.get('pet_id'));

		const result = await apiRequest(`/pets/${petId}/location`, { method: 'PATCH' });
		if (!result.ok) {
			return fail(result.status, { error: result.message });
		}

		throw redirect(303, `/pet?id=${petId}`);
	},
	addPet: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;

		if (name && name.trim()) {
			const result = await apiRequest('/pets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name })
			});
			if (!result.ok) {
				return fail(result.status, { error: result.message });
			}
			throw redirect(303, `/pet?id=${result.data.id}`);
		}
		throw redirect(303, `/pet`);
	}
};
