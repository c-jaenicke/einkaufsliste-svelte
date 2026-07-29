<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { env } from '$env/dynamic/public';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data, form } = $props();

	// Weekly date navigation state
	let currentMonday = $state(getMonday(new Date()));

	// Derived array of 7 Date objects for the current week view
	const daysOfWeek = $derived(getDaysOfWeek(currentMonday));

	// Derived array of recipe IDs planned for the currently viewed week
	const currentWeekRecipeIds = $derived(
		daysOfWeek
			.map((day) => formatDateKey(day))
			.flatMap((dateKey) =>
				data.plans
					.filter((p: any) => p.date === dateKey && p.recipe_id)
					.map((p: any) => p.recipe_id)
			)
	);

	function getMealTypeStyle(type: string): string {
		if (type === 'Frühstück') {
			return 'text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-800/35';
		} else if (type === 'Mittagessen') {
			return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-800/35';
		} else if (type === 'Abendessen') {
			return 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-800/35';
		}
		return 'text-slate-500 bg-slate-100 border-slate-200';
	}

	// Modal state for adding a plan
	let showModal = $state(false);
	let modalDate = $state('');
	let modalMealType = $state('Frühstück');
	let selectionType = $state('recipe'); // 'recipe' or 'note'
	let selectedRecipeId = $state<number | null>(null);
	let noteValue = $state('');

	// Load default recipe if available on load
	$effect(() => {
		if (data.recipes.length > 0 && selectedRecipeId === null) {
			selectedRecipeId = data.recipes[0].id;
		}
	});

	// Date calculations
	function getMonday(d: Date): Date {
		const date = new Date(d);
		const day = date.getDay();
		const diff = date.getDate() - day + (day === 0 ? -6 : 1);
		const monday = new Date(date.setDate(diff));
		monday.setHours(0, 0, 0, 0);
		return monday;
	}

	function getDaysOfWeek(monday: Date): Date[] {
		const days = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(monday);
			date.setDate(monday.getDate() + i);
			days.push(date);
		}
		return days;
	}

	function navigateWeek(weeks: number) {
		const newMon = new Date(currentMonday);
		newMon.setDate(currentMonday.getDate() + weeks * 7);
		currentMonday = newMon;
	}

	function formatDateKey(d: Date): string {
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function formatWeekday(d: Date): string {
		return d.toLocaleDateString('de-DE', { weekday: 'long' });
	}

	function formatDayMonth(d: Date): string {
		return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
	}

	// Filter planned meals for a specific day and type
	function getPlannedMeals(dateKey: string, type: string) {
		return data.plans.filter((p: any) => p.date === dateKey && p.meal_type === type);
	}

	// Modal control
	function openPlanModal(dateKey: string, type: string) {
		modalDate = dateKey;
		modalMealType = type;
		selectionType = 'recipe';
		selectedRecipeId = data.recipes[0]?.id || null;
		noteValue = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}
</script>

<div class="space-y-6">
	<!-- Page Header & Week Navigator -->
	<div class="flex flex-col gap-3">
		<div>
			<h2 class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
				Essensplaner
			</h2>
			<p class="text-xs text-slate-500 dark:text-slate-450 font-semibold">
				Organisiere deine Mahlzeiten für die Woche
			</p>
		</div>

		<!-- Week Selector bar -->
		<div
			class="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-2xl shadow-sm"
		>
			<button
				type="button"
				onclick={() => navigateWeek(-1)}
				class="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
			</button>

			<span class="text-xs font-bold text-slate-700 dark:text-slate-300">
				{formatDayMonth(daysOfWeek[0])} — {formatDayMonth(daysOfWeek[6])}
				{daysOfWeek[6].getFullYear()}
			</span>

			<button
				type="button"
				onclick={() => navigateWeek(1)}
				class="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M9 5l7 7-7 7"
					/>
				</svg>
			</button>
		</div>

		<!-- Weekly Batch Shopping List Importer -->
		{#if currentWeekRecipeIds.length > 0}
			<form method="POST" action="?/addWeekIngredients" use:enhance class="w-full">
				<input type="hidden" name="recipe_ids" value={currentWeekRecipeIds.join(',')} />
				<button
					type="submit"
					class="w-full py-3.5 bg-emerald-500 hover:bg-emerald-450 dark:bg-emerald-600 dark:hover:bg-emerald-550 text-white dark:text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 cursor-pointer transition-all active:scale-95"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
					Alle Wochen-Zutaten auf Einkaufszettel ({currentWeekRecipeIds.length} Mahlzeiten)
				</button>
			</form>
		{/if}
	</div>

	<!-- Calendar Days Loop -->
	<div class="space-y-4">
		{#each daysOfWeek as day}
			{@const dateKey = formatDateKey(day)}
			{@const isToday = new Date().toDateString() === day.toDateString()}

			<div
				class="bg-white dark:bg-slate-900 border {isToday
					? 'border-emerald-500/40 dark:border-emerald-500/35 ring-1 ring-emerald-500/10'
					: 'border-slate-200 dark:border-slate-800/80'} rounded-2xl p-4 shadow-sm space-y-3 transition-all"
			>
				<!-- Day title -->
				<div class="flex items-center justify-between">
					<div class="flex items-baseline gap-2">
						<span class="font-black text-sm text-slate-800 dark:text-slate-100"
							>{formatWeekday(day)}</span
						>
						<span class="text-xs text-slate-400 dark:text-slate-500 font-semibold"
							>{formatDayMonth(day)}</span
						>
					</div>
					{#if isToday}
						<span
							class="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full"
						>
							Heute
						</span>
					{/if}
				</div>

				<hr class="border-slate-100 dark:border-slate-900/60" />

				<!-- Meal slots list -->
				<div class="grid grid-cols-1 gap-2.5">
					{#each ['Frühstück', 'Mittagessen', 'Abendessen'] as type}
						{@const planned = getPlannedMeals(dateKey, type)}

						<div class="flex flex-col gap-1.5">
							<div class="flex items-center">
								<span
									class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border {getMealTypeStyle(
										type
									)}"
								>
									{type}
								</span>
							</div>

							{#if planned.length === 0}
								<!-- Empty slot trigger -->
								<button
									type="button"
									onclick={() => openPlanModal(dateKey, type)}
									class="w-full py-2 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100/50 dark:hover:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center transition-colors cursor-pointer"
								>
									+ Mahlzeit planen
								</button>
							{:else}
								<div class="space-y-1.5">
									{#each planned as plan (plan.id)}
										<div
											class="bg-slate-50 dark:bg-slate-950/50 border border-slate-150 dark:border-slate-850 rounded-xl p-2.5 flex items-center justify-between gap-3 shadow-inner"
										>
											<div class="flex items-center gap-2 overflow-hidden flex-1">
												{#if plan.recipe}
													<!-- Recipe slot indicator -->
													{#if plan.recipe.image_path}
														<img
															src="{PUBLIC_API_BASE}{plan.recipe.image_path}"
															alt={plan.recipe.name}
															class="w-8 h-8 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
														/>
													{:else}
														<div
															class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0"
														>
															<svg
																class="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"
																/>
															</svg>
														</div>
													{/if}
													<div class="overflow-hidden flex-1">
														<span
															class="font-bold text-slate-800 dark:text-slate-200 text-xs block truncate"
														>
															{plan.recipe.name}
														</span>
														<span class="text-[9px] text-slate-400 dark:text-slate-550 block"
															>Rezept</span
														>
													</div>
												{:else}
													<!-- Custom text slot indicator -->
													<div
														class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-slate-500 shrink-0"
													>
														<svg
															class="w-4 h-4"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
															/>
														</svg>
													</div>
													<div class="overflow-hidden flex-1">
														<span
															class="font-bold text-slate-800 dark:text-slate-200 text-xs block truncate"
														>
															{plan.note}
														</span>
														<span class="text-[9px] text-slate-400 dark:text-slate-550 block"
															>Notiz</span
														>
													</div>
												{/if}
											</div>

											<!-- Actions -->
											<div class="flex items-center gap-1.5 shrink-0">
												{#if plan.recipe}
													<!-- One-click import ingredients of this recipe to list -->
													<form method="POST" action="?/addRecipeToShoppingList" use:enhance>
														<input type="hidden" name="recipe_id" value={plan.recipe.id} />
														<button
															type="submit"
															class="w-7 h-7 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center transition-all cursor-pointer"
															title="Zutaten auf Einkaufszettel setzen"
														>
															<svg
																class="w-3.5 h-3.5"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2.5"
																	d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
																/>
															</svg>
														</button>
													</form>
												{/if}

												<!-- Delete plan button -->
												<form method="POST" action="?/delete" use:enhance>
													<input type="hidden" name="id" value={plan.id} />
													<button
														type="submit"
														class="w-7 h-7 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center transition-all cursor-pointer"
														title="Aus Essensplaner löschen"
													>
														<svg
															class="w-3.5 h-3.5"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
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
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Modal overlay for adding meal plan entries -->
{#if showModal}
	<div
		class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
		transition:fade={{ duration: 150 }}
	>
		<div
			class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-5"
			transition:scale={{ start: 0.95, duration: 150 }}
		>
			<div class="flex items-center justify-between">
				<div>
					<h3 class="font-black text-slate-850 dark:text-slate-100 text-lg">Mahlzeit planen</h3>
					<p class="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
						{modalMealType} für den {modalDate}
					</p>
				</div>
				<button
					type="button"
					onclick={closeModal}
					class="p-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors cursor-pointer"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<form
				method="POST"
				action="?/add"
				use:enhance={() => {
					closeModal();
					return async ({ update }) => {
						await update();
					};
				}}
				class="space-y-4"
			>
				<!-- Hidden identifiers -->
				<input type="hidden" name="date" value={modalDate} />
				<input type="hidden" name="meal_type" value={modalMealType} />
				<input type="hidden" name="selection_type" value={selectionType} />

				<!-- Selection Type toggler -->
				<div
					class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850"
				>
					<button
						type="button"
						onclick={() => (selectionType = 'recipe')}
						class="py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer {selectionType ===
						'recipe'
							? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
							: 'text-slate-400 dark:text-slate-550 hover:text-slate-655'}"
					>
						Rezept
					</button>
					<button
						type="button"
						onclick={() => (selectionType = 'note')}
						class="py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer {selectionType ===
						'note'
							? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
							: 'text-slate-400 dark:text-slate-550 hover:text-slate-655'}"
					>
						Notiz / Freitext
					</button>
				</div>

				<!-- Form Options -->
				{#if selectionType === 'recipe'}
					<div class="space-y-1.5">
						<label
							for="recipe_id"
							class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
							>Rezept auswählen</label
						>
						{#if data.recipes.length === 0}
							<div
								class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-center text-xs text-slate-400 dark:text-slate-550"
							>
								Keine Rezepte vorhanden. <a
									href="/recipes/new"
									class="text-emerald-600 dark:text-emerald-400 hover:underline">Rezept erstellen</a
								>
							</div>
						{:else}
							<select
								id="recipe_id"
								name="recipe_id"
								bind:value={selectedRecipeId}
								class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
							>
								{#each data.recipes as rec}
									<option value={rec.id}>{rec.name}</option>
								{/each}
							</select>
						{/if}
					</div>
				{:else}
					<div class="space-y-1.5">
						<label
							for="note"
							class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
							>Mahlzeit beschreiben</label
						>
						<input
							id="note"
							name="note"
							type="text"
							placeholder="z.B. Pizza bestellen, Reste essen"
							required
							bind:value={noteValue}
							class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
						/>
					</div>
				{/if}

				<!-- Action triggers -->
				<div
					class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-900"
				>
					<button
						type="button"
						onclick={closeModal}
						class="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 text-xs font-bold rounded-xl transition-colors cursor-pointer"
					>
						Abbrechen
					</button>
					<button
						type="submit"
						disabled={selectionType === 'recipe' && data.recipes.length === 0}
						class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
					>
						Speichern
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
