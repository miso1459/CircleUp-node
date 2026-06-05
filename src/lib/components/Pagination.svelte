<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	import { Button } from '$lib/components/ui/button';

	let {
		currentPage,
		totalPages,
		total
	}: {
		currentPage: number;
		totalPages: number;
		total: number;
	} = $props();

	const pageNumbers = $derived.by(() => {
		const pages: number[] = [];
		const start = Math.max(1, currentPage - 2);
		const end = Math.min(totalPages, currentPage + 2);
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	});

	function buildUrl(targetPage: number) {
		const params = new URLSearchParams($page.url.searchParams);
		if (targetPage === 1) {
			params.delete('page');
		} else {
			params.set('page', String(targetPage));
		}
		const qs = params.toString();
		return `/Template/T01${qs ? '?' + qs : ''}`;
	}

	function goToPage(targetPage: number) {
		if (targetPage < 1 || targetPage > totalPages) return;
		goto(buildUrl(targetPage));
	}
</script>

<div class="flex items-center justify-between">
	<p class="text-xs text-muted-foreground">
		{m.common_total_count({count: total})}
	</p>
	<div class="flex items-center gap-1">
		<Button
			variant="ghost"
			size="icon"
			disabled={currentPage <= 1}
			onclick={() => goToPage(currentPage - 1)}
			class="h-8 w-8"
		>
			<ChevronLeft class="h-4 w-4" />
		</Button>
		{#each pageNumbers as pageNum (pageNum)}
			<Button
				variant={pageNum === currentPage ? 'default' : 'ghost'}
				size="sm"
				onclick={() => goToPage(pageNum)}
				class="h-8 min-w-8 px-2"
			>
				{pageNum}
			</Button>
		{/each}
		<Button
			variant="ghost"
			size="icon"
			disabled={currentPage >= totalPages}
			onclick={() => goToPage(currentPage + 1)}
			class="h-8 w-8"
		>
			<ChevronRight class="h-4 w-4" />
		</Button>
	</div>
</div>
