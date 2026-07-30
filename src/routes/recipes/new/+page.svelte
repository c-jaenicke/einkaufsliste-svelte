<script lang="ts">
	import ImageDropzone from '$lib/ImageDropzone.svelte';
	import IngredientEditor from '$lib/IngredientEditor.svelte';

	const { data } = $props();

	// Reactive states using Svelte 5 runes
	let recipeName = $state('');
	let description = $state('');
	let ingredients = $state<any[]>([]);
</script>

<div class="space-y-4">
	<!-- Page Subtitle -->
	<p class=" px-1">Erstelle ein Kochrezept mit Zuweisungen</p>

	<form method="POST" action="?/create" enctype="multipart/form-data" class="w-full space-y-4">
		<fieldset class="space-y-4">
			<!-- Serialized JSON container -->
			<input type="hidden" name="ingredients_json" value={JSON.stringify(ingredients)} />

			<!-- Recipe Name -->
			<label class="label">
				<span class="label-text field-label">Rezept-Name</span>
				<input
					id="name"
					name="name"
					type="text"
					placeholder="z.B. Spaghetti Carbonara"
					required
					bind:value={recipeName}
					class="input field-input"
				/>
			</label>

			<!-- Description -->
			<label class="label">
				<span class="label-text field-label">Beschreibung</span>
				<textarea
					id="description"
					name="description"
					rows="2"
					placeholder="Zubereitungs-Beschreibung..."
					bind:value={description}
					class="textarea field-input rounded-container resize-none"></textarea>
			</label>

			<!-- Image Upload banner selector -->
			<ImageDropzone label="Bannersymbol / Bild" />
		</fieldset>

		<hr class="border-slate-200 dark:border-slate-900 my-4" />

		<!-- Ingredients builder -->
		<div class="space-y-3">
			<h3 class="font-bold text-slate-500 dark: tracking-wider">Zutaten hinzufügen</h3>

			<IngredientEditor bind:ingredients stores={data.stores} cats={data.cats} />
		</div>

		<!-- Form Actions conforming to design rules -->
		<fieldset
			class="pt-4 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-900"
		>
			<a
				href="/recipes"
				class="btn preset-filled-warning-500 px-5 py-3 rounded-xl font-bold text-center"
			>
				Abbrechen
			</a>
			<button
				type="submit"
				disabled={recipeName.trim() === '' || ingredients.length === 0}
				class="btn preset-filled-success-500 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
			>
				Rezept erstellen
			</button>
		</fieldset>
	</form>
</div>
