<script lang="ts">
	import type { MenuTreeNode } from '$lib/server/services/menu.service';
	import {
		NavigationMenuRoot,
		NavigationMenuList,
		NavigationMenuItem,
		NavigationMenuTrigger,
		NavigationMenuContent,
		NavigationMenuLink
	} from '$lib/components/ui/navigation-menu';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import NavigationMenuItems from './NavigationMenuItem.svelte';

	let { items = [], user = null }: {
		items: MenuTreeNode[];
		user: { name: string; email: string } | null;
	} = $props();

	const currentLocale = $derived(getLocale());

	function localizeName(item: MenuTreeNode): string {
		return item[`${currentLocale}_name` as keyof MenuTreeNode] as string;
	}
</script>

<NavigationMenuRoot viewport={false}>
	<NavigationMenuList>
		{#each items as item (item.id)}
			<NavigationMenuItem class={item.path === '/user/profile' ? 'ml-auto' : ''}>
				{#if item.type === 'folder' && item.children.length > 0}
					<NavigationMenuTrigger>
						{localizeName(item)}
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuItems items={item.children} />
					</NavigationMenuContent>
				{:else if item.path === '/login' && user !== null}
					<!-- HIDE Login entry when authenticated -->
				{:else if item.path === '/logout' && user !== null}
					<!-- Show logout when authenticated -->
					<form method="POST" action="/logout">
						<button type="submit" class="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-sm transition-all hover:bg-muted focus-visible:ring-3 focus-visible:outline-1">
							{currentLocale === 'ko'
								? m.nav_logout()
								: `${m.nav_logout()} (${user.name})`}
						</button>
					</form>
				{:else if item.path === '/logout'}
					<!-- HIDE Logout when not authenticated -->
				{:else}
					<NavigationMenuLink href={localizeHref(item.path ?? '/')}>
						{localizeName(item)}
					</NavigationMenuLink>
				{/if}
			</NavigationMenuItem>
		{/each}
	</NavigationMenuList>
</NavigationMenuRoot>