<script lang="ts">
	import { enhance } from '$app/forms';

	const { data } = $props();

	// Svelte 5 reactive toggle state
	let manage = $state(false);
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<p class="">Verwalte deine Einkaufsorte, Kategorien und Haustiere</p>

	<!-- Toggle switch for edit mode -->
	<label
		class="list-card inline-flex items-center cursor-pointer gap-3 w-full justify-between select-none"
	>
		<div>
			<span class="font-bold tracking-wider block">Verwaltungs-Modus</span>
			<span class="list-card-subtitle">Aktiviert Löschen-Schaltflächen</span>
		</div>
		<div class="relative">
			<input type="checkbox" bind:checked={manage} class="sr-only peer" />
			<div
				class="w-11 h-6 bg-surface-400-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-50 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-500"
			></div>
		</div>
	</label>

	<!-- Section 1: Stores -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-semibold tracking-wider list-card-subtitle">Läden</h3>
			<a
				href="/more/new/store"
				class="btn btn-sm preset-filled-success-500 rounded-xl transition-all"
			>
				<span>+</span> Laden
			</a>
		</div>

		<div class="grid grid-cols-1 gap-2">
			{#each data.stores as store (store.id)}
				<div class="list-card flex items-center justify-between gap-3 transition-all">
					<div class="overflow-hidden flex-1">
						<a
							href="/more/store/{encodeURIComponent(store.name)}"
							class="font-bold hover:text-emerald-500 transition-colors truncate block"
						>
							{store.name}
						</a>
						<span class="font-semibold list-card-subtitle">
							{store.item_count || 0} Artikel
						</span>
					</div>

					{#if manage}
						<form method="POST" action="?/deleteStore" use:enhance class="shrink-0">
							<input type="hidden" name="id" value={store.id} />
							<button
								type="submit"
								disabled={store.id === 1}
								class="btn-icon preset-tonal-error rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
								title="Laden löschen"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</form>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Section 2: Categories -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h3 class="text-xs font-semibold tracking-wider list-card-subtitle">Kategorien</h3>
			<a
				href="/more/new/category"
				class="btn btn-sm preset-filled-success-500 rounded-xl transition-all"
			>
				<span>+</span> Kategorie
			</a>
		</div>

		<div class="grid grid-cols-1 gap-2">
			{#each data.cats as cat (cat.id)}
				<div class="list-card flex items-center justify-between gap-3 transition-all">
					<div class="flex items-center gap-3 overflow-hidden flex-1">
						<!-- Category badge -->
						<span
							class="w-5 h-5 rounded-full shrink-0 border border-black/20"
							style="background-color: {cat.color}"
						></span>
						<div class="overflow-hidden flex-1">
							<a
								href="/more/category/{encodeURIComponent(cat.name)}"
								class="font-bold hover:text-emerald-500 transition-colors truncate block"
							>
								{cat.name}
							</a>
							<span class="font-semibold list-card-subtitle">
								{cat.item_count || 0} Artikel
							</span>
						</div>
					</div>

					{#if manage}
						<form method="POST" action="?/deleteCategory" use:enhance class="shrink-0">
							<input type="hidden" name="id" value={cat.id} />
							<button
								type="submit"
								disabled={cat.id === 1}
								class="btn-icon preset-tonal-error rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
								title="Kategorie löschen"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</form>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- Section 3: Pets -->
	<div class="space-y-3">
		<div class="flex items-center justify-between">
			<h3 class="font-semibold list-card-subtitle">Haustiere</h3>
			<a
				href="/more/new/pet"
				class="btn btn-sm preset-filled-success-500 rounded-xl transition-all"
			>
				<span>+</span> Tier
			</a>
		</div>

		<div class="grid grid-cols-1 gap-2">
			{#each data.pets as pet (pet.id)}
				<div class="list-card flex items-center justify-between gap-3 transition-all">
					<div class="flex items-center gap-3 overflow-hidden flex-1">
						<div class="overflow-hidden flex-1">
							<a
								href="/pet"
								class="font-bold hover:text-emerald-500 transition-colors truncate block"
							>
								{pet.name}
							</a>
						</div>
					</div>

					{#if manage}
						<form method="POST" action="?/deletePet" use:enhance class="shrink-0">
							<input type="hidden" name="id" value={pet.id} />
							<button
								type="submit"
								class="btn-icon preset-filled-error-500 rounded-lg transition-colors"
								title="Haustier löschen"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</form>
					{/if}
				</div>
			{:else}
				<div class="list-card text-center">
					<span class="list-card-subtitle">Noch keine Haustiere registriert.</span>
				</div>
			{/each}
		</div>
	</div>
</div>
