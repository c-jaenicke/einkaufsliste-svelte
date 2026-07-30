<script lang="ts">
	let { src, onClose }: { src: string | null; onClose: () => void } = $props();
</script>

{#if src}
	<button
		type="button"
		onclick={onClose}
		class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-pointer touch-none"
	>
		<img
			{src}
			alt="Vorschau"
			class="max-w-full max-h-full rounded-xl border border-slate-800 object-contain"
		/>
	</button>
{/if}
