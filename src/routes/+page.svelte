<script>
	import ItemListingByStatus from '$lib/ItemListingByStatus.svelte';
	import PageTitle from '$lib/PageTitle.svelte';

	export let data;
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
