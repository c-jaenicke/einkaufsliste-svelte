import { API_BASE } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').Actions} */
export const actions = {
	new: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name');
		const type = formData.get('type');

		const obj = {
			name: name
		};

		await fetch(API_BASE + '/' + type + '/new', {
			method: 'POST',
			body: JSON.stringify(obj)
		});

		throw redirect(303, '/');
	}
};
