<script lang="ts">
	import { env } from '$env/dynamic/public';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

	let {
		value = $bindable(''),
		label = 'Name',
		placeholder = '',
		id = undefined,
		name = undefined,
		required = false,
		maxlength = undefined
	}: {
		value?: string;
		label?: string;
		placeholder?: string;
		id?: string;
		name?: string;
		required?: boolean;
		maxlength?: number;
	} = $props();

	let suggestions = $state<string[]>([]);
	let debounceTimeout: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		value = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(async () => {
			if (value.trim().length > 1) {
				try {
					const res = await fetch(
						`${PUBLIC_API_BASE}/items/suggest?q=${encodeURIComponent(value)}`
					);
					if (res.ok) {
						suggestions = await res.json();
					}
				} catch (err) {
					console.error('Failed to load name autocomplete', err);
				}
			} else {
				suggestions = [];
			}
		}, 150);
	}

	function selectSuggestion(sug: string) {
		value = sug;
		suggestions = [];
	}
</script>

<label class="label relative">
	<span class="label-text field-label">{label}</span>
	<input
		{id}
		{name}
		type="text"
		{placeholder}
		{value}
		oninput={handleInput}
		{required}
		{maxlength}
		autocomplete="off"
		class="input field-input"
	/>

	{#if suggestions.length > 0}
		<div class="flex flex-wrap gap-1.5 pt-1.5 w-full">
			{#each suggestions as sug}
				<button
					type="button"
					onclick={() => selectSuggestion(sug)}
					class="btn btn-sm preset-filled-success-500 rounded-lg transition-colors cursor-pointer"
				>
					{sug}
				</button>
			{/each}
		</div>
	{/if}
</label>
