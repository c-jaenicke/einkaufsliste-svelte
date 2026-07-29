<script lang="ts">
	import { page } from '$app/state';
	import './layout.css';

	let { children } = $props();

	// Computed active pathname helper
	const currentPath = $derived(page.url.pathname);

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

<div
	class="app min-h-screen bg-slate-50 text-slate-850 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans select-none pb-24 transition-colors duration-250"
>
	<!-- Sticky Top Header -->
	<header
		class="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-3 flex items-center justify-between"
	>
		<div class="flex items-center gap-2">
			<!-- Mini Logo -->
			<div
				class="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/10"
			>
				<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
					/>
				</svg>
			</div>
			<a
				href="/"
				class="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent"
			>
				Einkaufsliste
			</a>
		</div>

		<!-- Theme toggle & Status Badge -->
		<div class="flex items-center gap-2">
			<!-- Theme Toggle Button -->
			<button
				onclick={toggleTheme}
				type="button"
				class="p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl transition-all flex items-center justify-center active:scale-90"
				title="Farbschema wechseln"
			>
				{#if isDark}
					<!-- Sun icon -->
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				{:else}
					<!-- Moon icon -->
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

			<div
				class="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 rounded-full flex items-center gap-1.5"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
				Bereit
			</div>
		</div>
	</header>

	<!-- Main Content Area -->
	<main class="flex-1 w-full max-w-md mx-auto px-4 py-4 box-border flex flex-col">
		{@render children()}
	</main>

	<!-- Floating Bottom Mobile Navigation Bar -->
	<nav
		class="fixed bottom-4 left-4 right-4 h-16 bg-white/95 dark:bg-slate-950/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-lg dark:shadow-2xl flex items-center justify-around px-2 z-50 max-w-md mx-auto transition-colors duration-250"
	>
		<!-- TAB 1: Shopping List -->
		<a
			href="/"
			class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath ===
			'/'
				? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
				: 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
				/>
			</svg>
			<span class="text-[10px] mt-0.5">Liste</span>
		</a>

		<!-- TAB 2: Recipes -->
		<a
			href="/recipes"
			class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath.startsWith(
				'/recipes'
			)
				? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
				: 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
				/>
			</svg>
			<span class="text-[10px] mt-0.5">Rezepte</span>
		</a>

		<!-- TAB 3: Essensplaner -->
		<a
			href="/meals"
			class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath.startsWith(
				'/meals'
			)
				? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
				: 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
			<span class="text-[10px] mt-0.5">Planer</span>
		</a>

		<!-- TAB 3: Pet Companion -->
		<a
			href="/pet"
			class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath.startsWith(
				'/pet'
			)
				? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
				: 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}"
		>
			<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
				<path
					d="M12 14c-1.66 0-3 1.34-3 3 0 2 2 3.5 3 4.5 1-1 3-2.5 3-4.5 0-1.66-1.34-3-3-3zm-4.5-2c.83 0 1.5-.67 1.5-1.5S8.33 9 7.5 9 6 9.67 6 10.5s.67 1.5 1.5 1.5zm9 0c.83 0 1.5-.67 1.5-1.5S17.33 9 16.5 9s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-8.2-5c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm7.4 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"
				/>
			</svg>
			<span class="text-[10px] mt-0.5">Katze</span>
		</a>

		<!-- TAB 4: More / Admin -->
		<a
			href="/more"
			class="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200 {currentPath.startsWith(
				'/more'
			) || currentPath.startsWith('/item')
				? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
				: 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
				/>
			</svg>
			<span class="text-[10px] mt-0.5">Mehr</span>
		</a>
	</nav>
</div>
