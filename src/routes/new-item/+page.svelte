<script>
	import PageTitle from '$lib/PageTitle.svelte';
	import BackButton from '$lib/BackButton.svelte';

	export let data;

	/** @type {number} */
	let amountItem = 1;

	function incrementAmount() {
		amountItem++;
	}

	function decreaseAmount() {
		if (amountItem > 0) {
			amountItem--;
		}
	}
</script>

<h2 class="h2">Neuen Eintrag anlegen</h2>

<br />

<PageTitle title="Neuen Eintrag anlegen" />

<form method="POST" action="?/new">
	<label class="label">
		<span>Name</span>
		<input class="input" type="text" placeholder="Apfel" name="name" required maxlength="50" />
	</label>

	<label class="label">
		<span>Notiz</span>
		<input class="input" type="text" placeholder="Nur Bio" name="note" maxlength="100" />
	</label>

	<label class="label">
		<span>Menge</span>
		<div class="flex justify-between">
			<button type="button" class="btn variant-filled-error" on:click={decreaseAmount}>-</button>
			<input
				class="input"
				type="number"
				name="amount"
				max="100"
				min="0"
				required
				bind:value={amountItem}
			/>
			<button type="button" class="btn variant-filled-success" on:click={incrementAmount}>+</button>
		</div>
	</label>

	<label class="label">
		<span>Laden</span>
		<select class="select" name="store">
			{#each data.stores as store}
				<option value={store.id}>{store.name}</option>
			{/each}
		</select>
	</label>

	<label class="label">
		<span>Kategorie</span>
		<select class="select" name="cat">
			{#each data.cats as cat}
				<option value={cat.id}>{cat.name}</option>
			{/each}
		</select>
	</label>

	<br />

	<div class="flex justify-between flex-wrap-reverse">
		<div />
		<BackButton />
		<button class="btn variant-filled-success">Speichern</button>
	</div>
</form>

<style lang="postcss">
	.flex {
		gap: 10px;
	}
</style>
