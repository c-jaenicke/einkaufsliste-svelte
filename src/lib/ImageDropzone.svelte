<script lang="ts">
	let {
		label,
		emptyText = 'Kein Bild ausgewählt',
		existingImageSrc = null,
		existingImageAlt = '',
		deleteFormAction = '?/deleteImage',
		name = 'image',
		onchange = undefined,
		disabled = false,
		uploadProgress = null,
		error = ''
	}: {
		label: string;
		emptyText?: string;
		existingImageSrc?: string | null;
		existingImageAlt?: string;
		deleteFormAction?: string;
		name?: string;
		onchange?: (e: Event) => void;
		disabled?: boolean;
		uploadProgress?: number | null;
		error?: string;
	} = $props();
</script>

<label class="label pt-2">
	<span class="label-text field-label">{label}</span>

	{#if existingImageSrc}
		<div
			class="bg-surface-200/50 dark:bg-surface-950/40 border border-slate-200 dark:border-slate-850 p-3.5 rounded-xl space-y-3 w-full"
		>
			<img
				src={existingImageSrc}
				alt={existingImageAlt}
				class="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
			/>
			<button
				type="submit"
				formaction={deleteFormAction}
				class="btn preset-filled-error-500 w-full py-2 font-bold rounded-lg cursor-pointer"
			>
				Bild entfernen
			</button>
		</div>
	{:else}
		<div
			class="bg-surface-200/50 dark:bg-surface-950/40 border border-slate-200 dark:border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center text-center border-dashed relative w-full"
		>
			<svg
				class="w-8 h-8 dark:text-slate-650 mb-2"
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
			<span class="dark:text-slate-500 font-semibold">{emptyText}</span>
			<input
				type="file"
				{name}
				accept="image/*"
				{onchange}
				{disabled}
				class="mt-3 block w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-slate-100 dark:file:bg-surface-800 file:text-slate-600 dark:file: hover:file:bg-slate-200 cursor-pointer disabled:opacity-50"
			/>
			{#if uploadProgress !== null}
				<div class="w-full mt-3">
					<p class="font-medium">Bild wird hochgeladen… {uploadProgress}%</p>
					<div class="w-full h-2 rounded-full bg-surface-300-700 overflow-hidden mt-1">
						<div
							class="h-full bg-success-500 transition-all"
							style="width: {uploadProgress}%"
						></div>
					</div>
				</div>
			{/if}
			{#if error}
				<p class="font-medium mt-2 text-error-500">{error}</p>
			{/if}
		</div>
	{/if}
</label>
