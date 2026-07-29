<script lang="ts">
	import { enhance } from '$app/forms';
	import { env } from '$env/dynamic/public';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data } = $props();

	// Svelte 5 reactive states
	let expandedRecipeId = $state<number | null>(null);

	function toggleExpand(id: number) {
		if (expandedRecipeId === id) {
			expandedRecipeId = null;
		} else {
			expandedRecipeId = id;
		}
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-black text-slate-100">Rezepte</h2>
			<p class="text-xs text-slate-400">Verwalte Kochrezepte und Zutatenlisten</p>
		</div>
		<a
			href="/recipes/new"
			class="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1"
		>
			<span>+</span> Rezept
		</a>
	</div>

	{#if data.recipes.length === 0}
		<!-- Empty State -->
		<div
			class="text-center py-10 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800"
		>
			<p class="text-slate-500 text-sm font-medium">Noch keine Rezepte erstellt.</p>
			<a
				href="/recipes/new"
				class="text-emerald-400 text-xs font-semibold mt-1 inline-block hover:underline"
			>
				Erstelle dein erstes Rezept
			</a>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.recipes as recipe (recipe.id)}
				<div
					class="bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm"
				>
					<!-- Recipe Image Banner (if exists) -->
					{#if recipe.image_path}
						<div class="relative h-32 w-full overflow-hidden border-b border-slate-900">
							<img
								src="{PUBLIC_API_BASE}{recipe.image_path}"
								alt={recipe.name}
								class="w-full h-full object-cover"
							/>
						</div>
					{/if}

					<!-- Main Recipe Details -->
					<div class="p-4 space-y-3">
						<div class="flex items-start justify-between gap-3">
							<button
								type="button"
								onclick={() => toggleExpand(recipe.id)}
								class="text-left flex-1 group"
							>
								<h3
									class="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors"
								>
									{recipe.name}
								</h3>
								<p class="text-xs text-slate-400 mt-1 line-clamp-2">
									{recipe.description || 'Keine Beschreibung vorhanden.'}
								</p>
							</button>

							<span
								class="text-[10px] font-bold bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-full text-slate-400 shrink-0"
							>
								{recipe.ingredients.length} Zutaten
							</span>
						</div>

						<!-- Expanded Ingredient Drawer -->
						{#if expandedRecipeId === recipe.id}
							<div class="bg-slate-950 border border-slate-900 rounded-xl p-3.5 space-y-2 mt-2">
								<h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
									Zutatenliste
								</h4>
								<ul class="space-y-1.5">
									{#each recipe.ingredients as ing (ing.id)}
										<li
											class="text-xs text-slate-300 flex items-center justify-between gap-2 border-b border-slate-900/50 pb-1"
										>
											<span>
												• <span class="font-bold text-slate-200">{ing.amount}x</span>
												{ing.name}
												{#if ing.note}
													<span class="text-slate-500 italic text-[11px]">("{ing.note}")</span>
												{/if}
											</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}

						<!-- Card Actions Grid -->
						<div class="pt-2 flex items-center gap-2 border-t border-slate-900/60 justify-between">
							<div class="flex items-center gap-1">
								<!-- Edit button -->
								<a
									href="/recipes/{recipe.id}"
									class="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
									title="Rezept bearbeiten"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
										/>
									</svg>
								</a>

								<!-- Delete button -->
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={recipe.id} />
									<button
										type="submit"
										class="p-2 text-rose-400 hover:text-rose-300 bg-slate-900 border border-slate-850 hover:bg-rose-500/10 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
										title="Rezept löschen"
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
							</div>

							<!-- Add Ingredients to Shopping list button -->
							<form method="POST" action="?/addToList" use:enhance>
								<input type="hidden" name="id" value={recipe.id} />
								<button
									type="submit"
									class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
								>
									<svg
										class="w-4 h-4 text-slate-950"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
										/>
									</svg>
									+ Einkaufszettel
								</button>
							</form>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
