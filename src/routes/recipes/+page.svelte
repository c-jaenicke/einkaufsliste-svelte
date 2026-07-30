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
			<p class="">Verwalte Kochrezepte und Zutatenlisten</p>
		</div>
		<a href="/recipes/new" class="btn preset-filled-success-500 rounded-xl transition-all">
			<span>+</span> Rezept
		</a>
	</div>

	{#if data.recipes.length === 0}
		<!-- Empty State -->
		<div class="list-card text-center">
			<p class="font-medium">Noch keine Rezepte erstellt.</p>
		</div>
	{:else}
		<div class="space-y-2">
			{#each data.recipes as recipe (recipe.id)}
				<div class="list-card !p-0 overflow-hidden flex flex-col">
					<!-- Recipe Image Banner (if exists) -->
					{#if recipe.image_path}
						<div class="relative h-32 w-full overflow-hidden border-b border-surface-300-700">
							<img
								src="{PUBLIC_API_BASE}{recipe.image_path}"
								alt={recipe.name}
								class="w-full h-full object-cover"
							/>
						</div>
					{/if}

					<!-- Main Recipe Details -->
					<div class="p-2.5 space-y-3">
						<div class="flex items-start justify-between gap-3">
							<button
								type="button"
								onclick={() => toggleExpand(recipe.id)}
								class="text-left flex-1 group"
							>
								<h3 class="font-bold group-hover:text-emerald-500 transition-colors">
									{recipe.name}
								</h3>
								<p class="list-card-subtitle mt-1 line-clamp-2">
									{recipe.description || 'Keine Beschreibung vorhanden.'}
								</p>
							</button>

							<span
								class="font-bold text-surface-contrast-300-700 bg-surface-300-700 px-1.5 py-0.5 rounded-md shrink-0"
							>
								{recipe.ingredients.length} Zutaten
							</span>
						</div>

						<!-- Expanded Ingredient Drawer -->
						{#if expandedRecipeId === recipe.id}
							<div class="bg-surface-300-700 rounded-xl p-3.5 space-y-2 mt-2">
								<h4 class="font-bold list-card-subtitle tracking-wider mb-2">Zutatenliste</h4>
								<ul class="space-y-1.5">
									{#each recipe.ingredients as ing (ing.id)}
										<li
											class="flex items-center justify-between gap-2 border-b border-surface-400-600/50 pb-1"
										>
											<span>
												• <span class="font-bold">{ing.amount}x</span>
												{ing.name}
												{#if ing.note}
													<span class="list-card-subtitle italic">("{ing.note}")</span>
												{/if}
											</span>
										</li>
									{/each}
								</ul>
							</div>
						{/if}

						<!-- Card Actions Grid -->
						<div
							class="pt-2 flex items-center gap-2 border-t border-surface-300-700 justify-between"
						>
							<!-- Edit button -->
							<a
								href="/recipes/{recipe.id}"
								class="btn-icon preset-filled-primary-500 rounded-lg transition-colors"
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

							<!-- Add Ingredients to Shopping list button -->
							<form method="POST" action="?/addToList" use:enhance>
								<input type="hidden" name="id" value={recipe.id} />
								<button
									type="submit"
									class="btn btn-sm preset-filled-success-500 rounded-xl transition-all active:scale-95"
								>
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
