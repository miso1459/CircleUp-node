<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import NavigationMenu from '$lib/components/blocks/NavigationMenu.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from "mode-watcher";	

	let { children, data } = $props();
</script>

<ModeWatcher />
<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- Sticky top navigation with backdrop blur -->
<header class="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
	<div class="mx-auto flex h-16 max-w-7xl items-center px-6">
		<!-- Logo -->
		<a href="/" class="mr-8 flex items-center gap-2.5 transition-opacity hover:opacity-80">
			<div class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-4.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10" />
					<path d="M8 12h8" />
					<path d="M12 8v8" />
				</svg>
			</div>
			<span class="text-lg font-semibold tracking-tight text-foreground">CircleUp</span>
		</a>

		<!-- Navigation items -->
		<div class="flex flex-1 items-center">
			<NavigationMenu items={data.menus} user={data.user} />
		</div>

		<!-- User avatar / mode toggle area -->
		{#if data.user}
			<a href="/user/profile" class="ml-4 flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
				<div class="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
					{data.user.name?.charAt(0)?.toUpperCase() ?? '?'}
				</div>
				<span class="hidden sm:inline">{data.user.name}</span>
			</a>
		{/if}
	</div>
</header>

<main class="mx-auto max-w-7xl px-6 py-8">
	{@render children()}
</main>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}>{locale}</a>
	{/each}
</div>
