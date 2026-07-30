<script lang="ts">
	import NameAutocompleteInput from '$lib/NameAutocompleteInput.svelte';
	import { getStoreName, getCategoryName } from '$lib/itemHelpers';

	let {
		ingredients = $bindable([]),
		stores,
		cats
	}: {
		ingredients: any[];
		stores: any[];
		cats: any[];
	} = $props();

	let ingName = $state('');
	let ingNote = $state('');
	let ingAmount = $state(1);
	let ingStore = $state<number>(1);
	let ingCat = $state<number>(1);

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
	}

	function removeIngredient(index: number) {
		ingredients.splice(index, 1);
	}
</script>

<div class="space-y-3">
	<!-- Ingredient inputs row -->
	<div
		class="bg-surface-200-800/70 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-3"
	>
		<NameAutocompleteInput bind:value={ingName} label="Zutaten-Name" placeholder="z.B. Parmesan" />

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
					{#each stores as store}
						<option value={store.id}>{store.name}</option>
					{/each}
				</select>
			</label>
			<label class="label">
				<span class="label-text field-label">Kategorie</span>
				<select bind:value={ingCat} class="select field-input cursor-pointer">
					{#each cats as cat}
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
			<span>+</span> Zutat zur Liste hinzufügen
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
							<span class="dark:text-slate-500 italic">("{ing.note}")</span>
						{/if}
					</p>
					<p class="text-slate-500 mt-0.5 truncate">
						Laden: {getStoreName(stores, ing.store_id, 'keiner')} • Kategorie: {getCategoryName(
							cats,
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
