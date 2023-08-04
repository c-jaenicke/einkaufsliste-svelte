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
				<a href="/more">Mehr</a>
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
				<div class="flex flex-wrap">
					<a href="https://github.com/c-jaenicke/einkaufsliste-svelte"> GitHub </a>
					<p>©c-jaenicke</p>
					<a href="/">Einkaufsliste</a>
					<a href="/more">Mehr</a>
					<a href="/about">Über</a>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
</AppShell>

<style lang="postcss">
	.page {
		height: 100%;
		padding: 0.1rem;
	}

	a {
		margin-right: 1rem;
	}

	p {
		margin-right: 1rem;
	}
</style>
