<script lang="ts">
	let {
		value = $bindable(1),
		name = 'amount',
		min = 1,
		max = 100
	}: {
		value?: number;
		name?: string;
		min?: number;
		max?: number;
	} = $props();

	function decrease() {
		if (value > min) value--;
	}

	function increase() {
		value++;
	}
</script>

<div class="flex items-center gap-3 w-full">
	<button
		type="button"
		onclick={decrease}
		class="btn preset-filled-primary-500 w-12 h-12 rounded-xl flex items-center justify-center font-bold active:scale-95 cursor-pointer"
	>
		-
	</button>
	<input
		{name}
		type="number"
		required
		{min}
		{max}
		bind:value
		class="input field-input flex-1 text-center font-bold h-12"
	/>
	<button
		type="button"
		onclick={increase}
		class="btn preset-filled-primary-500 w-12 h-12 rounded-xl flex items-center justify-center font-bold active:scale-95 cursor-pointer"
	>
		+
	</button>
</div>
