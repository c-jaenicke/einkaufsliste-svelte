<script lang="ts">
	import { env } from '$env/dynamic/public';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data } = $props();

	// Reactive states
	let amountItem = $state(1);
	let nameValue = $state('');
	let suggestions = $state<string[]>([]);

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

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center gap-3">
		<a
			href="/"
			class="p-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl transition-colors flex items-center justify-center"
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
			<h2 class="text-xl font-black text-slate-100">Neuer Eintrag</h2>
			<p class="text-xs text-slate-400">Füge der Einkaufsliste einen Artikel hinzu</p>
		</div>
	</div>

	<!-- Add form -->
	<form
		method="POST"
		action="?/new"
		class="space-y-5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm"
	>
		<!-- Name Field with Autocomplete suggestions -->
		<div class="space-y-1.5 relative">
			<label
				for="name"
				class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
				>Name</label
			>
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
				class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors"
			/>

			<!-- Autocomplete dropdown badges -->
			{#if suggestions.length > 0}
				<div class="flex flex-wrap gap-1.5 pt-1.5">
					{#each suggestions as sug}
						<button
							type="button"
							onclick={() => selectSuggestion(sug)}
							class="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/20 transition-colors cursor-pointer"
						>
							{sug}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Note Field -->
		<div class="space-y-1.5">
			<label
				for="note"
				class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
				>Notiz</label
			>
			<input
				id="note"
				name="note"
				type="text"
				placeholder="z.B. Bio, Fettarm, Packung"
				maxlength="100"
				class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-colors"
			/>
		</div>

		<!-- Amount Stepper -->
		<div class="space-y-1.5">
			<label
				for="amount"
				class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
				>Menge</label
			>
			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={decreaseAmount}
					class="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xl rounded-xl flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
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
					class="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 text-center text-slate-800 dark:text-slate-100 font-bold text-lg focus:outline-none"
				/>
				<button
					type="button"
					onclick={incrementAmount}
					class="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xl rounded-xl flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
				>
					+
				</button>
			</div>
		</div>

		<!-- Store Dropdown selector -->
		<div class="space-y-1.5">
			<label
				for="store"
				class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
				>Laden</label
			>
			<select
				id="store"
				name="store"
				class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
			>
				{#each data.stores as store}
					<option value={store.id}>{store.name}</option>
				{/each}
			</select>
		</div>

		<!-- Category Dropdown selector -->
		<div class="space-y-1.5">
			<label
				for="cat"
				class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
				>Kategorie</label
			>
			<select
				id="cat"
				name="cat"
				class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
			>
				{#each data.cats as cat}
					<option value={cat.id}>{cat.name}</option>
				{/each}
			</select>
		</div>

		<!-- Action buttons -->
		<div class="pt-4 flex items-center justify-end gap-3">
			<a
				href="/"
				class="px-5 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold text-sm rounded-xl transition-colors text-center"
			>
				Abbrechen
			</a>
			<button
				type="submit"
				class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
			>
				Eintrag hinzufügen
			</button>
		</div>
	</form>
</div>
