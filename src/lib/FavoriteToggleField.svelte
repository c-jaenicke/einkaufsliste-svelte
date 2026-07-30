<script lang="ts">
	let {
		checked = $bindable(false),
		name = 'favorite'
	}: {
		checked?: boolean;
		name?: string;
	} = $props();
</script>

<label
	class="list-card inline-flex items-center cursor-pointer gap-3 w-full justify-between select-none"
>
	<div class="flex items-center gap-2">
		<svg
			class="w-5 h-5"
			fill={checked ? 'currentColor' : 'none'}
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width={checked ? 0 : 2}
				d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.6z"
			/>
		</svg>
		<span class="font-bold">Favorit</span>
	</div>
	<div class="relative">
		<input type="checkbox" {name} bind:checked class="sr-only peer" />
		<div
			class="w-11 h-6 bg-surface-400-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-50 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-500"
		></div>
	</div>
</label>
