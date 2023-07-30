import { to_number } from 'svelte/internal';
import { API_BASE } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export async function load() {
	const respStores = await fetch(API_BASE + '/stores/all');
	const stores = await respStores.json();

	const respCats = await fetch(API_BASE + '/category/all');
	const cats = await respCats.json();

	return { stores, cats };
}

/** @type {import('./$types').Actions} */
export const actions = {
	new: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const note = formData.get('note');
		const amount = formData.get('amount');
		const store = formData.get('store');
		const cat = formData.get('cat');

		const item = {
			name: name,
			note: note,
			amount: to_number(amount),
			store_id: to_number(store),
			category_id: to_number(cat)
		};

		await fetch(API_BASE + '/item/new', {
			method: 'POST',
			body: JSON.stringify(item)
		});

		throw redirect(303, '/');
	}
};
