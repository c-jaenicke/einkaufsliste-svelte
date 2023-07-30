import { API_BASE } from '$env/static/private';

export async function load() {
	const respItems = await fetch(API_BASE + '/item/specific?status=new');
	const items = await respItems.json();

	const respStores = await fetch(API_BASE + '/stores/all');
	const stores = await respStores.json();

	const respCats = await fetch(API_BASE + '/category/all');
	const cats = await respCats.json();

	return { items, stores, cats };
}

/** @type {import('./$types').Actions} */
export const actions = {
	deleteStore: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		await fetch(API_BASE + '/store/' + id + '/delete', {
			method: 'DELETE'
		});
	},
	deleteCategory: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		await fetch(API_BASE + '/category/' + id + '/delete', {
			method: 'DELETE'
		});
	},
	deleteItem: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		await fetch(API_BASE + '/item/' + id + '/delete', {
			method: 'DELETE'
		});
	}
};
