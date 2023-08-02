<script lang="ts">
	import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
	import '@skeletonlabs/skeleton/styles/skeleton.css';
	import '../app.postcss';
	import { AppBar, AppShell, LightSwitch } from '@skeletonlabs/skeleton';
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/">
					<strong class="text-xl uppercase">Einkaufsliste</strong>
				</a>
				<a href="/more"> Mehr </a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<div class="page">
		<br />
		<slot />
	</div>
	<svelte:fragment slot="pageFooter">
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="https://github.com/c-jaenicke/einkaufsliste-svelte"> GitHub </a>
				<p>©c-jaenicke</p>
				<a href="/"> Einkaufsliste </a>
				<a href="/more"> Mehr </a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
</AppShell>

<style lang="postcss">
	.page {
		margin: 0;
		height: 100%;
		width: 100vw;
		padding: 0.5rem;
	}

	a {
		margin-right: 1.5rem;
	}

	p {
		margin-right: 1.5rem;
	}

	img {
		height: 1.2rem;
		border: white 10px;
	}
</style>
