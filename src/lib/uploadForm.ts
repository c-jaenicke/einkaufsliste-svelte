import { applyAction, deserialize } from '$app/forms';
import type { ActionResult } from '@sveltejs/kit';

/**
 * POSTs a FormData payload to a SvelteKit form action via XHR instead of
 * fetch, so upload progress (image uploads can take a while) can be reported.
 * Resolves with the deserialized action result — caller decides what to do
 * with it (applyAction for a full form submit, invalidateAll for a
 * fire-and-forget partial upload, etc).
 */
export function postFormDataWithProgress(
	action: string,
	formData: FormData,
	onProgress: (percent: number) => void
): Promise<ActionResult> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		xhr.open('POST', action, true);
		xhr.setRequestHeader('x-sveltekit-action', 'true');
		// Without this, the server can't tell this apart from a native form
		// submission and responds with a raw redirect instead of the JSON
		// action-result envelope that deserialize()/applyAction() expect.
		xhr.setRequestHeader('accept', 'application/json');

		xhr.upload.onprogress = (e) => {
			if (e.lengthComputable) {
				onProgress(Math.round((e.loaded / e.total) * 100));
			}
		};

		xhr.onload = () => {
			try {
				resolve(deserialize(xhr.responseText));
			} catch (err) {
				reject(err);
			}
		};

		xhr.onerror = () => reject(new Error('Upload fehlgeschlagen'));
		xhr.send(formData);
	});
}

/**
 * Submits a form via XHR instead of a plain POST so upload progress (image
 * uploads can take a while) can be reported, then hands the SvelteKit action
 * result to applyAction so redirects/errors behave the same as use:enhance.
 */
export async function submitFormWithProgress(
	form: HTMLFormElement,
	onProgress: (percent: number) => void,
	action: string = form.action
): Promise<void> {
	const result = await postFormDataWithProgress(action, new FormData(form), onProgress);
	await applyAction(result);
}
