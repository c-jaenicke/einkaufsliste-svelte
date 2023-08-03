<script>
	/** @type {{id: number, name: string, note: string, amount: number, status: string, store_id: number, category_id: number, edges: Object}[]}*/
	export let items;

	/** @type {{id:number , name: string, edges: Object}[]}*/
	export let stores;

	/** @type {{id:number , name: string, color: string, edges: Object}[]}*/
	export let categories;

	/** @type {string} */
	export let buttonText;

	/**
	 * Shorten a string to length of 20 characters and append '...'
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

	/**
	 * Convert the id of a store an item has, to the name of the store
	 * @param {number} id
	 * @returns {string}
	 */
	function storeIdToName(id) {
		for (let i = 0; i < stores.length; i++) {
			if (stores[i].id === id) {
				return stores[i].name;
			}
		}
		return 'keiner';
	}

	/**
	 * Convert the id of a category an item has, to the color of that category
	 * @param {number} id
	 * @returns {string}
	 */
	function categoryIdToColor(id) {
		for (let i = 0; i < categories.length; i++) {
			if (categories[i].id === id) {
				return categories[i].color;
			}
		}
		return '#ffffff';
	}
</script>

<dl class="list-dl">
	{#each items as item}
		<div class="list-item">
			<span
				class="badge-icon variant-filled border-2 border-black"
				style="background-color: {categoryIdToColor(item.category_id)}"
			/>
			<span class="flex-auto" style="margin-left: 8px">
				<a href="/item/{item.id}">
					<dt class="font-bold">{item.amount} x {item.name}</dt>
					{#if item.store_id !== undefined}
						<dd>
							{#if item.store_id !== 1}
								{storeIdToName(item.store_id)}
							{/if}
							{#if item.note !== undefined} - {shortenString(item.note)}{/if}
						</dd>
					{/if}
				</a>
			</span>
			<form method="POST" action="?/switch">
				<button class="btn variant-filled-primary" name="id" value={item.id}>{buttonText}</button>
			</form>
		</div>
	{/each}
</dl>

<style lang="postcss">
	.list-item {
		padding-top: 0;
		padding-bottom: 0;
	}
</style>
