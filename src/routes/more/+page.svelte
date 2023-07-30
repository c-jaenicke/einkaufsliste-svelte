<script>
	export let data;

	/**
	 * @param {string} str - string to be shortened
	 * @returns {string} shortened string
	 */
	function shortenString(str) {
		const len = 20;
		if (str.length <= len) {
			return str;
		} else {
			return str.slice(0, len) + '...';
		}
	}
</script>

<div class="flex justify-between">
	<a href="more/new">
		<button class="btn variant-filled-success">Neues Objekt</button>
	</a>

	<a href="/more" data-sveltekit-reload>
		<button class="btn variant-filled-tertiary">Aktualisieren</button>
	</a>
</div>

<h1 class="h3">Läden</h1>

<dl class="list-dl">
	{#each data.stores as item}
		{#if item.id !== 1}
			<div class="list-item">
				<span class="flex-auto">
					<a href="/more/new" {item}>
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
				<span class="flex-auto">
					<a href="/item/{item.id}">
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
		padding-top: 0rem;
		padding-bottom: 0rem;
	}
</style>
