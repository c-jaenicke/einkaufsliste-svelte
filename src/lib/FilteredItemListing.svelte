<script lang="ts">
	import { enhance } from '$app/forms';

	// Svelte 5 props
	let { items, stores, categories } = $props();

	// Search and filter states
	let searchTerm = $state('');

	const activeItems = $derived(items.filter((i: any) => i.status === 'new'));
	const boughtItems = $derived(items.filter((i: any) => i.status === 'bought'));

	const filteredBoughtItems = $derived(
		searchTerm.trim() === ''
			? boughtItems
			: boughtItems.filter((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	function getStoreName(id: number) {
		const st = stores.find((s: any) => s.id === id);
		return st ? st.name : 'keiner';
	}

	function getCategoryColor(id: number) {
		const cat = categories.find((c: any) => c.id === id);
		return cat ? cat.color : '#64748b';
	}
</script>

<!-- Active Shopping List in filtered view -->
<div class="space-y-3">
	<h3 class="text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
		Zu kaufen ({activeItems.length})
	</h3>

	{#if activeItems.length === 0}
		<div
			class="text-center py-8 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800"
		>
			<p class="text-slate-450 dark:text-slate-500 text-xs font-medium">
				Keine ausstehenden Artikel vorhanden.
			</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each activeItems as item (item.id)}
				<div
					class="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-sm hover:border-slate-350 transition-all"
				>
					<div class="flex items-center gap-3 overflow-hidden flex-1">
						<!-- Category Badge indicator -->
						<span
							class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-inner"
							style="background-color: {getCategoryColor(item.category_id)}"
						></span>

						<div class="overflow-hidden flex-1">
							<a href="/item/{item.id}" class="block group">
								<p
									class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate"
								>
									{item.amount}x {item.name}
								</p>
								<p class="text-xs text-slate-500 dark:text-slate-450 truncate mt-0.5">
									{#if item.store_id && item.store_id !== 1}
										<span class="text-emerald-600 dark:text-emerald-400 font-semibold"
											>{getStoreName(item.store_id)}</span
										>
									{/if}
									{#if item.note}
										{#if item.store_id && item.store_id !== 1}
											<span class="mx-1 text-slate-300 dark:text-slate-700">•</span>
										{/if}
										<span class="italic">"{item.note}"</span>
									{/if}
								</p>
							</a>
						</div>
					</div>

					<!-- Checkmark complete button -->
					<form method="POST" action="?/switch" use:enhance class="shrink-0">
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="w-9 h-9 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/35 text-slate-400 rounded-lg flex items-center justify-center transition-all active:scale-95 cursor-pointer"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2.5"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Search & Past Purchases in filtered view -->
{#if boughtItems.length > 0}
	<hr class="border-slate-200 dark:border-slate-900 my-4" />

	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
				Gekaufte Artikel ({filteredBoughtItems.length})
			</h3>
		</div>

		<!-- Search input -->
		<div class="relative">
			<input
				type="text"
				placeholder="Suche in vergangenen Einkäufen..."
				bind:value={searchTerm}
				class="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-450 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition-colors shadow-inner"
			/>
			{#if searchTerm.length > 0}
				<button
					type="button"
					onclick={() => (searchTerm = '')}
					class="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
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
			{/if}
		</div>

		<!-- Past Items List -->
		<div class="grid grid-cols-1 gap-2">
			{#each filteredBoughtItems as item (item.id)}
				<div
					class="bg-white/40 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/60 rounded-xl p-3 flex items-center justify-between gap-3 opacity-60 hover:opacity-100 transition-opacity shadow-sm"
				>
					<div class="flex items-center gap-3 overflow-hidden flex-1">
						<span
							class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
							style="background-color: {getCategoryColor(item.category_id)}"
						></span>
						<p class="font-medium text-xs text-slate-600 dark:text-slate-350 truncate line-through">
							{item.amount}x {item.name}
						</p>
					</div>

					<!-- Re-add item button -->
					<form method="POST" action="?/switch" use:enhance class="shrink-0">
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="w-8 h-8 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center transition-all cursor-pointer"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18"
								/>
							</svg>
						</button>
					</form>
				</div>
			{/each}
		</div>
	</div>
{/if}
