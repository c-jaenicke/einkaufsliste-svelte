<script lang="ts">
	import { submitFormWithProgress } from '$lib/uploadForm';
	import AmountStepper from '$lib/AmountStepper.svelte';
	import ImageDropzone from '$lib/ImageDropzone.svelte';
	import NameAutocompleteInput from '$lib/NameAutocompleteInput.svelte';
	import FavoriteToggleField from '$lib/FavoriteToggleField.svelte';

	const { data } = $props();

	let amountItem = $state(1);
	let isFavorite = $state(false);
	let uploading = $state(false);
	let uploadProgress = $state(0);

	async function handleSubmit(e: SubmitEvent) {
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

<div class="space-y-4">
	<!-- Page Subtitle -->
	<p class=" px-1">Füge der Einkaufsliste einen Artikel hinzu</p>

	<form
		method="POST"
		action="?/new"
		enctype="multipart/form-data"
		onsubmit={handleSubmit}
		class="w-full space-y-4"
	>
		<fieldset class="space-y-4">
			<NameAutocompleteInput
				id="name"
				name="name"
				label="Name"
				placeholder="z.B. Äpfel, Milch, Brot"
				required
				maxlength={50}
			/>

			<!-- Note Field -->
			<label class="label">
				<span class="label-text field-label">Notiz</span>
				<input
					id="note"
					name="note"
					type="text"
					placeholder="z.B. Bio, Fettarm, Packung"
					maxlength="100"
					class="input field-input"
				/>
			</label>

			<!-- Amount Stepper -->
			<label class="label">
				<span class="label-text field-label">Menge</span>
				<AmountStepper bind:value={amountItem} />
			</label>

			<!-- Store Dropdown selector -->
			<label class="label">
				<span class="label-text field-label">Laden</span>
				<select id="store" name="store" class="select field-input">
					{#each data.stores as store}
						<option value={store.id}>{store.name}</option>
					{/each}
				</select>
			</label>

			<!-- Category Dropdown selector -->
			<label class="label">
				<span class="label-text field-label">Kategorie</span>
				<select id="cat" name="cat" class="select field-input">
					{#each data.cats as cat}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
			</label>

			<!-- Image Upload -->
			<ImageDropzone label="Artikelbild" />

			<!-- Favorite toggle -->
			<FavoriteToggleField bind:checked={isFavorite} />
		</fieldset>

		{#if uploading}
			<div class="list-card">
				<p class="font-medium">Wird gespeichert… {uploadProgress}%</p>
				<div class="w-full h-2 rounded-full bg-surface-300-700 overflow-hidden mt-2">
					<div class="h-full bg-success-500 transition-all" style="width: {uploadProgress}%"></div>
				</div>
			</div>
		{/if}

		<!-- Action buttons conforming to design rules -->
		<fieldset class="pt-4 flex items-center justify-between gap-3">
			<a href="/" class="btn preset-filled-warning-500 px-5 py-3 rounded-xl font-bold text-center">
				Abbrechen
			</a>
			<button
				type="submit"
				disabled={uploading}
				class="btn preset-filled-success-500 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
			>
				Eintrag hinzufügen
			</button>
		</fieldset>
	</form>
</div>
