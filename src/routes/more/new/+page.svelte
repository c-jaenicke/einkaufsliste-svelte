<script lang="ts">
	// Reactive states using Svelte 5 runes
	let objType = $state('store');
	let colorValue = $state('#10b981'); // default emerald-500 hex
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-center gap-3">
		<a
			href="/more"
			class="p-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl transition-colors flex items-center justify-center"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
		</a>
		<div>
			<h2 class="text-xl font-black text-slate-100">Neues Objekt</h2>
			<p class="text-xs text-slate-400">Erstelle einen Laden oder eine Einkaufskategorie</p>
		</div>
	</div>

	<!-- Creation Form -->
	<form
		method="POST"
		action="?/new"
		class="space-y-5 bg-slate-950/40 border border-slate-800 p-5 rounded-2xl"
	>
		<!-- Object Type selector -->
		<div class="space-y-1.5">
			<span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Typ</span>
			<div class="grid grid-cols-2 gap-2">
				<button
					type="button"
					onclick={() => (objType = 'store')}
					class="py-2.5 rounded-xl border text-xs font-bold transition-all {objType === 'store'
						? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
						: 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'}"
				>
					Laden
				</button>
				<button
					type="button"
					onclick={() => (objType = 'category')}
					class="py-2.5 rounded-xl border text-xs font-bold transition-all {objType === 'category'
						? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
						: 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-850'}"
				>
					Kategorie
				</button>
			</div>
			<!-- Hidden form field -->
			<input type="hidden" name="type" value={objType} />
		</div>

		<!-- Name input -->
		<div class="space-y-1.5">
			<label for="name" class="text-xs font-semibold text-slate-400 uppercase tracking-wider"
				>Name</label
			>
			<input
				id="name"
				name="name"
				type="text"
				placeholder={objType === 'store'
					? 'z.B. Aldi, Edeka, Rewe'
					: 'z.B. Gemüse, Drogerie, Getränke'}
				required
				class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-200 focus:outline-none transition-colors"
			/>
		</div>

		<!-- Color picker (only for Category) -->
		{#if objType === 'category'}
			<div class="space-y-1.5">
				<label
					for="color"
					class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Farbe</label
				>
				<div class="flex items-center gap-3">
					<input
						id="color-picker"
						type="color"
						bind:value={colorValue}
						class="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer p-1"
					/>
					<input
						id="color"
						name="color"
						type="text"
						readonly
						bind:value={colorValue}
						class="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 h-12 text-slate-400 text-sm focus:outline-none select-all"
					/>
				</div>
			</div>
		{/if}

		<!-- Action buttons -->
		<div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-900/60">
			<a
				href="/more"
				class="px-5 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-400 font-bold text-sm rounded-xl transition-colors text-center"
			>
				Abbrechen
			</a>
			<button
				type="submit"
				class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1"
			>
				Speichern
			</button>
		</div>
	</form>
</div>
