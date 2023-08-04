<script>
	import ItemListingByStatus from '$lib/ItemListingByStatus.svelte';
	import PageTitle from '$lib/PageTitle.svelte';
	import { page } from '$app/stores';

	export let data;
</script>

<PageTitle title="Kategorie: {data.name}" />

<div class="flex justify-between">
	<a href="/new-item">
		<button class="btn variant-filled-success">Neuer Eintrag</button>
	</a>
	<a href={$page.url.pathname} data-sveltekit-reload>
		<button class="btn variant-filled-tertiary">Aktualisieren</button>
	</a>
</div>
<br />

<h1 class="h3">Artikel in Laden: {data.name}</h1>
<br />

<ItemListingByStatus items={data.items} stores={data.stores} categories={data.categories} />

<style lang="postcss">
</style>
