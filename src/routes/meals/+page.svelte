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

	// Whether the viewed week is the real current week (hides the jump button when true)
	const isCurrentWeek = $derived(
		formatDateKey(currentMonday) === formatDateKey(getMonday(new Date()))
	);

	function goToCurrentWeek() {
		currentMonday = getMonday(new Date());
	}

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
	let selectionType = $state('note'); // 'recipe' or 'note'
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
		selectionType = 'note';
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
			<p class="font-semibold">
				Organisiere deine Mahlzeiten für die Woche
			</p>
		</div>

		<!-- Week Selector bar -->
		<div
			class="flex items-center justify-between bg-surface-200-800 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-2xl"
		>
			<button
				type="button"
				onclick={() => navigateWeek(-1)}
				class="btn-icon preset-filled-primary-500 rounded-xl transition-all active:scale-95 cursor-pointer"
				title="Vorherige Woche"
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

			<div class="flex flex-col items-center gap-1">
				<span class="font-bold text-slate-700 dark:text-slate-300">
					{formatDayMonth(daysOfWeek[0])} — {formatDayMonth(daysOfWeek[6])}
					{daysOfWeek[6].getFullYear()}
				</span>
				{#if !isCurrentWeek}
					<button
						type="button"
						onclick={goToCurrentWeek}
						class="btn btn-sm preset-filled-primary-500 rounded-lg cursor-pointer"
					>
						Aktuelle Woche
					</button>
				{/if}
			</div>

			<button
				type="button"
				onclick={() => navigateWeek(1)}
				class="btn-icon preset-filled-primary-500 rounded-xl transition-all active:scale-95 cursor-pointer"
				title="Nächste Woche"
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
					class="btn preset-filled-success-500 w-full rounded-2xl cursor-pointer transition-all active:scale-95"
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
				class="bg-surface-200-800 border {isToday
					? 'border-emerald-500/40 dark:border-emerald-500/35 ring-1 ring-emerald-500/10'
					: 'border-slate-200 dark:border-slate-800/80'} rounded-2xl p-4 space-y-3 transition-all"
			>
				<!-- Day title -->
				<div class="flex items-center justify-between">
					<div class="flex items-baseline gap-2">
						<span class="font-black">{formatWeekday(day)}</span>
						<span class=" dark:text-slate-500 font-semibold"
							>{formatDayMonth(day)}</span
						>
					</div>
					{#if isToday}
						<span
							class="font-black tracking-wider text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full"
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
									class="font-black tracking-wider px-2 py-0.5 rounded-md border {getMealTypeStyle(
										type
									)}"
								>
									{type}
								</span>
							</div>

							{#if planned.length > 0}
								<div class="space-y-1.5">
									{#each planned as plan (plan.id)}
										<div
											class="bg-surface-300-700 rounded-xl p-2.5 flex items-center justify-between gap-3"
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
													{/if}
													<div class="overflow-hidden flex-1">
														<span class="font-bold block truncate">
															{plan.recipe.name}
														</span>
														<span class="list-card-subtitle block">Rezept</span>
													</div>
												{:else}
													<div class="overflow-hidden flex-1">
														<span class="font-bold block truncate">
															{plan.note}
														</span>
														<span class="list-card-subtitle block">Notiz</span>
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
															class="btn-icon preset-filled-success-500 rounded-lg transition-all cursor-pointer"
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
														class="btn-icon preset-filled-error-500 rounded-lg transition-all cursor-pointer"
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

							<button
								type="button"
								onclick={() => openPlanModal(dateKey, type)}
								class="btn btn-sm preset-filled-success-500 w-full {planned.length === 0
									? 'border border-dashed border-slate-200 dark:border-slate-850'
									: ''} rounded-xl text-center transition-colors cursor-pointer"
							>
								+ Mahlzeit {planned.length === 0 ? 'planen' : 'hinzufügen'}
							</button>
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
			class="list-card w-full max-w-sm space-y-4"
			transition:scale={{ start: 0.95, duration: 150 }}
		>
			<div class="flex items-center justify-between">
				<div>
					<h3 class="font-black">Mahlzeit planen</h3>
					<p class="list-card-subtitle">
						{modalMealType} für den {modalDate}
					</p>
				</div>
				<button
					type="button"
					onclick={closeModal}
					class="btn-icon preset-filled-primary-500 rounded-lg transition-colors cursor-pointer"
					title="Schließen"
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
				<div class="grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={() => (selectionType = 'note')}
						class="btn btn-sm rounded-lg transition-all cursor-pointer {selectionType === 'note'
							? 'preset-filled-primary-500'
							: 'preset-filled-surface-500'}"
					>
						Notiz / Freitext
					</button>
					<button
						type="button"
						onclick={() => (selectionType = 'recipe')}
						class="btn btn-sm rounded-lg transition-all cursor-pointer {selectionType === 'recipe'
							? 'preset-filled-primary-500'
							: 'preset-filled-surface-500'}"
					>
						Rezept
					</button>
				</div>

				<!-- Form Options -->
				{#if selectionType === 'recipe'}
					{#if data.recipes.length === 0}
						<div class="bg-surface-300-700 rounded-xl p-3.5 text-center">
							<p class="font-medium">Keine Rezepte vorhanden.</p>
							<a href="/recipes/new" class="font-bold hover:underline">Rezept erstellen</a>
						</div>
					{:else}
						<label class="label">
							<span class="label-text field-label">Rezept auswählen</span>
							<select
								id="recipe_id"
								name="recipe_id"
								bind:value={selectedRecipeId}
								class="select field-input cursor-pointer"
							>
								{#each data.recipes as rec}
									<option value={rec.id}>{rec.name}</option>
								{/each}
							</select>
						</label>
					{/if}
				{:else}
					<label class="label">
						<span class="label-text field-label">Mahlzeit beschreiben</span>
						<input
							id="note"
							name="note"
							type="text"
							placeholder="z.B. Pizza bestellen, Reste essen"
							required
							bind:value={noteValue}
							class="input field-input"
						/>
					</label>
				{/if}

				<!-- Action triggers -->
				<div class="pt-4 flex items-center justify-between gap-3 border-t border-surface-300-700">
					<button
						type="button"
						onclick={closeModal}
						class="btn preset-filled-warning-500 px-5 py-3 rounded-xl font-bold text-center cursor-pointer"
					>
						Abbrechen
					</button>
					<button
						type="submit"
						disabled={selectionType === 'recipe' && data.recipes.length === 0}
						class="btn preset-filled-success-500 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
					>
						Speichern
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
