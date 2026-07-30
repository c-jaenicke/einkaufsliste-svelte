<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';

	// Swipe right always reveals the amber "Bearbeiten" panel and navigates to
	// the item's edit page; swipe left always reveals a green panel and calls
	// onToggle — only its label/icon differ between the active-item ("Einkauf
	// abhaken") and history-item ("Wieder hinzufügen") usages.
	let {
		item,
		leftLabel,
		leftIconPath,
		onToggle,
		children
	}: {
		item: any;
		leftLabel: string;
		leftIconPath: string;
		onToggle: (id: number) => void;
		children: Snippet;
	} = $props();

	let isSwiping = $state(false);
	let swipeStartX = $state(0);
	let swipeOffset = $state(0);
	let activeSwipeType = $state<'none' | 'left' | 'right'>('none');

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;
		swipeStartX = e.clientX;
		isSwiping = true;
		swipeOffset = 0;
		activeSwipeType = 'none';
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isSwiping) return;
		let offset = e.clientX - swipeStartX;
		// Clamp offset to prevent dragging offscreen entirely
		offset = Math.min(130, Math.max(-130, offset));
		swipeOffset = offset;

		if (offset > 45) {
			activeSwipeType = 'right';
		} else if (offset < -45) {
			activeSwipeType = 'left';
		} else {
			activeSwipeType = 'none';
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isSwiping) return;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch (err) {}

		if (swipeOffset < -80) {
			onToggle(item.id);
		} else if (swipeOffset > 80) {
			goto(`/item/${item.id}`);
		}

		isSwiping = false;
		swipeOffset = 0;
		activeSwipeType = 'none';
	}
</script>

<div
	class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-surface-100-900"
>
	<!-- Yellow edit panel (revealed when swiping right) -->
	<div
		class="absolute inset-0 bg-amber-500 dark:bg-amber-600 flex items-center justify-start pl-6 text-white transition-opacity duration-150 {activeSwipeType ===
		'right'
			? 'opacity-100'
			: 'opacity-0'}"
	>
		<svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2.5"
				d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
			/>
		</svg>
		<span class="font-bold ml-2">Bearbeiten</span>
	</div>

	<!-- Green panel (revealed when swiping left) -->
	<div
		class="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 flex items-center justify-end pr-6 text-white transition-opacity duration-150 {activeSwipeType ===
		'left'
			? 'opacity-100'
			: 'opacity-0'}"
	>
		<span class="font-bold mr-2">{leftLabel}</span>
		<svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d={leftIconPath} />
		</svg>
	</div>

	<!-- Sliding card container -->
	<div
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		class="relative bg-surface-200-800 p-2.5 flex items-center justify-between gap-3 select-none touch-pan-y active:cursor-grabbing cursor-grab"
		style="transform: translateX({swipeOffset}px); transition: {isSwiping
			? 'none'
			: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)'}"
	>
		{@render children()}
	</div>
</div>
