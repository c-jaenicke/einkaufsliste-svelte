// UPDATED ACCORDING TO v2.0 MIGRATION GUIDE
// https://github.com/skeletonlabs/skeleton/discussions/1947
// @ts-check
import { join } from 'path';

// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	// 2. Opt for dark mode to be handled via the class method
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		// 3. Append the path to the Skeleton package
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	theme: {
		extend: {}
	},
	plugins: [
		// 4. Append the Skeleton plugin (after other plugins)
		forms,
		typography,
		//skeleton
		skeleton({
			themes: {
				// Register each theme within this array:
				preset: ['skeleton', 'modern', 'crimson']
			}
		})
	]
};
