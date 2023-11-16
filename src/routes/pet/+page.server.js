import { to_number } from 'svelte/internal';
import { API_BASE } from '$env/static/private';
import { redirect } from '@sveltejs/kit';

export async function load() {
	const respPet = await fetch(API_BASE + '/pet');
	const pet = await respPet.json();

	return { pet };
}

/** @type {import('./$types').Actions} */
export const actions = {
	fed: async ({ request }) => {
		const formData = await request.formData();
		const amount = formData.get('amount');

		await fetch(API_BASE + '/pet/fed/' + amount, {
			method: 'POST'
		});

		// throw redirect(303, '/');
	},

	inside: async ({ request }) => {
		await fetch(API_BASE + '/pet/inside', {
			method: 'POST'
		});
	}
};
