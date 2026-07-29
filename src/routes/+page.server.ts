import { apiJson } from '$lib/server/api';
import type { PageServerLoad } from './$types';

// Note: this page performs all mutations (switch/archive/quickadd) directly
// from the browser against PUBLIC_API_BASE (see +page.svelte / $lib/sync.ts)
// as part of its offline-first design, so there are no form actions here.
export const load: PageServerLoad = async () => {
	const [stores, categories, items, frequent] = await Promise.all([
		apiJson('/stores'),
		apiJson('/categories'),
		apiJson('/items'),
		apiJson('/items/frequent')
	]);

	return { stores, categories, items, frequent };
};
