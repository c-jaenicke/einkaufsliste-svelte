<script lang="ts">
	import { env } from '$env/dynamic/public';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data } = $props();

	// Reactive states
	let recipeName = $state(data.recipe.name);
	let description = $state(data.recipe.description || '');
	// Map database ingredients back to editable array
	let ingredients = $state<any[]>(
		data.recipe.ingredients.map((ing: any) => ({
			name: ing.name,
			amount: ing.amount,
			note: ing.note || '',
			store_id: ing.store_id || 1,
			category_id: ing.category_id || 1
		}))
	);

	// Temporary ingredient inputs
	let ingName = $state('');
	let ingNote = $state('');
	let ingAmount = $state(1);
	let ingStore = $state<number>(1);
	let ingCat = $state<number>(1);
	let suggestions = $state<string[]>([]);

	// Autocomplete fetcher with 150ms debounce
	let debounceTimeout: any;
	function handleIngInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		ingName = val;
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(async () => {
			if (val.trim().length > 1) {
				try {
					const res = await fetch(`${PUBLIC_API_BASE}/items/suggest?q=${encodeURIComponent(val)}`);
					if (res.ok) {
						suggestions = await res.json();
					}
				} catch (err) {
					console.error('Failed to fetch suggestions', err);
				}
			} else {
				suggestions = [];
			}
		}, 150);
	}

	function selectSuggestion(sug: string) {
		ingName = sug;
		suggestions = [];
	}

	function addIngredient() {
		if (ingName.trim() === '') return;
		ingredients.push({
			name: ingName.trim(),
			note: ingNote.trim(),
			amount: ingAmount,
			store_id: ingStore,
			category_id: ingCat
		});
		ingName = '';
		ingNote = '';
		ingAmount = 1;
		suggestions = [];
	}

	function removeIngredient(index: number) {
		ingredients.splice(index, 1);
	}

	function getStoreName(id: number) {
		const st = data.stores.find((s: any) => s.id === id);
		return st ? st.name : 'keiner';
	}

	function getCategoryName(id: number) {
		const cat = data.cats.find((c: any) => c.id === id);
		return cat ? cat.name : 'keine';
	}
</script>

{#key data.recipe.id}
	<div class="space-y-4">
		<!-- Page Subtitle -->
		<p class=" px-1">Passe Details und Zutaten des Rezepts an</p>

		<form method="POST" action="?/save" enctype="multipart/form-data" class="w-full space-y-4">
			<fieldset class="space-y-4">
				<!-- Serialized JSON container -->
				<input type="hidden" name="ingredients_json" value={JSON.stringify(ingredients)} />

				<!-- Recipe Name -->
				<label class="label">
					<span class="label-text field-label">Rezept-Name</span>
					<input
						id="name"
						name="name"
						type="text"
						required
						bind:value={recipeName}
						class="input field-input"
					/>
				</label>

				<!-- Description -->
				<label class="label">
					<span class="label-text field-label">Beschreibung</span>
					<textarea
						id="description"
						name="description"
						rows="2"
						bind:value={description}
						class="textarea field-input rounded-container resize-none"></textarea>
				</label>

				<!-- Image Upload / Display Section -->
				<label class="label">
					<span class="label-text field-label">Rezeptbild</span>

					{#if data.recipe.image_path}
						<div
							class="bg-surface-200/50 dark:bg-surface-950/40 border border-slate-200 dark:border-slate-850 p-3.5 rounded-xl space-y-3 w-full"
						>
							<img
								src="{PUBLIC_API_BASE}{data.recipe.image_path}"
								alt={data.recipe.name}
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
							class="bg-surface-200/50 dark:bg-surface-950/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center text-center border-dashed relative w-full"
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
								class="mt-3 block w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-slate-100 dark:file:bg-surface-800 file:text-slate-600 dark:file: hover:file:bg-slate-200 cursor-pointer"
							/>
						</div>
					{/if}
				</label>
			</fieldset>

			<hr class="border-slate-200 dark:border-slate-900 my-4" />

			<!-- Ingredients builder -->
			<div class="space-y-3">
				<h3 class="font-bold text-slate-500 dark: tracking-wider">
					Zutaten bearbeiten
				</h3>

				<!-- Ingredient inputs row -->
				<div
					class="bg-surface-200-800/70 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-3"
				>
					<!-- Ing Name & Autocomplete -->
					<div class="space-y-1 relative">
						<label class="label">
							<span class="label-text field-label">Zutaten-Name</span>
							<input
								type="text"
								placeholder="z.B. Parmesan"
								value={ingName}
								oninput={handleIngInput}
								class="input field-input"
							/>
						</label>

						<!-- Autocomplete suggestion badges -->
						{#if suggestions.length > 0}
							<div class="flex flex-wrap gap-1 pt-1 w-full">
								{#each suggestions as sug}
									<button
										type="button"
										onclick={() => selectSuggestion(sug)}
										class="btn btn-sm preset-filled-success-500 rounded cursor-pointer"
									>
										{sug}
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<div class="grid grid-cols-2 gap-2">
						<label class="label">
							<span class="label-text field-label">Menge</span>
							<input
								type="number"
								placeholder="z.B. 2"
								min="1"
								bind:value={ingAmount}
								class="input field-input"
							/>
						</label>
						<label class="label">
							<span class="label-text field-label">Notiz</span>
							<input
								type="text"
								placeholder="z.B. gerieben"
								bind:value={ingNote}
								class="input field-input"
							/>
						</label>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<label class="label">
							<span class="label-text field-label">Laden</span>
							<select bind:value={ingStore} class="select field-input cursor-pointer">
								{#each data.stores as store}
									<option value={store.id}>{store.name}</option>
								{/each}
							</select>
						</label>
						<label class="label">
							<span class="label-text field-label">Kategorie</span>
							<select bind:value={ingCat} class="select field-input cursor-pointer">
								{#each data.cats as cat}
									<option value={cat.id}>{cat.name}</option>
								{/each}
							</select>
						</label>
					</div>

					<button
						type="button"
						onclick={addIngredient}
						class="btn preset-filled-success-500 w-full py-2 font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
					>
						<span>+</span> Zutat hinzufügen
					</button>
				</div>

				<!-- List of currently added ingredients -->
				<div class="space-y-1.5">
					{#each ingredients as ing, i}
						<div
							class="flex items-center justify-between gap-3 bg-surface-200-800/70 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg"
						>
							<div class="overflow-hidden flex-1">
								<p class="font-bold">
									{ing.amount}x {ing.name}
									{#if ing.note}
										<span class=" dark:text-slate-500 italic">("{ing.note}")</span>
									{/if}
								</p>
								<p class="text-slate-550 mt-0.5 truncate">
									Laden: {getStoreName(ing.store_id)} • Kategorie: {getCategoryName(
										ing.category_id
									)}
								</p>
							</div>

							<button
								type="button"
								onclick={() => removeIngredient(i)}
								class="btn-icon preset-filled-error-500 rounded-md cursor-pointer"
								title="Zutat entfernen"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					{/each}
				</div>
			</div>

			<!-- Form Actions conforming to design rules -->
			<fieldset class="pt-4 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-900">
				<div class="flex items-center justify-between gap-3">
					<a
						href="/recipes"
						class="btn preset-filled-warning-500 px-5 py-3 rounded-xl font-bold text-center"
					>
						Abbrechen
					</a>
					<button
						type="submit"
						disabled={recipeName.trim() === '' || ingredients.length === 0}
						class="btn preset-filled-success-500 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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
					Rezept löschen
				</button>
			</fieldset>
		</form>
	</div>
{/key}
