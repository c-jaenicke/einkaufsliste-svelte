<script lang="ts">
	let colorValue = $state('#10b981');
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<p class="">Erstelle eine neue Einkaufskategorie</p>

	<form method="POST" action="?/new" class="w-full space-y-4">
		<fieldset class="space-y-4">
			<label class="label">
				<span class="label-text field-label">Name</span>
				<input
					id="name"
					name="name"
					type="text"
					placeholder="z.B. Gemüse, Drogerie, Getränke"
					required
					class="input field-input"
				/>
			</label>

			<label class="label">
				<span class="label-text field-label">Farbe</span>
				<div class="flex items-center gap-3 w-full">
					<input
						id="color-picker"
						type="color"
						bind:value={colorValue}
						class="w-12 h-12 bg-transparent border-0 rounded-xl cursor-pointer p-1"
					/>
					<input
						id="color"
						name="color"
						type="text"
						readonly
						bind:value={colorValue}
						class="input field-input flex-1 h-12 select-all"
					/>
				</div>
			</label>
		</fieldset>

		<fieldset class="pt-4 flex items-center justify-between gap-3 border-t border-surface-300-700">
			<a
				href="/more"
				class="btn preset-filled-warning-500 px-5 py-3 rounded-xl font-bold text-center"
			>
				Abbrechen
			</a>
			<button
				type="submit"
				class="btn preset-filled-success-500 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-1"
			>
				Speichern
			</button>
		</fieldset>
	</form>
</div>
