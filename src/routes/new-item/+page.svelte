<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { submitFormWithProgress } from '$lib/uploadForm';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data } = $props();

	// Reactive states
	let amountItem = $state(1);
	let nameValue = $state('');
	let suggestions = $state<string[]>([]);
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

	// Amount adjustment handlers
	function incrementAmount() {
		amountItem++;
	}

	function decreaseAmount() {
		if (amountItem > 1) {
			amountItem--;
		}
	}

	// Autocomplete fetcher with 150ms debounce
	let debounceTimeout: any;
	function handleInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		nameValue = val;
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(async () => {
			if (val.trim().length > 1) {
				try {
					const res = await fetch(`${PUBLIC_API_BASE}/items/suggest?q=${encodeURIComponent(val)}`);
					if (res.ok) {
						suggestions = await res.json();
					}
				} catch (err) {
					console.error('Failed to load name autocomplete', err);
				}
			} else {
				suggestions = [];
			}
		}, 150);
	}

	function selectSuggestion(sug: string) {
		nameValue = sug;
		suggestions = [];
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
			<!-- Name Field with Autocomplete suggestions -->
			<label class="label relative">
				<span class="label-text field-label">Name</span>
				<input
					id="name"
					name="name"
					type="text"
					placeholder="z.B. Äpfel, Milch, Brot"
					value={nameValue}
					oninput={handleInput}
					required
					maxlength="50"
					autocomplete="off"
					class="input field-input"
				/>

				<!-- Autocomplete dropdown badges -->
				{#if suggestions.length > 0}
					<div class="flex flex-wrap gap-1.5 pt-1.5 w-full">
						{#each suggestions as sug}
							<button
								type="button"
								onclick={() => selectSuggestion(sug)}
								class="btn btn-sm preset-filled-success-500 rounded-lg transition-colors cursor-pointer"
							>
								{sug}
							</button>
						{/each}
					</div>
				{/if}
			</label>

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
			<label class="label pt-2">
				<span class="label-text field-label">Artikelbild</span>
				<div
					class="bg-surface-200/50 dark:bg-surface-950/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center text-center border-dashed w-full"
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
					<span class=" dark:text-slate-500 font-semibold">Kein Bild ausgewählt</span>
					<input
						type="file"
						name="image"
						accept="image/*"
						class="mt-3 block w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-slate-100 dark:file:bg-surface-800 file:text-slate-600 dark:file: hover:file:bg-slate-200 cursor-pointer"
					/>
				</div>
			</label>
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
