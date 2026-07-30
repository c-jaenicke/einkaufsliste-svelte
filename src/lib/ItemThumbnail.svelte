<script lang="ts">
	let {
		src,
		alt,
		onOpen
	}: {
		src: string;
		alt: string;
		onOpen: (e: MouseEvent) => void;
	} = $props();
</script>

<button
	type="button"
	onclick={onOpen}
	onpointerdown={(e) => e.stopPropagation()}
	class="shrink-0 cursor-pointer"
	title="Bild vergrößern"
>
	<img
		{src}
		{alt}
		class="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-800 pointer-events-none"
	/>
</button>
