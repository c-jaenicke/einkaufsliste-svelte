<script>
	import ItemListing from '$lib/ItemListing.svelte';

	/** @type {{id: number, name: string, note: string, amount: number, status: string, store_id: number, category_id: number, edges: Object}[]}*/
	export let items;

	/** @type {{id:number , name: string, edges: Object}[]}*/
	export let stores;

	/** @type {{id:number , name: string, color: string, edges: Object}[]}*/
	export let categories;

	/** @type {{id: number, name: string, note: string, amount: number, status: string, store_id: number, category_id: number, edges: Object}[]}*/
	const itemsOld = filterItems()[1];

	/** @type {{id: number, name: string, note: string, amount: number, status: string, store_id: number, category_id: number, edges: Object}[]}*/
	const itemsNew = filterItems()[0];

	function filterItems() {
		let itemsNew = items.filter((item) => item.status === 'new');
		let itemsOld = items.filter((item) => item.status === 'bought');
		return [itemsNew, itemsOld];
	}
</script>

<h1 class="h4">Zu kaufen: {itemsNew.length} Artikel</h1>

<ItemListing items={itemsNew} {stores} buttonText="Gekauft" {categories} />

<br />
<hr class="!border-t-4" />
<br />

<h1 class="h4">Vergangene Einkäufe:</h1>

<ItemListing items={itemsOld} {stores} buttonText="Nochmal" {categories} />

<style lang="postcss">
</style>
