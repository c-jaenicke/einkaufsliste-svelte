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
	let frequent = $state<any[]>(data.frequent);

	let searchTerm = $state('');
	let isOnline = $state(true);
	let offlineQueue = $state<SyncAction[]>([]);

	// Swipe gestures states
	let swipedItemId = $state<number | null>(null);
	let swipeStartX = $state(0);
	let swipeOffset = $state(0);
	let activeSwipeType = $state<'none' | 'left' | 'right'>('none');

	// Deriving active/bought listings
	const activeItems = $derived(items.filter((i: any) => i.status === 'new'));
	const boughtItems = $derived(items.filter((i: any) => i.status === 'bought'));

	// Grouping active items by category for department-by-department navigation
	const activeGroups = $derived(getActiveGroups(items, categories));

	function getActiveGroups(itemsList: any[], catsList: any[]) {
		const active = itemsList.filter((i: any) => i.status === 'new');
		const groups: { [key: number]: any[] } = {};
		active.forEach((item) => {
			const cid = item.category_id || 1;
			if (!groups[cid]) groups[cid] = [];
			groups[cid].push(item);
		});
		return Object.keys(groups)
			.map((cidStr) => {
				const cid = parseInt(cidStr);
				const cat = catsList.find((c) => c.id === cid);
				return {
					category: cat || { id: 1, name: 'Keine Kategorie', color: '#64748b' },
					items: groups[cid]
				};
			})
			.sort((a, b) => {
				if (a.category.id === 1) return 1;
				if (b.category.id === 1) return -1;
				return a.category.name.localeCompare(b.category.name);
			});
	}

	// Filtering bought items
	const filteredBoughtItems = $derived(
		searchTerm.trim() === ''
			? boughtItems
			: boughtItems.filter((i: any) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	// Detect if an item is pending offline synchronization
	function isPendingSync(item: any): boolean {
		return offlineQueue.some(
			(q) =>
				(q.type === 'switch' && q.id === item.id) ||
				(q.type === 'quickadd' && q.payload && q.payload.name === item.name && item.id < 0)
		);
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
			const [resItems, resStores, resCats, resFreq] = await Promise.all([
				fetch(`${PUBLIC_API_BASE}/items`),
				fetch(`${PUBLIC_API_BASE}/stores`),
				fetch(`${PUBLIC_API_BASE}/categories`),
				fetch(`${PUBLIC_API_BASE}/items/frequent`)
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
			if (resFreq.ok) {
				const freshFreq = await resFreq.json();
				frequent = freshFreq;
				setCachedData('frequent', freshFreq);
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
		const cachedFreq = getCachedData('frequent');

		if (cachedItems) items = cachedItems;
		if (cachedStores) stores = cachedStores;
		if (cachedCats) categories = cachedCats;
		if (cachedFreq) frequent = cachedFreq;

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

	async function handleArchive() {
		items = items.filter((i: any) => i.status !== 'bought');
		setCachedData('items', items);

		pushToQueue({ type: 'archive' });
		updateQueueTracking();
		processOfflineQueue(() => {
			refreshData();
		});
	}

	async function handleQuickAdd(name: string, storeId?: number, categoryId?: number) {
		const tempId = -Math.floor(Math.random() * 100000);
		const newItem = {
			id: tempId,
			name,
			amount: 1,
			status: 'new',
			store_id: storeId || 1,
			category_id: categoryId || 1,
			note: ''
		};

		items = [newItem, ...items];
		setCachedData('items', items);

		const payload = { name, amount: 1, store_id: storeId, category_id: categoryId };
		pushToQueue({ type: 'quickadd', payload });
		updateQueueTracking();
		processOfflineQueue(() => {
			refreshData();
		});
	}

	// Helper getters
	function getStoreName(id: number) {
		const st = stores.find((s: any) => s.id === id);
		return st ? st.name : 'keiner';
	}

	function getCategoryColor(id: number) {
		const cat = categories.find((c: any) => c.id === id);
		return cat ? cat.color : '#64748b';
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
			class="bg-amber-500/10 border border-amber-500/35 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-pulse"
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
			<h2 class="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">
				Einkaufsliste
			</h2>
			<p class="text-xs text-slate-500 dark:text-slate-450 font-semibold">
				{activeItems.length} Artikel zu besorgen
			</p>
		</div>
		<div class="flex items-center gap-2">
			<!-- Bulk Clean checked items -->
			{#if boughtItems.length > 0}
				<button
					type="button"
					onclick={handleArchive}
					class="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl border border-rose-500/25 transition-all flex items-center justify-center cursor-pointer"
					title="Alle gekauften Einträge archivieren"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			{/if}

			<!-- New Entry Link -->
			<a
				href="/new-item"
				class="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
			>
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

	<!-- Recommendation Panel (Horizontal scrollable quick add) -->
	{#if frequent && frequent.length > 0}
		<div class="space-y-2">
			<h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
				Schnell hinzufügen
			</h3>
			<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4">
				{#each frequent as freq (freq.name)}
					<button
						type="button"
						onclick={() => handleQuickAdd(freq.name, freq.store_id, freq.category_id)}
						class="snap-start shrink-0 px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all hover:border-emerald-500/35 active:scale-95 flex items-center gap-1 cursor-pointer"
					>
						<span class="text-emerald-500 font-bold">+</span>
						{freq.name}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Active Shopping List -->
	<div class="space-y-4">
		{#if activeGroups.length === 0}
			<div
				class="text-center py-10 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800"
			>
				<p class="text-slate-400 dark:text-slate-500 text-sm font-medium">
					Dein Einkaufszettel ist leer.
				</p>
				<a
					href="/new-item"
					class="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-1 inline-block hover:underline"
				>
					Jetzt ersten Eintrag erstellen
				</a>
			</div>
		{:else}
			<div class="space-y-6">
				{#each activeGroups as group (group.category.id)}
					<div class="space-y-2">
						<!-- Category grouping header -->
						<div class="flex items-center gap-2 px-1">
							<span
								class="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10 shadow-inner"
								style="background-color: {group.category.color}"
							></span>
							<h4
								class="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider"
							>
								{group.category.name}
							</h4>
							<span
								class="text-[10px] font-bold text-slate-400 dark:text-slate-550 bg-slate-200/50 dark:bg-slate-900 px-1.5 py-0.5 rounded-md"
							>
								{group.items.length}
							</span>
						</div>

						<div class="space-y-2">
							{#each group.items as item (item.id)}
								<!-- Swipe Container wrapper -->
								<div
									class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm bg-slate-100 dark:bg-slate-950"
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
										<span class="text-xs font-bold ml-2">Bearbeiten</span>
									</div>

									<!-- Green checkmark panel (Revealed when swiping left) -->
									<div
										class="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 flex items-center justify-end pr-6 text-white transition-opacity duration-150 {activeSwipeType ===
											'left' && swipedItemId === item.id
											? 'opacity-100'
											: 'opacity-0'}"
									>
										<span class="text-xs font-bold mr-2">Einkauf abhaken</span>
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
										class="relative bg-white dark:bg-slate-900 p-3.5 flex items-center justify-between gap-3 select-none touch-pan-y active:cursor-grabbing cursor-grab"
										style="transform: translateX({swipedItemId === item.id
											? swipeOffset
											: 0}px); transition: {swipedItemId === item.id
											? 'none'
											: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)'}"
									>
										<div class="flex items-center gap-3 overflow-hidden flex-1">
											<!-- Category Badge indicator -->
											<span
												class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 shadow-inner"
												style="background-color: {getCategoryColor(item.category_id)}"
											></span>

											<!-- Image Thumbnail preview -->
											{#if item.image_path}
												<img
													src="{PUBLIC_API_BASE}{item.image_path}"
													alt={item.name}
													class="w-9 h-9 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0 pointer-events-none"
												/>
											{/if}

											<div class="overflow-hidden flex-1">
												<div class="flex items-center gap-1.5">
													<p class="font-bold text-slate-800 dark:text-slate-100 truncate">
														{item.amount}x {item.name}
													</p>

													<!-- Pending Sync Badge indicator -->
													{#if isPendingSync(item)}
														<span
															class="inline-flex items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider gap-0.5 shrink-0"
															title="Warte auf Synchronisation"
														>
															<svg
																class="w-3 h-3 text-slate-400 dark:text-slate-500 animate-spin"
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
												<p
													class="text-xs text-slate-500 dark:text-slate-450 truncate mt-0.5 pointer-events-none"
												>
													{#if item.store_id && item.store_id !== 1}
														<span class="text-emerald-600 dark:text-emerald-400 font-semibold"
															>{getStoreName(item.store_id)}</span
														>
													{/if}
													{#if item.note}
														{#if item.store_id && item.store_id !== 1}
															<span class="mx-1 text-slate-300 dark:text-slate-700">•</span>
														{/if}
														<span class="italic">"{item.note}"</span>
													{/if}
												</p>
											</div>
										</div>

										<!-- Standard Checkmark complete button (backup fallback) -->
										<button
											type="button"
											onclick={() => handleSwitchStatus(item.id)}
											class="w-9 h-9 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/35 text-slate-400 rounded-lg flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0"
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				<h3
					class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
				>
					Vergangene Einkäufe
				</h3>
				<span
					class="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850 shadow-inner"
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
					class="w-full bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition-colors shadow-inner"
				/>
				{#if searchTerm.length > 0}
					<button
						type="button"
						onclick={() => (searchTerm = '')}
						class="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
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
					<div
						class="bg-white/40 dark:bg-slate-950/20 border border-slate-200/80 dark:border-slate-900/60 rounded-xl p-3 flex items-center justify-between gap-3 opacity-60 hover:opacity-100 transition-opacity"
					>
						<div class="flex items-center gap-3 overflow-hidden flex-1">
							<span
								class="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
								style="background-color: {getCategoryColor(item.category_id)}"
							></span>

							{#if item.image_path}
								<img
									src="{PUBLIC_API_BASE}{item.image_path}"
									alt={item.name}
									class="w-8 h-8 object-cover rounded-lg border border-slate-200 dark:border-slate-850 shrink-0 opacity-80"
								/>
							{/if}

							<div class="overflow-hidden flex-1">
								<p
									class="font-medium text-xs text-slate-600 dark:text-slate-350 truncate line-through"
								>
									{item.amount}x {item.name}
								</p>
							</div>
						</div>

						<!-- Re-add item button -->
						<button
							type="button"
							onclick={() => handleSwitchStatus(item.id)}
							class="w-8 h-8 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 hover:bg-emerald-500/10 hover:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0"
							title="Wieder auf Einkaufszettel setzen"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18"
								/>
							</svg>
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
