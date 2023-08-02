import { API_BASE } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const name = params.slug;

	const resp = await fetch(API_BASE + '/item/specific/?type=category&name=' + name);
	const items = await resp.json();

	const respStores = await fetch(API_BASE + '/stores/all');
	const stores = await respStores.json();

	const respCats = await fetch(API_BASE + '/category/all');
	const categories = await respCats.json();

	return { name, items, stores, categories };
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
