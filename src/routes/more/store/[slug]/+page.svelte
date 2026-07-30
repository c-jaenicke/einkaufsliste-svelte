<script lang="ts">
	import FilteredItemListing from '$lib/FilteredItemListing.svelte';

	const { data } = $props();
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center gap-3">
		<a
			href="/more"
			class="btn-icon preset-filled-primary-500 rounded-xl transition-colors"
			title="Zurück"
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
			<p class="">Gefilterte Ansicht nach Einkaufsort</p>
		</div>
	</div>

	<FilteredItemListing items={data.items} stores={data.stores} categories={data.categories} />
</div>
