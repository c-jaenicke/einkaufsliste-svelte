<script>
	import PageTitle from '$lib/PageTitle.svelte';
	import { page } from '$app/stores';

	export let data;

	function getTime() {
		let date = new Date(data.pet.fed_at * 1000);

		return date.toLocaleTimeString();
	}
</script>

<PageTitle title="Neuen Eintrag anlegen" />

<div class="flex justify-between">
	<a href="/new-item" class="invisible" />

	<a href={$page.url.pathname} data-sveltekit-reload>
		<button class="btn variant-filled-tertiary">Aktualisieren</button>
	</a>
</div>

<h2 class="h3">Zuletzt um {getTime()} <b>{data.pet.amount_fed}</b> gefressen.</h2>

<form method="POST" action="?/fed">
	<label class="label">
		<span>Wie viel gefressen</span>
		<select class="select" name="amount">
			<option value="nichts">Nichts</option>
			<option value="sehr wenig">Sehr Wenig</option>
			<option value="wenig">Wenig</option>
			<option value="naja">Naja</option>
			<option value="viel">Viel</option>
			<option value="sehr viel">Sehr viel</option>
		</select>
	</label>

	<br />

	<button class="btn variant-filled-success" type="submit">Jetzt gefüttert</button>
</form>

<br />

{#if data.pet.is_inside === true}
	<h2 class="h3">Ist <b>drinnen!</b></h2>
{:else}
	<h2 class="h3">Ist <b>draußen!</b></h2>
{/if}

<br />

<form method="POST" action="?/inside">
	<button class="btn variant-filled-success" type="submit">Status wechseln</button>
</form>
