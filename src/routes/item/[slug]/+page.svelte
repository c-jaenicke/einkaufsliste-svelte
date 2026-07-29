<script lang="ts">
	import { env } from '$env/dynamic/public';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data } = $props();

	// Svelte 5 reactive amount state
	let amountItem = $state(data.item.amount);

	function incrementAmount() {
		amountItem++;
	}

	function decreaseAmount() {
		if (amountItem > 1) {
			amountItem--;
		}
	}
</script>

{#key data.item.id}
	<div class="space-y-6">
		<!-- Page Header -->
		<div class="flex items-center gap-3">
			<a
				href="/"
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
				<h2 class="text-xl font-black text-slate-100">Eintrag bearbeiten</h2>
				<p class="text-xs text-slate-400">Passe Details oder das Bild des Artikels an</p>
			</div>
		</div>

		<!-- Edit Form -->
		<form
			method="POST"
			action="?/save"
			enctype="multipart/form-data"
			class="space-y-5 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm"
		>
			<!-- Name Field -->
			<div class="space-y-1.5">
				<label
					for="name"
					class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>Name</label
				>
				<input
					id="name"
					name="name"
					type="text"
					value={data.item.name}
					required
					maxlength="50"
					class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
				/>
			</div>

			<!-- Note Field -->
			<div class="space-y-1.5">
				<label
					for="note"
					class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>Notiz</label
				>
				<input
					id="note"
					name="note"
					type="text"
					value={data.item.note || ''}
					maxlength="100"
					class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none transition-colors"
				/>
			</div>

			<!-- Amount Stepper -->
			<div class="space-y-1.5">
				<label
					for="amount"
					class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
					>Menge</label
				>
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={decreaseAmount}
						class="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xl rounded-xl flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
					>
						-
					</button>
					<input
						id="amount"
						name="amount"
						type="number"
						required
						min="1"
						max="100"
						bind:value={amountItem}
						class="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 text-center text-slate-800 dark:text-slate-100 font-bold text-lg focus:outline-none"
					/>
					<button
						type="button"
						onclick={incrementAmount}
						class="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xl rounded-xl flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
					>
						+
					</button>
				</div>
			</div>

			<!-- Store Selector -->
			<div class="space-y-1.5">
				<label
					for="store"
					class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>Laden</label
				>
				<select
					id="store"
					name="store"
					class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
				>
					{#each data.stores as store}
						<option value={store.id} selected={store.id === data.item.store_id}>{store.name}</option
						>
					{/each}
				</select>
			</div>

			<!-- Category Selector -->
			<div class="space-y-1.5">
				<label
					for="cat"
					class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
					>Kategorie</label
				>
				<select
					id="cat"
					name="cat"
					class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
				>
					{#each data.categories as cat}
						<option value={cat.id} selected={cat.id === data.item.category_id}>{cat.name}</option>
					{/each}
				</select>
			</div>

			<!-- Image Upload / Display Section -->
			<div class="space-y-2 pt-2">
				<span
					class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
					>Artikelbild</span
				>

				{#if data.item.image_path}
					<div
						class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-3.5 rounded-xl space-y-3"
					>
						<img
							src="{PUBLIC_API_BASE}{data.item.image_path}"
							alt={data.item.name}
							class="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shadow-md"
						/>
						<button
							type="submit"
							formaction="?/deleteImage"
							class="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
						>
							Bild entfernen
						</button>
					</div>
				{:else}
					<div
						class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center text-center border-dashed border-slate-300 dark:border-slate-800 relative"
					>
						<svg
							class="w-8 h-8 text-slate-400 dark:text-slate-650 mb-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						<span class="text-xs text-slate-400 dark:text-slate-500 font-semibold"
							>Kein Bild hochgeladen</span
						>
						<input
							type="file"
							name="image"
							accept="image/*"
							class="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-900 file:text-slate-600 dark:file:text-slate-400 hover:file:bg-slate-200 cursor-pointer"
						/>
					</div>
				{/if}
			</div>

			<!-- Footer actions -->
			<div class="pt-4 flex items-center justify-between gap-3">
				<!-- Delete trigger -->
				<button
					type="submit"
					formaction="?/delete"
					class="px-4 py-3 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					Löschen
				</button>

				<div class="flex items-center gap-3">
					<a
						href="/"
						class="px-5 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold text-sm rounded-xl transition-colors"
					>
						Abbrechen
					</a>
					<button
						type="submit"
						class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
					>
						Speichern
					</button>
				</div>
			</div>
		</form>
	</div>
{/key}
