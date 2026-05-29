<script lang="ts">
	import type { MenuTreeNode } from '$lib/server/services/menu.service';
	import { NavigationMenuLink } from '$lib/components/ui/navigation-menu';
	import { getLocale, localizeHref } from '$lib/paraglide/runtime';
	import NavigationMenuItem from './NavigationMenuItem.svelte';

	let { items = [] }: { items: MenuTreeNode[] } = $props();

	const currentLocale = $derived(getLocale());

	function localizeName(item: MenuTreeNode): string {
		return item[`${currentLocale}_name` as keyof MenuTreeNode] as string;
	}
</script>

<ul class="grid w-[200px] gap-1 p-2">
	{#each items as item (item.id)}
		<li>
			{#if item.type === 'folder' && item.children.length > 0}
				<div class="mb-1 px-2 py-1 text-xs font-medium text-muted-foreground">
					{localizeName(item)}
				</div>
				<NavigationMenuItem items={item.children} />
			{:else}
				<NavigationMenuLink href={localizeHref(item.path ?? '/')}>
					{localizeName(item)}
				</NavigationMenuLink>
			{/if}
		</li>
	{/each}
</ul>
