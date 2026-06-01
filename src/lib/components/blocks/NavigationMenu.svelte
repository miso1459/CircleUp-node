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
			<NavigationMenuItem class={item.ko_name === '설정' ? 'ml-auto' : ''}>
				{#if item.type === 'folder' && item.children.length > 0}
					<NavigationMenuTrigger>
						{localizeName(item)}
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuItems items={item.children} />
					</NavigationMenuContent>
			{:else if item.path === '/login' && item.ko_name === '로그인' && user !== null}
				<!-- HIDE Login entry when authenticated -->
			{:else if item.ko_name === '로그아웃' && user !== null}
				<!-- Show logout with username when authenticated -->
				<form method="POST" action="/logout">
					<button type="submit" class="flex w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-sm transition-all hover:bg-muted focus-visible:ring-3 focus-visible:outline-1">
						{currentLocale === 'ko'
							? `로그아웃 (${user.name})`
							: `Sign Out (${user.name})`}
					</button>
				</form>
			{:else if item.ko_name === '로그아웃'}
				<!-- HIDE Logout entry when not authenticated -->
			{:else}
					<NavigationMenuLink href={localizeHref(item.path ?? '/')}>
						{localizeName(item)}
					</NavigationMenuLink>
				{/if}
			</NavigationMenuItem>
		{/each}
	</NavigationMenuList>
</NavigationMenuRoot>