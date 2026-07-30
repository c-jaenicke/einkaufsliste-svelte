<script lang="ts">
	import { enhance } from '$app/forms';

	const { data } = $props();

	// Which pets currently have their activity log expanded (collapsed by default)
	let expandedLogIds = $state<Set<number>>(new Set());

	function toggleLog(id: number) {
		const next = new Set(expandedLogIds);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}
		expandedLogIds = next;
	}

	// Time formatters
	function formatTime(val: any) {
		if (!val) return 'nie';
		const d = new Date(val);
		return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
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
			<p class="">Verwalte Fütterung und Standorte deiner Tiere</p>
		</div>
		<a href="/more" class="btn preset-filled-primary-500 rounded-xl transition-all">
			Tiere verwalten
		</a>
	</div>

	{#if data.pets.length === 0}
		<!-- No Pets Found State -->
		<div class="list-card text-center">
			<p class="font-medium">Noch keine Haustiere registriert.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.pets as pet (pet.id)}
				<div class="list-card space-y-3">
					<h3 class="font-black">{pet.name}</h3>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
						<!-- Location Status -->
						<div class="flex flex-col justify-between gap-3">
							<div class="space-y-1">
								<span class="list-card-subtitle block">Standort</span>
								<p class="font-bold">
									{pet.is_inside ? 'Drinnen' : 'Draußen'}
								</p>
								<p class="list-card-subtitle">
									Zuletzt geändert: {formatDateTime(pet.inside_at)}
								</p>
							</div>

							<form method="POST" action="?/toggleLocation" use:enhance class="w-full">
								<input type="hidden" name="pet_id" value={pet.id} />
								<button
									type="submit"
									class="btn preset-filled-primary-500 w-full rounded-xl transition-colors active:scale-98"
								>
									Standort wechseln
								</button>
							</form>
						</div>

						<!-- Feeding Status -->
						<div class="flex flex-col justify-between gap-3">
							<div class="space-y-1">
								<p class="font-bold">
									Zuletzt um {formatTime(pet.fed_at)} gefressen.
								</p>
								<p class="list-card-subtitle">
									Menge: <span class="font-bold">{pet.amount_fed || 'nichts'}</span>
								</p>
							</div>

							<form method="POST" action="?/feed" use:enhance class="space-y-2">
								<input type="hidden" name="pet_id" value={pet.id} />
								<div class="flex gap-2">
									<select name="amount" class="select field-input flex-1 cursor-pointer">
										<option value="nichts">Nichts</option>
										<option value="sehr wenig">Sehr Wenig</option>
										<option value="wenig">Wenig</option>
										<option value="naja">Naja</option>
										<option selected value="viel">Viel</option>
										<option value="sehr viel">Sehr viel</option>
									</select>
									<button
										type="submit"
										class="btn preset-filled-success-500 rounded-xl transition-all active:scale-95"
									>
										Füttern
									</button>
								</div>
							</form>
						</div>
					</div>

					<!-- Interaction Logs Audit Trail (collapsible, collapsed by default) -->
					<div class="pt-2 border-t border-surface-300-700">
						<button
							type="button"
							onclick={() => toggleLog(pet.id)}
							class="w-full flex items-center justify-between gap-2 font-bold text-slate-500 dark: tracking-wider cursor-pointer"
						>
							Aktivitäts-Log
							<svg
								class="w-4 h-4 transition-transform {expandedLogIds.has(pet.id)
									? 'rotate-180'
									: ''}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2.5"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>

						{#if expandedLogIds.has(pet.id)}
							<div class="space-y-2 mt-2">
								{#if pet.logs.length === 0}
									<p class="list-card-subtitle">Noch keine Aktivitäten protokolliert.</p>
								{:else}
									{#each pet.logs as log}
										<div
											class="bg-surface-300-700 rounded-lg p-2.5 flex items-center justify-between gap-2"
										>
											<p class="font-bold">
												{#if log.activity_type === 'fed'}
													🍗 Gefüttert: {log.detail}
												{:else if log.activity_type === 'location_change'}
													📍 Standort gewechselt: {log.detail}
												{:else}
													⚙️ {log.detail}
												{/if}
											</p>
											<span class="list-card-subtitle shrink-0">
												{formatTime(log.created_at)}
											</span>
										</div>
									{/each}
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
