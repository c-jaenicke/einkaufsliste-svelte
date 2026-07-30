import { env } from '$env/dynamic/public';

// Read at request/load time (not build time) so the same built image can be
// deployed with a different public backend URL per environment, instead of
// baking it in at `vite build`.
const PUBLIC_API_BASE = env.PUBLIC_API_BASE;

export interface SyncAction {
	type: 'switch';
	id?: number;
	timestamp: number;
}

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// Core local storage caching helpers
export function getCachedData(key: string): any {
	if (!isBrowser) return null;
	const data = localStorage.getItem(`cache_${key}`);
	return data ? JSON.parse(data) : null;
}

export function setCachedData(key: string, data: any): void {
	if (!isBrowser) return;
	localStorage.setItem(`cache_${key}`, JSON.stringify(data));
}

// Offline Action Queue Manager
export function getOfflineQueue(): SyncAction[] {
	if (!isBrowser) return [];
	const q = localStorage.getItem('offline_sync_queue');
	return q ? JSON.parse(q) : [];
}

export function saveOfflineQueue(queue: SyncAction[]): void {
	if (!isBrowser) return;
	localStorage.setItem('offline_sync_queue', JSON.stringify(queue));
}

export function pushToQueue(action: Omit<SyncAction, 'timestamp'>): void {
	const queue = getOfflineQueue();
	queue.push({ ...action, timestamp: Date.now() });
	saveOfflineQueue(queue);
}

// Background Queue Processor
let isSyncing = false;

export async function processOfflineQueue(onSuccessCallback?: () => void): Promise<void> {
	if (!isBrowser || isSyncing) return;
	const queue = getOfflineQueue();
	if (queue.length === 0) return;

	isSyncing = true;
	console.log(`Starting background synchronization of ${queue.length} offline actions...`);

	const failedActions: SyncAction[] = [];

	for (const action of queue) {
		try {
			if (action.type === 'switch' && action.id) {
				const res = await fetch(`${PUBLIC_API_BASE}/items/${action.id}/status`, {
					method: 'PATCH'
				});
				if (!res.ok) throw new Error('Failed to toggle item status');
			}
		} catch (err) {
			console.error('Failed to sync action, keeping in queue:', action, err);
			failedActions.push(action);
		}
	}

	saveOfflineQueue(failedActions);
	isSyncing = false;

	if (failedActions.length === 0 && onSuccessCallback) {
		console.log('Background synchronization completed successfully!');
		onSuccessCallback();
	}
}

// Set up online listeners for auto-syncing
export function initOfflineSync(onSyncFinished: () => void) {
	if (!isBrowser) return;

	// Listen for connection status changes
	window.addEventListener('online', () => {
		console.log('Device returned online, running pending synchronizations...');
		processOfflineQueue(onSyncFinished);
	});

	// Trigger initial sync attempt on start
	if (navigator.onLine) {
		processOfflineQueue(onSyncFinished);
	}
}
