import { redirect } from '@sveltejs/kit';
import { to_number } from 'svelte/internal';
import { API_BASE } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const id = params.slug;
	const respItem = await fetch(API_BASE + '/item/' + id);
	const item = await respItem.json();

	const respStores = await fetch(API_BASE + '/stores/all');
	const stores = await respStores.json();

	const respCats = await fetch(API_BASE + '/category/all');
	const categories = await respCats.json();

	return { item, stores, categories };
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
		const id = formData.get('id');

		const item = {
			name: name,
			note: note,
			amount: to_number(amount),
			store_id: to_number(store),
			category_id: to_number(cat)
		};

		await fetch(API_BASE + '/item/' + id + '/update', {
			method: 'PUT',
			body: JSON.stringify(item)
		});

		throw redirect(303, '/');
	},
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		await fetch(API_BASE + '/item/' + id + '/delete', {
			method: 'DELETE'
		});
		throw redirect(303, '/');
	}
};
