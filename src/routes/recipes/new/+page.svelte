<script lang="ts">
	import { env } from '$env/dynamic/public';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data } = $props();

	// Reactive states using Svelte 5 runes
	let recipeName = $state('');
	let description = $state('');
	let ingredients = $state<any[]>([]);

	// Temp ingredient row states
	let ingName = $state('');
	let ingNote = $state('');
	let ingAmount = $state(1);
	let ingStore = $state<number>(1); // default store ID
	let ingCat = $state<number>(1); // default category ID
	let suggestions = $state<string[]>([]);

	// Autocomplete fetcher for ingredient name
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

	// Suggestion click handler
	function selectSuggestion(sug: string) {
		ingName = sug;
		suggestions = [];
	}

	// Add/Remove handlers for ingredients array
	function addIngredient() {
		if (ingName.trim() === '') return;
		ingredients.push({
			name: ingName.trim(),
			note: ingNote.trim(),
			amount: ingAmount,
			store_id: ingStore,
			category_id: ingCat
		});
		// Reset temporary input values
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

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center gap-3">
		<a
			href="/recipes"
			class="p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-colors flex items-center justify-center"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
		</a>
		<div>
			<h2 class="text-xl font-black text-slate-800 dark:text-slate-100">Neues Rezept</h2>
			<p class="text-xs text-slate-500 dark:text-slate-400">
				Erstelle ein Kochrezept mit Zuweisungen
			</p>
		</div>
	</div>

	<!-- Main Form -->
	<form
		method="POST"
		action="?/create"
		enctype="multipart/form-data"
		class="space-y-5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm"
	>
		<!-- Serialized JSON container -->
		<input type="hidden" name="ingredients_json" value={JSON.stringify(ingredients)} />

		<!-- Recipe Name -->
		<div class="space-y-1.5">
			<label
				for="name"
				class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
				>Rezept-Name</label
			>
			<input
				id="name"
				name="name"
				type="text"
				placeholder="z.B. Spaghetti Carbonara"
				required
				bind:value={recipeName}
				class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
			/>
		</div>

		<!-- Description -->
		<div class="space-y-1.5">
			<label
				for="description"
				class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
				>Beschreibung</label
			>
			<textarea
				id="description"
				name="description"
				rows="2"
				placeholder="Zubereitungs-Beschreibung..."
				bind:value={description}
				class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none transition-colors resize-none"
			></textarea>
		</div>

		<!-- Image Upload banner selector -->
		<div class="space-y-1.5">
			<span
				class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
				>Bannersymbol / Bild</span
			>
			<div
				class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-slate-300 dark:border-slate-800 relative"
			>
				<svg
					class="w-8 h-8 text-slate-400 dark:text-slate-650 mb-2"
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
				<input
					type="file"
					name="image"
					accept="image/*"
					class="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-900 file:text-slate-600 dark:file:text-slate-400 hover:file:bg-slate-200 cursor-pointer"
				/>
			</div>
		</div>

		<hr class="border-slate-200 dark:border-slate-900 my-4" />

		<!-- Ingredients builder -->
		<div class="space-y-3">
			<h3 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
				Zutaten hinzufügen
			</h3>

			<!-- Ingredient inputs row -->
			<div
				class="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-3 shadow-inner"
			>
				<!-- Ing Name & Autocomplete -->
				<div class="space-y-1 relative">
					<input
						type="text"
						placeholder="Zutaten-Name (z.B. Parmesan)"
						value={ingName}
						oninput={handleIngInput}
						class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
					/>

					<!-- Autocomplete suggestion badges -->
					{#if suggestions.length > 0}
						<div class="flex flex-wrap gap-1 pt-1">
							{#each suggestions as sug}
								<button
									type="button"
									onclick={() => selectSuggestion(sug)}
									class="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/15 cursor-pointer"
								>
									{sug}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-2">
					<input
						type="number"
						placeholder="Menge (z.B. 2)"
						min="1"
						bind:value={ingAmount}
						class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
					/>
					<input
						type="text"
						placeholder="Notiz (z.B. gerieben)"
						bind:value={ingNote}
						class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<select
						bind:value={ingStore}
						class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
					>
						{#each data.stores as store}
							<option value={store.id}>{store.name}</option>
						{/each}
					</select>
					<select
						bind:value={ingCat}
						class="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
					>
						{#each data.cats as cat}
							<option value={cat.id}>{cat.name}</option>
						{/each}
					</select>
				</div>

				<button
					type="button"
					onclick={addIngredient}
					class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 font-black text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
				>
					<span>+</span> Zutat zur Liste hinzufügen
				</button>
			</div>

			<!-- List of currently added ingredients -->
			<div class="space-y-1.5">
				{#each ingredients as ing, i}
					<div
						class="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2.5 rounded-lg shadow-sm"
					>
						<div class="text-xs overflow-hidden flex-1">
							<p class="font-bold text-slate-800 dark:text-slate-200">
								{ing.amount}x {ing.name}
								{#if ing.note}
									<span class="text-slate-400 dark:text-slate-500 italic">("{ing.note}")</span>
								{/if}
							</p>
							<p class="text-[10px] text-slate-500 mt-0.5 truncate">
								Laden: {getStoreName(ing.store_id)} • Kategorie: {getCategoryName(ing.category_id)}
							</p>
						</div>

						<button
							type="button"
							onclick={() => removeIngredient(i)}
							class="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-md border border-rose-500/15 cursor-pointer"
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

		<!-- Form Actions -->
		<div
			class="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-900"
		>
			<a
				href="/recipes"
				class="px-5 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-550 dark:text-slate-400 font-bold text-sm rounded-xl transition-colors"
			>
				Abbrechen
			</a>
			<button
				type="submit"
				disabled={recipeName.trim() === '' || ingredients.length === 0}
				class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
			>
				Rezept erstellen
			</button>
		</div>
	</form>
</div>
