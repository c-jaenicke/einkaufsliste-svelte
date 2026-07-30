export function getCategoryColor(categories: any[], id: number): string {
	const cat = categories.find((c: any) => c.id === id);
	return cat ? cat.color : '#64748b';
}

export function getCategoryName(categories: any[], id: number): string {
	const cat = categories.find((c: any) => c.id === id);
	return cat ? cat.name : 'keine';
}

export function getStoreName(stores: any[], id: number, fallback = 'Kein Laden'): string {
	const store = stores.find((s: any) => s.id === id);
	return store ? store.name : fallback;
}

// Stable sort that pulls favorited items to the front, keeping the relative
// order of everything else unchanged.
export function sortFavoritesFirst(items: any[]): any[] {
	return [...items].sort((a, b) => Number(b.favorite) - Number(a.favorite));
}

// Stores/categories sort with the "none" placeholder (id 1) always last.
export function sortByNameNoneLast(
	a: { id: number; name: string },
	b: { id: number; name: string }
) {
	if (a.id === 1) return 1;
	if (b.id === 1) return -1;
	return a.name.localeCompare(b.name);
}

// Groups active (status "new") items by store, then by category within each
// store, so the list can be worked through store-by-store, department-by-department.
export function groupActiveItemsByStoreAndCategory(
	itemsList: any[],
	storesList: any[],
	catsList: any[]
) {
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
