<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Search, X } from 'lucide-svelte';
	import { cn } from '$lib/utils.js';

	let {
		placeholder = '검색...',
		class: className
	}: {
		placeholder?: string;
		class?: string;
	} = $props();

	// Bound to input; synced with URL when URL changes (after navigation)
	let inputEl: HTMLInputElement | undefined = $state();

	function buildUrl(search: string) {
		const params = new URLSearchParams($page.url.searchParams);
		if (search) {
			params.set('search', search);
		} else {
			params.delete('search');
		}
		params.delete('page'); // reset to page 1 on search
		const qs = params.toString();
		return `/Template/T01${qs ? '?' + qs : ''}`;
	}

	function handleSearch() {
		const val = inputEl?.value ?? '';
		goto(buildUrl(val));
	}

	function handleClear() {
		if (inputEl) inputEl.value = '';
		goto(buildUrl(''));
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleSearch();
	}

	// Sync input with URL when URL changes (after navigation)
	$effect(() => {
		const urlSearch = $page.url.searchParams.get('search') ?? '';
		if (inputEl && inputEl.value !== urlSearch) {
			inputEl.value = urlSearch;
		}
	});
</script>

<div class={cn('relative', className)}>
	<Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
	<input
		bind:this={inputEl}
		type="text"
		value={$page.url.searchParams.get('search') ?? ''}
		{placeholder}
		onkeydown={handleKeydown}
		class="h-8 w-full rounded-md border border-input bg-transparent pl-9 pr-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
	/>
	{#if $page.url.searchParams.get('search')}
		<button
			type="button"
			onclick={handleClear}
			class="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
		>
			<X class="h-4 w-4" />
		</button>
	{/if}
</div>
