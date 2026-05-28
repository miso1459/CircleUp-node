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

	let { items = [] }: { items: MenuTreeNode[] } = $props();

	const currentLocale = $derived(getLocale());

	function localizeName(item: MenuTreeNode): string {
		return item[`${currentLocale}_name` as keyof MenuTreeNode] as string;
	}
</script>

<NavigationMenuRoot>
	<NavigationMenuList>
		{#each items as item (item.id)}
			<NavigationMenuItem>
				{#if item.type === 'folder' && item.children.length > 0}
					<NavigationMenuTrigger>
						{localizeName(item)}
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<NavigationMenuItems items={item.children} />
					</NavigationMenuContent>
				{:else}
					<NavigationMenuLink href={localizeHref(item.path ?? '/')}>
						{localizeName(item)}
					</NavigationMenuLink>
				{/if}
			</NavigationMenuItem>
		{/each}
	</NavigationMenuList>
</NavigationMenuRoot>
