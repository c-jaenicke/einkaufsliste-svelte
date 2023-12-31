import { API_BASE } from '$env/static/private';

export async function load() {
	const respStores = await fetch(API_BASE + '/stores/all');
	const stores = await respStores.json();

	const respCategories = await fetch(API_BASE + '/category/all');
	const categories = await respCategories.json();

	const respAll = await fetch(API_BASE + '/item/all');
	const items = await respAll.json();

	return { stores, categories, items };
}

/** @type {import('./$types').Actions} */
export const actions = {
	switch: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		await fetch(API_BASE + '/item/' + id + '/switch', {
			method: 'PATCH'
		});
	}
};
