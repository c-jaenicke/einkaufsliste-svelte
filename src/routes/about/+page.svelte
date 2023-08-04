<script>
	import PageTitle from '$lib/PageTitle.svelte';
</script>

<PageTitle title="Über" />

<h1 class="h2">About</h1>

This is a simple shopping list project. After the app my family and I have used for years shutdown,
I made this as a replacement. You can save items, assign them to categories and stores, and then
sort by those categories and stores.

<h2 class="h3">Repositorys</h2>

<div class="grid grid-cols-2 gap-4">
	<a href="https://github.com/c-jaenicke/einkaufsliste-go-gin" class="block card card-hover p-4">
		<h3 class="h4">Backend</h3>
		<h4 class="h5">c-jaenicke/einkaufsliste-go-gin</h4>
		<p class="card-text">
			A simple shopping list application written in Go, using a PostgreSQL database to store all
			entries. Serving a REST-API for the frontend.
		</p>
		<span class="badge variant-filled">Go</span>
		<span class="badge variant-filled">gin</span>
		<span class="badge variant-filled">REST API</span>
		<span class="badge variant-filled">ent</span>
		<span class="badge variant-filled">PostgreSQL</span>
	</a>

	<a href="https://github.com/c-jaenicke/einkaufsliste-vue" class="block card card-hover p-4">
		<h3 class="h4">Frontend</h3>
		<h4 class="h5">c-jaenicke/einkaufsliste-vue</h4>
		<p class="card-text">
			A simple frontend using VueJS and Bootstrap elements. Basic functionality has been
			implemented, but its not very good. <strong
				>This has been archived and i wont work on this anymore.</strong
			>
		</p>
		<span class="badge variant-filled">JavaScript</span>
		<span class="badge variant-filled">VueJS</span>
		<span class="badge variant-filled">NGINX</span>
		<span class="badge variant-filled">Bootstrap</span>
	</a>

	<a href="https://github.com/c-jaenicke/einkaufsliste-svelte" class="block card card-hover p-4">
		<h3 class="h4">Frontend</h3>
		<h4 class="h5">c-jaenicke/einkaufsliste-svelte</h4>
		<p class="card-text">
			A way better frontend. Made using Svelte(Kit) and using the Skeleton.dev component library.
			Looks way better and has a lot more functionality. This is the recommended frontend.
		</p>
		<span class="badge variant-filled">JavaScript</span>
		<span class="badge variant-filled">Svelte</span>
		<span class="badge variant-filled">SvelteKit</span>
		<span class="badge variant-filled">Skeleton.dev</span>
	</a>
</div>

<p>All repositories have a Dockerfile and can be hosted using Docker.</p>

<style lang="postcss">
	.card {
		margin-top: 1rem;
	}

	.card-text {
		margin-top: 1rem;
	}

	.badge {
		@apply bg-gradient-to-br;
		@apply from-primary-500 via-tertiary-500 to-success-500;
	}

	h4 {
		word-wrap: break-word;
	}
</style>
