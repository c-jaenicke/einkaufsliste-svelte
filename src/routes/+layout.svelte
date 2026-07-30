<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';

	let { children } = $props();

	// Computed active pathname helper
	const currentPath = $derived(page.url.pathname);

	// Dynamic page title mapping based on current pathname and SvelteKit page data
	const pageTitle = $derived.by(() => {
		const path = currentPath;
		if (path === '/') return 'Einkaufsliste';
		if (path.startsWith('/recipes/new')) return 'Neues Rezept';
		if (path.startsWith('/recipes/')) return 'Rezept bearbeiten';
		if (path.startsWith('/recipes')) return 'Rezepte';
		if (path.startsWith('/meals')) return 'Essensplaner';
		if (path.startsWith('/pet')) return 'Haustier-Companion';
		if (path.startsWith('/new-item')) return 'Neuer Eintrag';
		if (path.startsWith('/item/')) return 'Eintrag bearbeiten';
		if (path.startsWith('/more/new/store')) return 'Neuer Laden';
		if (path.startsWith('/more/new/category')) return 'Neue Kategorie';
		if (path.startsWith('/more/new/pet')) return 'Neues Haustier';
		if (path.startsWith('/more/category/')) {
			return page.data.name ? `Kategorie: ${page.data.name}` : 'Kategorie';
		}
		if (path.startsWith('/more/store/')) {
			return page.data.name ? `Laden: ${page.data.name}` : 'Laden';
		}
		if (path.startsWith('/more')) return 'Einstellungen';
		return 'Einkaufsliste';
	});

	// Browser tab title mirrors the in-app page title so it's clear where you are
	const tabTitle = $derived(
		pageTitle === 'Einkaufsliste' ? 'Einkaufsliste' : `${pageTitle} – Einkaufsliste`
	);

	// Light / Dark Theme state (Light Mode by default)
	let isDark = $state(false);

	$effect(() => {
		// Read theme choice from localStorage or default to system preference if desired
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme === 'dark') {
			isDark = true;
			document.documentElement.classList.add('dark');
		} else {
			isDark = false;
			document.documentElement.classList.remove('dark');
		}
	});

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			localStorage.setItem('theme', 'dark');
			document.documentElement.classList.add('dark');
		} else {
			localStorage.setItem('theme', 'light');
			document.documentElement.classList.remove('dark');
		}
	}
</script>

<svelte:head>
	<title>{tabTitle}</title>
</svelte:head>

<div
	class="app min-h-screen bg-surface-100-900 flex flex-col font-sans select-none transition-colors duration-250"
>
	<!-- Fixed Top Header -->
	<header
		class="fixed top-0 left-0 right-0 z-40 bg-surface-100-900/90 border-b border-surface-200-800 backdrop-blur-md transition-colors duration-250"
	>
		<div class="max-w-md mx-auto px-4 pt-2 pb-3 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<h1 class="text-base font-black tracking-tight">
					{pageTitle}
				</h1>
			</div>

			<!-- Theme toggle & Status Badge -->
			<div class="flex items-center gap-2">
				<!-- Theme Toggle Button using Skeleton preset style -->
				<button
					onclick={toggleTheme}
					type="button"
					class="btn preset-filled-primary-500 p-1.5 rounded-xl active:scale-90 transition-all flex items-center justify-center cursor-pointer"
					title="Farbschema wechseln"
				>
					{#if isDark}
						<!-- Sun icon (custom SVG) -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					{:else}
						<!-- Moon icon (custom SVG) -->
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 w-full max-w-md mx-auto px-4 pt-20 pb-24 box-border flex flex-col">
		{@render children()}
	</main>

	<!-- Fixed Bottom Navigation Bar (Footer) -->
	<nav
		class="fixed bottom-0 left-0 right-0 z-50 bg-surface-100-900/95 border-t border-surface-200-800 backdrop-blur-md transition-colors duration-250"
	>
		<div class="max-w-md mx-auto h-16 flex items-center justify-around px-2">
			<!-- TAB 1: Shopping List -->
			<a
				href="/"
				class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath ===
				'/'
					? 'text-primary-600 dark:text-primary-400 font-bold scale-105'
					: 'text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400'}"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
					/>
				</svg>
				<span class="mt-0.5">Liste</span>
			</a>

			<!-- TAB 2: Recipes -->
			<a
				href="/recipes"
				class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath.startsWith(
					'/recipes'
				)
					? 'text-primary-600 dark:text-primary-400 font-bold scale-105'
					: 'text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400'}"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
				<span class="mt-0.5">Rezepte</span>
			</a>

			<!-- TAB 3: Essensplaner -->
			<a
				href="/meals"
				class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath.startsWith(
					'/meals'
				)
					? 'text-primary-600 dark:text-primary-400 font-bold scale-105'
					: 'text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400'}"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<span class="mt-0.5">Planer</span>
			</a>

			<!-- TAB 4: Pet Companion -->
			<a
				href="/pet"
				class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath.startsWith(
					'/pet'
				)
					? 'text-primary-600 dark:text-primary-400 font-bold scale-105'
					: 'text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400'}"
			>
				<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
					<ellipse cx="12" cy="17" rx="5" ry="4" />
					<ellipse cx="6" cy="10" rx="2" ry="2.6" transform="rotate(-20 6 10)" />
					<ellipse cx="10" cy="6.5" rx="2" ry="2.6" transform="rotate(-8 10 6.5)" />
					<ellipse cx="14" cy="6.5" rx="2" ry="2.6" transform="rotate(8 14 6.5)" />
					<ellipse cx="18" cy="10" rx="2" ry="2.6" transform="rotate(20 18 10)" />
				</svg>
				<span class="mt-0.5">Katze</span>
			</a>

			<!-- TAB 5: More / Admin -->
			<a
				href="/more"
				class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath.startsWith(
					'/more'
				) || currentPath.startsWith('/item')
					? 'text-primary-600 dark:text-primary-400 font-bold scale-105'
					: 'text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400'}"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
					/>
				</svg>
				<span class="mt-0.5">Mehr</span>
			</a>
		</div>
	</nav>
</div>
