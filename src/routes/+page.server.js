import { API_BASE } from '$env/static/private';

export async function load() {
	const respNew = await fetch(API_BASE + '/item/specific?status=new');
	const itemsNew = await respNew.json();

	// TODO: get list of items in single call and filter in frontend
	const respOld = await fetch(API_BASE + '/item/specific?status=bought');
	const itemsOld = await respOld.json();

	const respStores = await fetch(API_BASE + '/stores/all');
	const stores = await respStores.json();

	return { itemsNew, itemsOld, stores };
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
