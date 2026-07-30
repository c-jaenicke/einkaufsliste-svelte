<script lang="ts">
	import { enhance } from '$app/forms';
	import { getCategoryColor, getStoreName, sortFavoritesFirst } from '$lib/itemHelpers';
	import FavoriteBadge from '$lib/FavoriteBadge.svelte';

	let { items, stores, categories } = $props();

	// Search and filter states
	let searchTerm = $state('');

	const activeItems = $derived(items.filter((i: any) => i.status === 'new'));
	const boughtItems = $derived(items.filter((i: any) => i.status === 'bought'));

	const filteredBoughtItems = $derived(
		sortFavoritesFirst(
			searchTerm.trim() === ''
				? boughtItems
				: boughtItems.filter((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
		)
	);
</script>

<!-- Active Shopping List in filtered view -->
<div class="space-y-3">
	<h3 class="font-semibold list-card-subtitle">
		Zu kaufen ({activeItems.length})
	</h3>

	{#if activeItems.length === 0}
		<div class="list-card text-center">
			<p class="font-medium">Keine ausstehenden Artikel vorhanden.</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each activeItems as item (item.id)}
				<div class="list-card !p-2.5 flex items-center justify-between gap-3 transition-all">
					<div class="flex items-center gap-3 overflow-hidden flex-1">
						<!-- Category Badge indicator -->
						<span
							class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
							style="background-color: {getCategoryColor(categories, item.category_id)}"
						></span>

						<div class="overflow-hidden flex-1">
							<a href="/item/{item.id}" class="block group">
								<p
									class="font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate"
								>
									{item.amount}x {item.name}
								</p>
								<p class="list-card-subtitle truncate mt-0.5">
									{#if item.store_id && item.store_id !== 1}
										<span class="text-emerald-600 dark:text-emerald-400 font-semibold"
											>{getStoreName(stores, item.store_id)}</span
										>
									{/if}
									{#if item.note}
										{#if item.store_id && item.store_id !== 1}
											<span class="mx-1">•</span>
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
							class="btn-icon preset-filled-success-500 rounded-lg transition-all active:scale-95 cursor-pointer"
							title="Als gekauft markieren"
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
			<h3 class="font-semibold list-card-subtitle">
				Gekaufte Artikel ({filteredBoughtItems.length})
			</h3>
		</div>

		<!-- Search input -->
		<div class="relative">
			<input
				type="text"
				placeholder="Suche in vergangenen Einkäufen..."
				bind:value={searchTerm}
				class="input field-input w-full"
			/>
			{#if searchTerm.length > 0}
				<button
					type="button"
					onclick={() => (searchTerm = '')}
					class="btn-icon btn-icon-sm preset-filled-primary-500 absolute right-2 top-1/2 -translate-y-1/2"
					title="Suche zurücksetzen"
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
				<div class="list-card !p-2 flex items-center justify-between gap-3 transition-all">
					<div class="flex items-center gap-3 overflow-hidden flex-1">
						<span
							class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
							style="background-color: {getCategoryColor(categories, item.category_id)}"
						></span>
						<div class="flex items-center gap-1.5 overflow-hidden">
							<p class="font-medium truncate line-through">
								{item.amount}x {item.name}
							</p>
							{#if item.favorite}
								<FavoriteBadge />
							{/if}
						</div>
					</div>

					<!-- Re-add item button -->
					<form method="POST" action="?/switch" use:enhance class="shrink-0">
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							class="btn-icon preset-filled-success-500 rounded-md transition-all cursor-pointer"
							title="Wieder auf Einkaufszettel setzen"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</button>
					</form>
				</div>
			{/each}
		</div>
	</div>
{/if}
