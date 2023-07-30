<script>
	import { page } from '$app/stores';
</script>

<div class="text-center">
	<h1 class="h1">{$page.status}</h1>
	<h1 class="h1">{$page.error.message}</h1>
</div>

<style lang="postcss">
	h1 {
		@apply bg-clip-text text-transparent box-decoration-clone;
		/* Direction */
		@apply bg-gradient-to-br;
		/* Color Stops */
		@apply from-primary-500 via-tertiary-500 to-secondary-500;
	}
</style>
