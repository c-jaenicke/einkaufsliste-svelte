import { API_BASE, color } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	new: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const type = formData.get('type');
		let obj;

		if (type === 'category') {
			const color = formData.get('color');
			obj = {
				name: name,
				color: color
			};
		} else {
			obj = {
				name: name
			};
		}

		await fetch(API_BASE + '/' + type + '/new', {
			method: 'POST',
			body: JSON.stringify(obj)
		});

		throw redirect(303, '/more');
	}
};
