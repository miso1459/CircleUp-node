<script lang="ts">
	import { locales, getLocale, setLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import NavigationMenu from '$lib/components/blocks/NavigationMenu.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from "mode-watcher";	
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuLabel
	} from '$lib/components/ui/dropdown-menu';
	import User from '@lucide/svelte/icons/user';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Languages from '@lucide/svelte/icons/languages';

	let { children, data } = $props();

	const currentLocale = $derived(getLocale());

	const localeLabels: Record<string, string> = {
		ko: '한국어',
		en: 'English'
	};

	async function switchLanguage(locale: string) {
		// If logged in, update user's lang in DB first
		if (data.user) {
			try {
				const res = await fetch('/api/update-lang', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ lang: locale })
				});
				if (!res.ok) return;
			} catch {
				return;
			}
		}
		// Set locale cookie and reload page
		setLocale(locale as 'ko' | 'en');
	}
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

		<!-- User dropdown menu -->
		{#if data.user}
			<DropdownMenu>
				<DropdownMenuTrigger>
					<button class="ml-4 flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
						<div class="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
							{data.user.name?.charAt(0)?.toUpperCase() ?? '?'}
						</div>
						<span class="hidden sm:inline">{data.user.name}</span>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" class="w-48">
					<DropdownMenuLabel>
						<div class="flex flex-col gap-0.5">
							<span class="font-medium">{data.user.name}</span>
							<span class="text-xs text-muted-foreground">{data.user.email}</span>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<!-- Language selector -->
					<div class="px-2 py-1.5">
						<div class="mb-1 flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
							<Languages class="size-3.5" />
							<span>{m.dropdown_language()}</span>
						</div>
						{#each locales as locale (locale)}
							<button
								type="button"
								class="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted {locale === currentLocale ? 'font-medium text-foreground' : 'text-muted-foreground'}"
								onclick={() => switchLanguage(locale)}
							>
								{#if locale === currentLocale}
									<svg class="mr-2 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								{/if}
								<span>{localeLabels[locale] ?? locale}</span>
							</button>
						{/each}
					</div>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<a href="/user/profile" class="flex w-full cursor-pointer items-center gap-2">
							<User class="size-4" />
							<span>{m.dropdown_profile()}</span>
						</a>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<form method="POST" action="/logout" class="w-full">
							<button type="submit" class="flex w-full cursor-pointer items-center gap-2">
								<LogOut class="size-4" />
								<span>{m.dropdown_logout()}</span>
							</button>
						</form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		{/if}
	</div>
</header>

<main class="mx-auto max-w-7xl px-6 py-8">
	{@render children()}
</main>
