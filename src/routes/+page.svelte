<script>
	import ItemListing from '$lib/ItemListing.svelte';
	import ItemListingByStatus from '$lib/ItemListingByStatus.svelte';
	import PageTitle from '$lib/PageTitle.svelte';

	export let data;
	const itemsOld = filterItems()[1];
	const itemsNew = filterItems()[0];

	function filterItems() {
		let itemsNew = data.items.filter((item) => item.status === 'new');
		let itemsOld = data.items.filter((item) => item.status === 'bought');
		return [itemsNew, itemsOld];
	}
</script>

<PageTitle title="Einkaufsliste" />

<div class="flex justify-between">
	<a href="/new-item">
		<button class="btn variant-filled-success">Neuer Eintrag</button>
	</a>

	<a href="/" data-sveltekit-reload>
		<button class="btn variant-filled-tertiary">Aktualisieren</button>
	</a>
</div>
<br />

<ItemListingByStatus items={data.items} stores={data.stores} categories={data.categories} />

<style lang="postcss">
</style>
