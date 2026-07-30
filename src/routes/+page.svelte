<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	const PUBLIC_API_BASE = env.PUBLIC_API_BASE;
	import {
		getCachedData,
		setCachedData,
		pushToQueue,
		processOfflineQueue,
		initOfflineSync,
		getOfflineQueue,
		type SyncAction
	} from '$lib/sync';

	const { data } = $props();

	// Svelte 5 states
	let items = $state<any[]>(data.items);
	let stores = $state<any[]>(data.stores);
	let categories = $state<any[]>(data.categories);

	let searchTerm = $state('');
	let isOnline = $state(true);
	let offlineQueue = $state<SyncAction[]>([]);
	let previewImage = $state<string | null>(null);

	// Swipe gestures states
	let swipedItemId = $state<number | null>(null);
	let swipeStartX = $state(0);
	let swipeOffset = $state(0);
	let activeSwipeType = $state<'none' | 'left' | 'right'>('none');

	// Deriving active/bought listings
	const activeItems = $derived(items.filter((i: any) => i.status === 'new'));
	const boughtItems = $derived(items.filter((i: any) => i.status === 'bought'));

	// Grouping active items by store first, then by category within each store,
	// so the list can be worked through store-by-store, department-by-department.
	const activeGroups = $derived(getActiveGroups(items, stores, categories));

	function sortByNameNoneLast(a: { id: number; name: string }, b: { id: number; name: string }) {
		if (a.id === 1) return 1;
		if (b.id === 1) return -1;
		return a.name.localeCompare(b.name);
	}

	function getActiveGroups(itemsList: any[], storesList: any[], catsList: any[]) {
		const active = itemsList.filter((i: any) => i.status === 'new');

		const storeMap: { [key: number]: any[] } = {};
		active.forEach((item) => {
			const sid = item.store_id || 1;
			if (!storeMap[sid]) storeMap[sid] = [];
			storeMap[sid].push(item);
		});

		return Object.keys(storeMap)
			.map((sidStr) => {
				const sid = parseInt(sidStr);
				const store = storesList.find((s) => s.id === sid);
				const storeItems = storeMap[sid];

				const catMap: { [key: number]: any[] } = {};
				storeItems.forEach((item) => {
					const cid = item.category_id || 1;
					if (!catMap[cid]) catMap[cid] = [];
					catMap[cid].push(item);
				});

				const categoryGroups = Object.keys(catMap)
					.map((cidStr) => {
						const cid = parseInt(cidStr);
						const cat = catsList.find((c) => c.id === cid);
						return {
							category: cat || { id: 1, name: 'Keine Kategorie', color: '#64748b' },
							items: catMap[cid]
						};
					})
					.sort((a, b) => sortByNameNoneLast(a.category, b.category));

				return {
					store: store || { id: 1, name: 'Kein Laden' },
					categoryGroups,
					itemCount: storeItems.length
				};
			})
			.sort((a, b) => sortByNameNoneLast(a.store, b.store));
	}

	// Filtering bought items
	const filteredBoughtItems = $derived(
		searchTerm.trim() === ''
			? boughtItems
			: boughtItems.filter((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	// Detect if an item is pending offline synchronization
	function isPendingSync(item: any): boolean {
		return offlineQueue.some((q) => q.type === 'switch' && q.id === item.id);
	}

	// Update offline queue tracking
	function updateQueueTracking() {
		offlineQueue = getOfflineQueue();
	}

	// Client-side revalidation (SWR)
	async function refreshData() {
		if (typeof window === 'undefined') return;
		isOnline = navigator.onLine;
		updateQueueTracking();
		if (!isOnline) return;

		try {
			const [resItems, resStores, resCats] = await Promise.all([
				fetch(`${PUBLIC_API_BASE}/items`),
				fetch(`${PUBLIC_API_BASE}/stores`),
				fetch(`${PUBLIC_API_BASE}/categories`)
			]);

			if (resItems.ok) {
				const freshItems = await resItems.json();
				items = freshItems;
				setCachedData('items', freshItems);
			}
			if (resStores.ok) {
				const freshStores = await resStores.json();
				stores = freshStores;
				setCachedData('stores', freshStores);
			}
			if (resCats.ok) {
				const freshCats = await resCats.json();
				categories = freshCats;
				setCachedData('categories', freshCats);
			}
		} catch (e) {
			console.warn('Revalidation failed (possibly offline). Using cache.', e);
		}
		updateQueueTracking();
	}

	onMount(() => {
		const cachedItems = getCachedData('items');
		const cachedStores = getCachedData('stores');
		const cachedCats = getCachedData('categories');

		if (cachedItems) items = cachedItems;
		if (cachedStores) stores = cachedStores;
		if (cachedCats) categories = cachedCats;

		isOnline = navigator.onLine;
		window.addEventListener('online', () => {
			isOnline = true;
			updateQueueTracking();
		});
		window.addEventListener('offline', () => {
			isOnline = false;
			updateQueueTracking();
		});

		initOfflineSync(() => {
			refreshData();
		});

		refreshData();
	});

	//
	// Offline-First Handlers
	//

	async function handleSwitchStatus(itemId: number) {
		items = items.map((i: any) => {
			if (i.id === itemId) {
				return { ...i, status: i.status === 'new' ? 'bought' : 'new' };
			}
			return i;
		});
		setCachedData('items', items);

		pushToQueue({ type: 'switch', id: itemId });
		updateQueueTracking();
		processOfflineQueue(() => {
			refreshData();
		});
	}

	// Helper getters
	function getCategoryColor(id: number) {
		const cat = categories.find((c: any) => c.id === id);
		return cat ? cat.color : '#64748b';
	}

	function getStoreName(id: number) {
		const store = stores.find((s: any) => s.id === id);
		return store ? store.name : 'Kein Laden';
	}

	function openImagePreview(e: MouseEvent, imagePath: string) {
		e.stopPropagation();
		previewImage = `${PUBLIC_API_BASE}${imagePath}`;
	}

	// Pinch-zooming the preview image leaves mobile browsers zoomed in even
	// after it's closed, so force a reset by briefly capping the viewport scale.
	function closeImagePreview() {
		previewImage = null;
		const viewport = document.querySelector('meta[name="viewport"]');
		if (!viewport) return;
		const original = viewport.getAttribute('content') || '';
		viewport.setAttribute('content', `${original}, maximum-scale=1.0`);
		setTimeout(() => viewport.setAttribute('content', original), 300);
	}

	//
	// Swipe Gestures Core Engine
	//

	function handlePointerDown(e: PointerEvent, item: any) {
		// Only capture left-clicks/taps
		if (e.button !== 0) return;

		swipeStartX = e.clientX;
		swipedItemId = item.id;
		swipeOffset = 0;
		activeSwipeType = 'none';

		const target = e.currentTarget as HTMLElement;
		target.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (swipedItemId === null) return;

		const currentX = e.clientX;
		let offset = currentX - swipeStartX;

		// Clamp offset to prevent dragging offscreen entirely
		offset = Math.min(130, Math.max(-130, offset));
		swipeOffset = offset;

		if (offset > 45) {
			activeSwipeType = 'right'; // Edit action
		} else if (offset < -45) {
			activeSwipeType = 'left'; // Check/toggle action
		} else {
			activeSwipeType = 'none';
		}
	}

	function handlePointerUp(e: PointerEvent, item: any) {
		if (swipedItemId !== item.id) return;

		const target = e.currentTarget as HTMLElement;
		try {
			target.releasePointerCapture(e.pointerId);
		} catch (err) {}

		// Evaluate gesture release actions
		if (swipeOffset < -80) {
			// Swipe Left -> complete action
			handleSwitchStatus(item.id);
		} else if (swipeOffset > 80) {
			// Swipe Right -> edit action
			goto(`/item/${item.id}`);
		}

		swipedItemId = null;
		swipeOffset = 0;
		activeSwipeType = 'none';
	}
</script>

<div class="space-y-6">
	<!-- Connection Offline Alert banner -->
	{#if !isOnline}
		<div
			class="bg-amber-500/10 border border-amber-500/35 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-xl font-semibold flex items-center gap-2 animate-pulse"
		>
			<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
			<span>Offline-Modus. Änderungen werden synchronisiert, wenn die Verbindung steht.</span>
		</div>
	{/if}

	<!-- Top Stats & Actions -->
	<div class="flex items-center justify-between gap-3">
		<div>
			<p class="font-semibold">
				{activeItems.length} Artikel zu besorgen
			</p>
		</div>
		<div class="flex items-center gap-2">
			<!-- New Entry Link -->
			<a href="/new-item" class="btn preset-filled-success-500 rounded-xl transition-all">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Eintrag
			</a>
		</div>
	</div>

	<!-- Active Shopping List -->
	<div class="space-y-4">
		{#if activeGroups.length === 0}
			<div class="list-card text-center">
				<p class="font-medium">Dein Einkaufszettel ist leer.</p>
			</div>
		{:else}
			<div class="space-y-8">
				{#each activeGroups as storeGroup (storeGroup.store.id)}
					<div class="space-y-4">
						<!-- Store grouping header -->
						<div class="flex items-center gap-2 px-1">
							<h3 class="font-black tracking-wide">
								{storeGroup.store.name}
							</h3>
							<span
								class="font-bold   bg-surface-200-800 px-1.5 py-0.5 rounded-md"
							>
								{storeGroup.itemCount}
							</span>
						</div>

						{#each storeGroup.categoryGroups as group (group.category.id)}
							<div class="space-y-2">
								<div class="space-y-2">
									{#each group.items as item (item.id)}
										<!-- Swipe Container wrapper -->
										<div
											class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-surface-100-900"
										>
											<!-- BACKGROUND PANELS (Swipe helpers) -->
											<!-- Yellow edit panel (Revealed when swiping right) -->
											<div
												class="absolute inset-0 bg-amber-500 dark:bg-amber-600 flex items-center justify-start pl-6 text-white transition-opacity duration-150 {activeSwipeType ===
													'right' && swipedItemId === item.id
													? 'opacity-100'
													: 'opacity-0'}"
											>
												<svg
													class="w-5 h-5 animate-pulse"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2.5"
														d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
													/>
												</svg>
												<span class="font-bold ml-2">Bearbeiten</span>
											</div>

											<!-- Green checkmark panel (Revealed when swiping left) -->
											<div
												class="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 flex items-center justify-end pr-6 text-white transition-opacity duration-150 {activeSwipeType ===
													'left' && swipedItemId === item.id
													? 'opacity-100'
													: 'opacity-0'}"
											>
												<span class="font-bold mr-2">Einkauf abhaken</span>
												<svg
													class="w-5 h-5 animate-pulse"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2.5"
														d="M5 13l4 4L19 7"
													/>
												</svg>
											</div>

											<!-- SLIDING CARD CONTAINER -->
											<div
												onpointerdown={(e) => handlePointerDown(e, item)}
												onpointermove={handlePointerMove}
												onpointerup={(e) => handlePointerUp(e, item)}
												class="relative bg-surface-200-800 p-2.5 flex items-center justify-between gap-3 select-none touch-pan-y active:cursor-grabbing cursor-grab"
												style="transform: translateX({swipedItemId === item.id
													? swipeOffset
													: 0}px); transition: {swipedItemId === item.id
													? 'none'
													: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)'}"
											>
												<div class="flex items-center gap-3 overflow-hidden flex-1">
													<!-- Category Badge indicator -->
													<span
														class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
														style="background-color: {getCategoryColor(item.category_id)}"
													></span>

													<!-- Image Thumbnail preview -->
													{#if item.image_path}
														<button
															type="button"
															onclick={(e) => openImagePreview(e, item.image_path)}
															onpointerdown={(e) => e.stopPropagation()}
															class="shrink-0 cursor-pointer"
															title="Bild vergrößern"
														>
															<img
																src="{PUBLIC_API_BASE}{item.image_path}"
																alt={item.name}
																class="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-800 pointer-events-none"
															/>
														</button>
													{/if}

													<div class="overflow-hidden flex-1">
														<div class="flex items-center gap-1.5">
															<p class="font-bold truncate">
																{item.amount}x {item.name}
															</p>

															<!-- Pending Sync Badge indicator -->
															{#if isPendingSync(item)}
																<span
																	class="inline-flex items-center  dark:text-slate-500 font-bold tracking-wider gap-0.5 shrink-0"
																	title="Warte auf Synchronisation"
																>
																	<svg
																		class="w-3 h-3  dark:text-slate-500 animate-spin"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2.5"
																			d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18"
																		/>
																	</svg>
																</span>
															{/if}
														</div>
														{#if item.note}
															<p
																class="truncate mt-0.5 pointer-events-none italic"
															>
																{item.note}
															</p>
														{/if}
													</div>
												</div>

												<!-- Standard Checkmark complete button (backup fallback) -->
												<button
													type="button"
													onclick={() => handleSwitchStatus(item.id)}
													class="btn-icon preset-filled-success-500 rounded-lg transition-all active:scale-90 cursor-pointer shrink-0"
													title="Als gekauft markieren"
												>
													<svg
														class="w-5 h-5"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2.5"
															d="M5 13l4 4L19 7"
														/>
													</svg>
												</button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Divider -->
	{#if boughtItems.length > 0}
		<hr class="border-slate-200 dark:border-slate-900" />
	{/if}

	<!-- Search & Past Purchases -->
	{#if boughtItems.length > 0}
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<h3 class="font-semibold  dark:text-slate-500 tracking-wider">
					Vergangene Einkäufe
				</h3>
				<span
					class="font-bold   bg-surface-200-800 px-1.5 py-0.5 rounded-md"
				>
					{filteredBoughtItems.length}
				</span>
			</div>

			<!-- Search input -->
			<div class="relative">
				<input
					type="text"
					placeholder="Suche in vergangenen Einkäufen..."
					bind:value={searchTerm}
					class="input field-input w-full"
				/>
				{#if searchTerm.length > 0}
					<button
						type="button"
						onclick={() => (searchTerm = '')}
						class="btn-icon btn-icon-sm preset-filled-primary-500 absolute right-2 top-1/2 -translate-y-1/2"
						title="Suche zurücksetzen"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				{/if}
			</div>

			<!-- Past Items List -->
			<div class="grid grid-cols-1 gap-2">
				{#each filteredBoughtItems as item (item.id)}
					<!-- Swipe Container wrapper -->
					<div
						class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-surface-100-900"
					>
						<!-- BACKGROUND PANELS (Swipe helpers) -->
						<!-- Yellow edit panel (Revealed when swiping right) -->
						<div
							class="absolute inset-0 bg-amber-500 dark:bg-amber-600 flex items-center justify-start pl-6 text-white transition-opacity duration-150 {activeSwipeType ===
								'right' && swipedItemId === item.id
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

						<!-- Green re-add panel (Revealed when swiping left) -->
						<div
							class="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 flex items-center justify-end pr-6 text-white transition-opacity duration-150 {activeSwipeType ===
								'left' && swipedItemId === item.id
								? 'opacity-100'
								: 'opacity-0'}"
						>
							<span class="font-bold mr-2">Wieder hinzufügen</span>
							<svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2.5"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</div>

						<!-- SLIDING CARD CONTAINER -->
						<div
							onpointerdown={(e) => handlePointerDown(e, item)}
							onpointermove={handlePointerMove}
							onpointerup={(e) => handlePointerUp(e, item)}
							class="relative bg-surface-200-800 p-2.5 flex items-center justify-between gap-3 select-none touch-pan-y active:cursor-grabbing cursor-grab"
							style="transform: translateX({swipedItemId === item.id
								? swipeOffset
								: 0}px); transition: {swipedItemId === item.id
								? 'none'
								: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)'}"
						>
							<div class="flex items-center gap-3 overflow-hidden flex-1">
								<span
									class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
									style="background-color: {getCategoryColor(item.category_id)}"
								></span>

								<div class="overflow-hidden flex-1">
									<p class="font-bold truncate line-through">
										{getStoreName(item.store_id)}: {item.amount}x {item.name}
									</p>
									<div class="flex items-center gap-2 mt-0.5">
										{#if item.image_path}
											<button
												type="button"
												onclick={(e) => openImagePreview(e, item.image_path)}
												onpointerdown={(e) => e.stopPropagation()}
												class="shrink-0 cursor-pointer"
												title="Bild vergrößern"
											>
												<img
													src="{PUBLIC_API_BASE}{item.image_path}"
													alt={item.name}
													class="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-800 pointer-events-none"
												/>
											</button>
										{/if}
										{#if item.note}
											<p
												class="truncate pointer-events-none italic line-through"
											>
												{item.note}
											</p>
										{/if}
									</div>
								</div>
							</div>

							<!-- Re-add button (backup fallback) -->
							<button
								type="button"
								onclick={() => handleSwitchStatus(item.id)}
								class="btn-icon preset-filled-success-500 rounded-lg transition-all active:scale-90 cursor-pointer shrink-0"
								title="Wieder auf Einkaufszettel setzen"
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Image Preview Lightbox -->
	{#if previewImage}
		<button
			type="button"
			onclick={closeImagePreview}
			class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-pointer touch-none"
		>
			<img
				src={previewImage}
				alt="Vorschau"
				class="max-w-full max-h-full rounded-xl border border-slate-800 object-contain"
			/>
		</button>
	{/if}
</div>
