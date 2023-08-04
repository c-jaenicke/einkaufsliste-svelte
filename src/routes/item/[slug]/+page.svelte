<script>
	import BackButton from '$lib/BackButton.svelte';

	export let data;

	/**
	 * Convert the id of a store an item has, to the name of the store
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

	/**
	 * Convert the id of a category an item has, to the name of that category
	 * @param {number} id
	 * @returns {string}
	 */
	function categoryIdToName(id) {
		for (let i = 0; i < data.categories.length; i++) {
			if (data.categories[i].id === id) {
				return data.categories[i].name;
			}
		}
		return 'keine';
	}
</script>

<h2 class="h2">Eintrag bearbeiten</h2>

<br />

<form method="POST" action="?/new">
	<label class="label">
		<span>Name</span>
		<input
			class="input"
			type="text"
			placeholder="Apfel"
			name="name"
			value={data.item.name}
			required
			maxlength="50"
		/>
	</label>

	<label class="label">
		<span>Notiz</span>
		{#if data.item.note === undefined}
			<input class="input" type="text" placeholder="Nur Bio" name="note" value="" maxlength="100" />
		{:else}
			<input
				class="input"
				type="text"
				placeholder="Nur Bio"
				name="note"
				value={data.item.note}
				maxlength="100"
			/>
		{/if}
	</label>

	<label class="label">
		<span>Menge</span>
		<input
			class="input"
			type="number"
			name="amount"
			max="100"
			min="0"
			value={data.item.amount}
			required
		/>
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
			{#if data.item.category_id !== undefined}
				<option value={data.item.category_id} selected
					>{categoryIdToName(data.item.category_id)}</option
				>
			{/if}
			{#each data.categories as category}
				<option value={category.id}>{category.name}</option>
			{/each}
		</select>
	</label>

	<br />

	<div class="flex justify-between">
		<button
			class="btn variant-filled-error"
			formaction="?/delete"
			formmethod="POST"
			name="id"
			value={data.item.id}
			>Löschen
		</button>
		<BackButton />
		<button class="btn variant-filled-success" value={data.item.id} name="id">Speichern</button>
	</div>
</form>
