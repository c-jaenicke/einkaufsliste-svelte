<script lang="ts">
	import '../app.postcss';
	import { AppBar, AppShell, LightSwitch } from '@skeletonlabs/skeleton';
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar>
			<svelte:fragment slot="lead">
				<div class="flex flex-wrap">
					<a href="/">
						<strong class="text-xl uppercase">Einkaufsliste</strong>
					</a>
					<a href="/more">Mehr</a>
				</div>
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
					<p>©c-jaenicke</p>
					<a href="https://github.com/c-jaenicke/einkaufsliste-svelte"> GitHub </a>
					<a href="/">Einkaufsliste</a>
					<a href="/more">Mehr</a>
					<a href="/about">About</a>
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

	.flex {
		gap: 3px;
	}
</style>
