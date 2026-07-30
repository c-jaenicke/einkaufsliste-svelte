<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { invalidateAll } from '$app/navigation';
	import { submitFormWithProgress, postFormDataWithProgress } from '$lib/uploadForm';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data } = $props();

	// Svelte 5 reactive amount state
	let amountItem = $state(data.item.amount);
	let uploading = $state(false);
	let uploadProgress = $state(0);
	let imageUploading = $state(false);
	let imageUploadProgress = $state(0);
	let imageError = $state('');

	// Upload the image as soon as it's picked, so the user can see the
	// preview immediately instead of only after saving the whole form.
	async function handleImageChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('image', file);

		imageError = '';
		imageUploading = true;
		imageUploadProgress = 0;
		try {
			const result = await postFormDataWithProgress(
				'?/uploadImage',
				formData,
				(p) => (imageUploadProgress = p)
			);
			if (result.type === 'failure' || result.type === 'error') {
				imageError = 'Bild-Upload fehlgeschlagen';
			} else {
				await invalidateAll();
			}
		} catch {
			imageError = 'Bild-Upload fehlgeschlagen';
		} finally {
			imageUploading = false;
		}
	}

	function incrementAmount() {
		amountItem++;
	}

	function decreaseAmount() {
		if (amountItem > 1) {
			amountItem--;
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		// Delete / Bild entfernen use their own formaction and don't upload a
		// file, so let those submit natively — only intercept the Save submit.
		const submitter = e.submitter as HTMLButtonElement | null;
		if (submitter?.hasAttribute('formaction')) return;

		e.preventDefault();
		uploading = true;
		uploadProgress = 0;
		try {
			await submitFormWithProgress(e.currentTarget as HTMLFormElement, (p) => (uploadProgress = p));
		} finally {
			uploading = false;
		}
	}
</script>

{#key data.item.id}
	<div class="space-y-6">
		<!-- Page Header -->
		<p class="">Passe Details oder das Bild des Artikels an</p>

		<form
			method="POST"
			action="?/save"
			enctype="multipart/form-data"
			onsubmit={handleSubmit}
			class="w-full space-y-4"
		>
			<fieldset class="space-y-4">
				<!-- Name Field -->
				<label class="label">
					<span class="label-text field-label">Name</span>
					<input
						id="name"
						name="name"
						type="text"
						value={data.item.name}
						required
						maxlength="50"
						class="input field-input"
					/>
				</label>

				<!-- Note Field -->
				<label class="label">
					<span class="label-text field-label">Notiz</span>
					<input
						id="note"
						name="note"
						type="text"
						value={data.item.note || ''}
						maxlength="100"
						class="input field-input"
					/>
				</label>

				<!-- Amount Stepper -->
				<label class="label">
					<span class="label-text field-label">Menge</span>
					<div class="flex items-center gap-3 w-full">
						<button
							type="button"
							onclick={decreaseAmount}
							class="btn preset-filled-primary-500 w-12 h-12 rounded-xl flex items-center justify-center font-bold active:scale-95 cursor-pointer"
						>
							-
						</button>
						<input
							id="amount"
							name="amount"
							type="number"
							required
							min="1"
							max="100"
							bind:value={amountItem}
							class="input field-input flex-1 text-center font-bold h-12"
						/>
						<button
							type="button"
							onclick={incrementAmount}
							class="btn preset-filled-primary-500 w-12 h-12 rounded-xl flex items-center justify-center font-bold active:scale-95 cursor-pointer"
						>
							+
						</button>
					</div>
				</label>

				<!-- Store Selector -->
				<label class="label">
					<span class="label-text field-label">Laden</span>
					<select id="store" name="store" class="select field-input">
						{#each data.stores as store}
							<option value={store.id} selected={store.id === data.item.store_id}
								>{store.name}</option
							>
						{/each}
					</select>
				</label>

				<!-- Category Selector -->
				<label class="label">
					<span class="label-text field-label">Kategorie</span>
					<select id="cat" name="cat" class="select field-input">
						{#each data.categories as cat}
							<option value={cat.id} selected={cat.id === data.item.category_id}>{cat.name}</option>
						{/each}
					</select>
				</label>

				<!-- Image Upload / Display Section -->
				<label class="label pt-2">
					<span class="label-text field-label">Artikelbild</span>

					{#if data.item.image_path}
						<div
							class="bg-surface-200/50 dark:bg-surface-950/40 border border-slate-200 dark:border-slate-850 p-3.5 rounded-xl space-y-3 w-full"
						>
							<img
								src="{PUBLIC_API_BASE}{data.item.image_path}"
								alt={data.item.name}
								class="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
							/>
							<button
								type="submit"
								formaction="?/deleteImage"
								class="btn preset-filled-error-500 w-full py-2 font-bold rounded-lg cursor-pointer"
							>
								Bild entfernen
							</button>
						</div>
					{:else}
						<div
							class="bg-surface-200/50 dark:bg-surface-950/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-slate-300 dark:border-slate-800 relative w-full"
						>
							<svg
								class="w-8 h-8  dark:text-slate-650 mb-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<span class=" dark:text-slate-500 font-semibold"
								>Kein Bild hochgeladen</span
							>
							<input
								type="file"
								name="image"
								accept="image/*"
								onchange={handleImageChange}
								disabled={imageUploading}
								class="mt-3 block w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-slate-100 dark:file:bg-surface-800 file:text-slate-600 dark:file: hover:file:bg-slate-200 cursor-pointer disabled:opacity-50"
							/>
							{#if imageUploading}
								<div class="w-full mt-3">
									<p class="font-medium">Bild wird hochgeladen… {imageUploadProgress}%</p>
									<div class="w-full h-2 rounded-full bg-surface-300-700 overflow-hidden mt-1">
										<div
											class="h-full bg-success-500 transition-all"
											style="width: {imageUploadProgress}%"
										></div>
									</div>
								</div>
							{/if}
							{#if imageError}
								<p class="font-medium mt-2 text-error-500">{imageError}</p>
							{/if}
						</div>
					{/if}
				</label>
			</fieldset>

			{#if uploading}
				<div class="list-card">
					<p class="font-medium">Wird gespeichert… {uploadProgress}%</p>
					<div class="w-full h-2 rounded-full bg-surface-300-700 overflow-hidden mt-2">
						<div
							class="h-full bg-success-500 transition-all"
							style="width: {uploadProgress}%"
						></div>
					</div>
				</div>
			{/if}

			<!-- Footer actions conforming to design rules -->
			<fieldset class="pt-4 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-900">
				<div class="flex items-center justify-between gap-3">
					<a
						href="/"
						class="btn preset-filled-warning-500 px-5 py-3 rounded-xl font-bold text-center"
					>
						Abbrechen
					</a>
					<button
						type="submit"
						disabled={uploading}
						class="btn preset-filled-success-500 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
					>
						Speichern
					</button>
				</div>
				<!-- Delete trigger -->
				<button
					type="submit"
					formaction="?/delete"
					class="btn preset-filled-error-500 px-4 py-3 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer self-start"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					Löschen
				</button>
			</fieldset>
		</form>
	</div>
{/key}
