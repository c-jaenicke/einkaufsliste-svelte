<script lang="ts">
	import FilteredItemListing from '$lib/FilteredItemListing.svelte';

	const { data } = $props();
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center gap-3">
		<a
			href="/more"
			class="p-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 rounded-xl transition-colors flex items-center justify-center"
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
			<h2 class="text-xl font-black text-slate-800 dark:text-slate-100">Kategorie: {data.name}</h2>
			<p class="text-xs text-slate-500 dark:text-slate-400">Gefilterte Ansicht nach Kategorie</p>
		</div>
	</div>

	<FilteredItemListing items={data.items} stores={data.stores} categories={data.categories} />
</div>
