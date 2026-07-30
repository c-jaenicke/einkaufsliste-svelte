<script lang="ts">
	import { env } from '$env/dynamic/public';
	import ImageDropzone from '$lib/ImageDropzone.svelte';
	import IngredientEditor from '$lib/IngredientEditor.svelte';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	const { data } = $props();

	// Reactive states
	let recipeName = $state(data.recipe.name);
	let description = $state(data.recipe.description || '');
	// Map database ingredients back to editable array
	let ingredients = $state<any[]>(
		data.recipe.ingredients.map((ing: any) => ({
			name: ing.name,
			amount: ing.amount,
			note: ing.note || '',
			store_id: ing.store_id || 1,
			category_id: ing.category_id || 1
		}))
	);
</script>

{#key data.recipe.id}
	<div class="space-y-4">
		<!-- Page Subtitle -->
		<p class=" px-1">Passe Details und Zutaten des Rezepts an</p>

		<form method="POST" action="?/save" enctype="multipart/form-data" class="w-full space-y-4">
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
						bind:value={description}
						class="textarea field-input rounded-container resize-none"></textarea>
				</label>

				<!-- Image Upload / Display Section -->
				<ImageDropzone
					label="Rezeptbild"
					emptyText="Kein Bild hochgeladen"
					existingImageSrc={data.recipe.image_path
						? `${PUBLIC_API_BASE}${data.recipe.image_path}`
						: null}
					existingImageAlt={data.recipe.name}
					deleteFormAction="?/deleteImage"
				/>
			</fieldset>

			<hr class="border-slate-200 dark:border-slate-900 my-4" />

			<!-- Ingredients builder -->
			<div class="space-y-3">
				<h3 class="font-bold text-slate-500 dark: tracking-wider">Zutaten bearbeiten</h3>

				<IngredientEditor bind:ingredients stores={data.stores} cats={data.cats} />
			</div>

			<!-- Form Actions conforming to design rules -->
			<fieldset class="pt-4 flex flex-col gap-3 border-t border-slate-200 dark:border-slate-900">
				<div class="flex items-center justify-between gap-3">
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
						Speichern
					</button>
				</div>
				<!-- Delete trigger -->
				<button
					type="submit"
					formaction="?/delete"
					class="btn preset-filled-error-500 px-4 py-3 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer self-start"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					Rezept löschen
				</button>
			</fieldset>
		</form>
	</div>
{/key}
