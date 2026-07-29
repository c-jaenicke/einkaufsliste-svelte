<script lang="ts">
	import { enhance } from '$app/forms';

	const { data } = $props();

	// Svelte 5 reactive toggle state
	let manage = $state(false);
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-black text-slate-100">Einstellungen</h2>
			<p class="text-xs text-slate-400">Verwalte deine Einkaufsorte und Kategorien</p>
		</div>
		<a
			href="/more/new"
			class="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1"
		>
			<span>+</span> Objekt
		</a>
	</div>

	<!-- Toggle switch for edit mode -->
	<label
		class="inline-flex items-center cursor-pointer gap-3 bg-slate-950/40 border border-slate-800 px-4 py-3.5 rounded-2xl w-full justify-between select-none"
	>
		<div>
			<span class="text-xs font-bold text-slate-300 uppercase tracking-wider block"
				>Verwaltungs-Modus</span
			>
			<span class="text-[10px] text-slate-500">Aktiviert Löschen-Schaltflächen</span>
		</div>
		<div class="relative">
			<input type="checkbox" bind:checked={manage} class="sr-only peer" />
			<div
				class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-450 peer-checked:after:bg-emerald-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500/20"
			></div>
		</div>
	</label>

	<!-- Section 1: Stores -->
	<div class="space-y-3">
		<h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Läden</h3>

		<div class="grid grid-cols-1 gap-2">
			{#each data.stores as store (store.id)}
				<div
					class="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-800 transition-all"
				>
					<div class="flex items-center gap-3 overflow-hidden flex-1">
						<!-- Store icon -->
						<div
							class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-450 shrink-0"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<div class="overflow-hidden flex-1">
							<a
								href="/more/store/{encodeURIComponent(store.name)}"
								class="font-bold text-slate-200 hover:text-emerald-400 transition-colors text-sm truncate block"
							>
								{store.name}
							</a>
							<span class="text-[10px] text-slate-500 font-semibold uppercase">
								{store.item_count || 0} Artikel
							</span>
						</div>
					</div>

					{#if manage}
						<form method="POST" action="?/deleteStore" use:enhance class="shrink-0">
							<input type="hidden" name="id" value={store.id} />
							<button
								type="submit"
								disabled={store.id === 1}
								class="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg border border-rose-500/15 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
		<h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategorien</h3>

		<div class="grid grid-cols-1 gap-2">
			{#each data.cats as cat (cat.id)}
				<div
					class="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-800 transition-all"
				>
					<div class="flex items-center gap-3 overflow-hidden flex-1">
						<!-- Category badge -->
						<span
							class="w-5 h-5 rounded-full shrink-0 border border-black/20 shadow-inner"
							style="background-color: {cat.color}"
						></span>
						<div class="overflow-hidden flex-1">
							<a
								href="/more/category/{encodeURIComponent(cat.name)}"
								class="font-bold text-slate-200 hover:text-emerald-400 transition-colors text-sm truncate block"
							>
								{cat.name}
							</a>
							<span class="text-[10px] text-slate-500 font-semibold uppercase">
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
								class="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg border border-rose-500/15 disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
</div>
