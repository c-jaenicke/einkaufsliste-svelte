<script>
	import PageTitle from '$lib/PageTitle.svelte';

	export let data;
</script>

<PageTitle title="Mehr" />

<div class="flex justify-between">
	<a href="more/new">
		<button class="btn variant-filled-success">Neues Objekt</button>
	</a>
	<a href="/more" data-sveltekit-reload>
		<button class="btn variant-filled-tertiary">Aktualisieren</button>
	</a>
</div>

<br />

<h1 class="h3">Läden</h1>

<dl class="list-dl">
	{#each data.stores as item}
		{#if item.id !== 1}
			<div class="list-item">
				<span class="flex-auto">
					<a href="/more/store/{item.name}">
						<dt class="font-bold">{item.name}</dt>
					</a>
				</span>
				<form method="POST" action="?/deleteStore">
					<button class="btn variant-filled-error" name="id" value={item.id}>Löschen</button>
				</form>
			</div>
		{/if}
	{/each}
</dl>

<br />
<hr class="!border-t-4" />
<br />

<h1 class="h3">Kategorien</h1>

<dl class="list-dl">
	{#each data.cats as item}
		{#if item.id !== 1}
			<div class="list-item">
				<span
					class="badge-icon variant-filled border-2 border-black"
					style="background-color: {item.color}"
				/>
				<span class="flex-auto">
					<a href="/more/category/{item.name}">
						<dt class="font-bold">{item.name}</dt>
					</a>
				</span>
				<form method="POST" action="?/deleteCategory">
					<button class="btn variant-filled-error" name="id" value={item.id}>Löschen</button>
				</form>
			</div>
		{/if}
	{/each}
</dl>

<style lang="postcss">
	.list-item {
		padding-top: 0;
		padding-bottom: 0;
	}
</style>
