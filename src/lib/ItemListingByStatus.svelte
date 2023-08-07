<script>
	import ItemListing from '$lib/ItemListing.svelte';
	import cross from '$lib/assets/x.svg';

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

	let searchTerm = '';

	$: search(searchTerm);

	/** @param {string} input */
	function search(input) {
		if (input !== '') {
			let itemList = [];
			for (let i = 0; i < itemsOld.length; i++) {
				if (itemsOld[i].status === 'bought') {
					if (itemsOld[i].name.toLowerCase().includes(input)) {
						itemList.push(itemsOld[i]);
					}
				}
			}

			return itemList;
		} else {
			return itemsOld;
		}
	}

	function clearSearchTerm() {
		searchTerm = '';
	}
</script>

<h1 class="h4">Zu kaufen: {itemsNew.length} Artikel</h1>

<ItemListing items={itemsNew} {stores} buttonText="Gekauft" {categories} />

<br />
<hr class="!border-t-4" />
<br />

<h1 class="h4">Vergangene Einkäufe:</h1>

<div class="flex">
	<button class="btn variant-filled-error" on:click={clearSearchTerm}>
		<img src={cross} alt="X" />
	</button>
	<input class="input" type="text" placeholder="Suchen..." bind:value={searchTerm} />
</div>

<ItemListing items={search(searchTerm)} {stores} buttonText="Nochmal" {categories} />

<style lang="postcss">
	img {
		min-width: 1rem;
		max-width: 1.5rem;
		flex-shrink: 0;
	}
</style>
