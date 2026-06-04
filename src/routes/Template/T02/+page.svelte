<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ColumnDef } from '@tanstack/table-core';
	import DataTable from '$lib/components/data-table.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Search } from 'lucide-svelte';

	let { data } = $props();

	let searchVal = $state(data.search ?? '');
	let startDate = $state(data.startDate ?? '');
	let endDate = $state(data.endDate ?? '');

	function formatDate(d: Date | string): string {
		return new Date(d).toLocaleDateString('sv-SE');
	}

	const columns: ColumnDef<(typeof data.items)[number], unknown>[] = [
		{ accessorKey: 'id', header: 'Id' },
		{
			accessorKey: 'date',
			header: 'Date',
			cell: ({ row }) => formatDate(row.getValue('date'))
		},
		{ accessorKey: 'code', header: 'Code' },
		{ accessorKey: 'desc', header: 'Desc' },
		{ accessorKey: 'createdBy', header: 'CreatedBy' },
		{
			accessorKey: 'createdAt',
			header: 'CreatedAt',
			cell: ({ row }) => formatDate(row.getValue('createdAt'))
		},
		{ accessorKey: 'updatedBy', header: 'UpdatedBy' },
		{
			accessorKey: 'updatedAt',
			header: 'UpdatedAt',
			cell: ({ row }) => formatDate(row.getValue('updatedAt'))
		}
	];

	function buildUrl(overrides: Record<string, string>) {
		const params = new URLSearchParams();
		const s = overrides.search ?? searchVal;
		const sd = overrides.startDate ?? startDate;
		const ed = overrides.endDate ?? endDate;
		const p = overrides.page ?? String(data.page);

		if (s) params.set('search', s);
		if (sd) params.set('startDate', sd);
		if (ed) params.set('endDate', ed);
		if (p !== '1') params.set('page', p);

		return `/Template/T02?${params.toString()}`;
	}

	function handleSearch() {
		goto(buildUrl({ page: '1' }));
	}

	function handleReset() {
		searchVal = '';
		startDate = '';
		endDate = '';
		goto('/Template/T02');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleSearch();
	}

	function goToPage(page: number) {
		goto(buildUrl({ page: String(page) }));
	}

	const pageNumbers = $derived.by(() => {
		const total = data.totalPages;
		const current = data.page;
		const pages: number[] = [];
		const start = Math.max(1, current - 2);
		const end = Math.min(total, current + 2);
		for (let i = start; i <= end; i++) pages.push(i);
		return pages;
	});
</script>

<div class="flex h-full flex-col gap-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Template 02</h2>
		<p class="mt-1 text-sm text-muted-foreground">Data inquiry with filters and pagination</p>
	</div>

	<!-- Filter Form -->
	<div class="rounded-2xl border border-border/50 bg-card p-4">
		<div class="flex flex-wrap items-end gap-4">
			<div class="flex flex-col gap-1.5">
				<label for="startDate" class="text-sm font-medium">Start Date</label>
				<input
					id="startDate"
					type="date"
					bind:value={startDate}
					class="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				/>
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="endDate" class="text-sm font-medium">End Date</label>
				<input
					id="endDate"
					type="date"
					bind:value={endDate}
					class="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
				/>
			</div>
			<div class="flex flex-col gap-1.5">
				<label for="search" class="text-sm font-medium">Search</label>
				<div class="relative">
					<Search class="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						id="search"
						type="text"
						bind:value={searchVal}
						onkeydown={handleKeydown}
						placeholder="Search..."
						class="h-9 w-64 rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					/>
				</div>
			</div>
			<Button onclick={handleSearch}>Search</Button>
			<Button variant="outline" onclick={handleReset}>Reset</Button>
		</div>
	</div>

	<!-- Data Table -->
	<div class="min-h-0 flex-1 overflow-y-auto">
		<DataTable data={data.items} {columns} />
	</div>

	<!-- Pagination -->
	{#if data.totalPages > 1}
		<div class="flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Total {data.total} records — Page {data.page} of {data.totalPages}
			</p>
			<div class="flex items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					disabled={data.page <= 1}
					onclick={() => goToPage(data.page - 1)}
				>
					Previous
				</Button>
				{#each pageNumbers as pageNum (pageNum)}
					<Button
						variant={pageNum === data.page ? 'default' : 'outline'}
						size="sm"
						onclick={() => goToPage(pageNum)}
					>
						{pageNum}
					</Button>
				{/each}
				<Button
					variant="outline"
					size="sm"
					disabled={data.page >= data.totalPages}
					onclick={() => goToPage(data.page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
</div>
