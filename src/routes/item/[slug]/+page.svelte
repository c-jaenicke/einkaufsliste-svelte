<script>
	export let data;

	/**
	 * @param {number} id
	 * @returns {string}
	 */
	function storeIdToName(id) {
		for (let i = 0; i < data.stores.length; i++) {
			if (data.stores[i].id === id) {
				return data.stores[i].name;
			}
		}
		return 'keiner';
	}
</script>

<h2 class="h2">Eintrag bearbeiten</h2>

<br />

<form method="POST" action="?/new">
	<label class="label">
		<span>Name</span>
		<input class="input" type="text" placeholder="Apfel" name="name" value={data.item.name} />
	</label>

	<label class="label">
		<span>Notiz</span>
		{#if data.item.note === undefined}
			<input class="input" type="text" placeholder="Nur Bio" name="note" value="" />
		{:else}
			<input class="input" type="text" placeholder="Nur Bio" name="note" value={data.item.note} />
		{/if}
	</label>

	<label class="label">
		<span>Menge</span>
		<input class="input" type="number" name="amount" max="100" min="0" value={data.item.amount} />
	</label>

	<label class="label">
		<span>Laden</span>
		<select class="select" name="store">
			{#if data.item.store_id !== undefined}
				<option value={data.item.store_id} selected>{storeIdToName(data.item.store_id)}</option>
			{/if}
			{#each data.stores as store}
				<option value={store.id}>{store.name}</option>
			{/each}
		</select>
	</label>

	<label class="label">
		<span>Kategorie</span>
		<select class="select" name="cat">
			<option value={data.item.category_id} selected
				>{data.cats[data.item.category_id - 1].name}</option
			>
			{#each data.cats as cat}
				<option value={cat.id}>{cat.name}</option>
			{/each}
		</select>
	</label>

	<br />

	<div class="flex justify-between">
		<button class="btn variant-filled-success" value={data.item.id} name="id">Speichern</button>

		<a href="/">
			<button class="btn variant-filled-warning">Abbrechen</button>
		</a>

		<button
			class="btn variant-filled-error"
			formaction="?/delete"
			formmethod="POST"
			name="id"
			value={data.item.id}
			>Löschen
		</button>
	</div>
</form>
