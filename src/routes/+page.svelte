<script>
	import ItemListing from '$lib/ItemListing.svelte';

	export let data;
</script>

<div class="flex justify-between">
	<a href="/new-item">
		<button class="btn variant-filled-success">Neuer Eintrag</button>
	</a>

	<a href="/" data-sveltekit-reload>
		<button class="btn variant-filled-tertiary">Aktualisieren</button>
	</a>
</div>
<br />

<h1 class="h3">Zu kaufen: {data.itemsNew.length} Artikel</h1>

<ItemListing
	items={data.itemsNew}
	stores={data.stores}
	buttonText="Gekauft"
	categories={data.categories}
/>

<br />
<hr class="!border-t-4" />
<br />

<h1 class="h3">Vergangene Einkäufe:</h1>

<ItemListing
	items={data.itemsOld}
	stores={data.stores}
	buttonText="Nochmal"
	categories={data.categories}
/>

<style lang="postcss">
</style>
