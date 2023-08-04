<script>
	import BackButton from '$lib/BackButton.svelte';

	let objType = '';
	let colorValue = '';
</script>

<h2 class="h2">Neues Objekte anlegen</h2>

<br />

<form method="POST" action="?/new">
	<label class="label">
		<span>Typ</span>
		<select class="select" size="2" name="type" bind:value={objType} required>
			<option value="store">Laden</option>
			<option value="category">Kategorie</option>
		</select>
	</label>

	<label class="label">
		<span>Name</span>
		<input class="input" type="text" placeholder="Name" name="name" required />
	</label>

	{#if objType === 'category'}
		<label>
			<span>Farbe</span>

			<div class="grid grid-cols-[auto_1fr] gap-2">
				<input class="input" type="color" bind:value={colorValue} name="color" required />
				<input class="input" type="text" bind:value={colorValue} readonly tabindex="-1" required />
			</div>
		</label>
	{/if}

	<br />

	<div class="flex justify-between">
		<div />
		<BackButton />
		<button class="btn variant-filled-success">Speichern</button>
	</div>
</form>
