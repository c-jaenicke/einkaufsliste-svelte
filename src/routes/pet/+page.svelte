<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	const { data } = $props();

	// Reactive UI states
	let showAddPet = $state(false);
	let newPetName = $state('');

	// Client-side pet switching handler
	function handlePetChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		goto(`?id=${target.value}`, { invalidateAll: true });
	}

	// Time formatters
	function formatTime(val: any) {
		if (!val) return 'nie';
		const d = new Date(val);
		return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
	}

	function formatDate(val: any) {
		if (!val) return '';
		const d = new Date(val);
		return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	function formatDateTime(val: any) {
		if (!val) return 'nie';
		const d = new Date(val);
		return (
			d.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) +
			', ' +
			d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) +
			' Uhr'
		);
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-black text-slate-100">Haustier-Companion</h2>
			<p class="text-xs text-slate-400">Verwalte Fütterung und Standorte deiner Tiere</p>
		</div>
		<button
			onclick={() => (showAddPet = !showAddPet)}
			class="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-emerald-400 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
		>
			<span>+</span> Tier hinzufügen
		</button>
	</div>

	<!-- Add Pet Inline Form Drawer -->
	{#if showAddPet}
		<form
			method="POST"
			action="?/addPet"
			use:enhance
			class="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex gap-2"
		>
			<input
				type="text"
				name="name"
				placeholder="Name des Tieres (z.B. Luna, Simba)"
				required
				bind:value={newPetName}
				class="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
			/>
			<button
				type="submit"
				class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
			>
				Speichern
			</button>
		</form>
	{/if}

	{#if data.pets.length === 0}
		<!-- No Pets Found State -->
		<div
			class="text-center py-10 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800"
		>
			<p class="text-slate-500 text-sm font-medium">Noch keine Haustiere registriert.</p>
			<p class="text-slate-600 text-xs mt-1">Erstelle oben ein neues Tier, um zu starten.</p>
		</div>
	{:else}
		<!-- Select active pet drop down -->
		<div class="flex items-center gap-3 bg-slate-950/40 border border-slate-800/80 p-3 rounded-2xl">
			<label for="pet-select" class="text-xs font-bold text-slate-400 uppercase tracking-wider"
				>Aktives Haustier:</label
			>
			<select
				id="pet-select"
				value={data.selectedPet?.id}
				onchange={handlePetChange}
				class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
			>
				{#each data.pets as pet}
					<option value={pet.id}>{pet.name}</option>
				{/each}
			</select>
		</div>

		{#if data.selectedPet}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Card 1: Location Status -->
				<div
					class="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4"
				>
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block"
								>Standort</span
							>
							<h3 class="text-lg font-black text-slate-100">
								{data.selectedPet.name} ist {data.selectedPet.is_inside ? 'drinnen' : 'draußen'}!
							</h3>
							<p class="text-xs text-slate-500">
								Zuletzt geändert: {formatDateTime(data.selectedPet.inside_at)}
							</p>
						</div>

						<!-- Location icon indicator -->
						<div
							class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-emerald-400"
						>
							{#if data.selectedPet.is_inside}
								<!-- House icon -->
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
							{:else}
								<!-- Outdoors/Tree icon -->
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
									/>
								</svg>
							{/if}
						</div>
					</div>

					<form method="POST" action="?/toggleLocation" use:enhance class="w-full">
						<input type="hidden" name="pet_id" value={data.selectedPet.id} />
						<button
							type="submit"
							class="w-full py-2.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-emerald-400 font-bold text-xs rounded-xl transition-colors active:scale-98"
						>
							Standort wechseln
						</button>
					</form>
				</div>

				<!-- Card 2: Feeding Status -->
				<div
					class="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4"
				>
					<div class="flex items-start justify-between">
						<div class="space-y-1">
							<span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block"
								>Letzte Fütterung</span
							>
							<h3 class="text-lg font-black text-slate-100">
								Zuletzt um {formatTime(data.selectedPet.fed_at)} gefressen.
							</h3>
							<p class="text-xs text-slate-500">
								Menge: <span class="text-emerald-400 font-bold capitalize"
									>{data.selectedPet.amount_fed || 'nichts'}</span
								>
							</p>
						</div>

						<!-- Food bowl icon -->
						<div
							class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-emerald-400"
						>
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
					</div>

					<form method="POST" action="?/feed" use:enhance class="space-y-2">
						<input type="hidden" name="pet_id" value={data.selectedPet.id} />
						<div class="flex gap-2">
							<select
								name="amount"
								class="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-2.5 text-xs text-slate-200 focus:outline-none"
							>
								<option value="nichts">Nichts</option>
								<option value="sehr wenig">Sehr Wenig</option>
								<option value="wenig">Wenig</option>
								<option value="naja">Naja</option>
								<option selected value="viel">Viel</option>
								<option value="sehr viel">Sehr viel</option>
							</select>
							<button
								type="submit"
								class="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 active:scale-95"
							>
								Füttern
							</button>
						</div>
					</form>
				</div>
			</div>

			<!-- Interaction Logs Audit Trail -->
			<div class="space-y-3 pt-4">
				<h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
					Aktivitäts-Log ({data.selectedPet.name})
				</h3>

				{#if data.logs.length === 0}
					<div class="text-center py-6 bg-slate-900/10 rounded-xl border border-slate-850">
						<p class="text-slate-600 text-xs font-medium">Noch keine Aktivitäten protokolliert.</p>
					</div>
				{:else}
					<div
						class="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800"
					>
						{#each data.logs as log}
							<div class="relative">
								<!-- Bullet dot inside timeline -->
								<div
									class="absolute -left-[21px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-emerald-500 shadow shadow-emerald-500/30"
								></div>

								<div class="bg-slate-950/20 border border-slate-900/60 rounded-xl p-3.5 space-y-1">
									<div class="flex items-center justify-between gap-2">
										<p class="text-xs font-bold text-slate-300">
											{#if log.activity_type === 'fed'}
												🍗 Gefüttert: <span class="text-emerald-400 capitalize">{log.detail}</span>
											{:else if log.activity_type === 'location_change'}
												📍 Standort gewechselt: <span class="text-emerald-400 capitalize"
													>{log.detail}</span
												>
											{:else}
												⚙️ {log.detail}
											{/if}
										</p>
										<span class="text-[10px] text-slate-500 shrink-0 font-medium">
											{formatTime(log.created_at)}
										</span>
									</div>
									<p class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
										{formatDate(log.created_at)}
									</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>
