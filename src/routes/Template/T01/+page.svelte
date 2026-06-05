<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import type { Template01 } from '$lib/server/services/template-01.service';
	import { navigating } from '$app/stores';
	import DataTable from '$lib/components/data-table.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Inbox, AlertCircle } from 'lucide-svelte';
	import * as m from '$lib/paraglide/messages';
	import * as Table from '$lib/components/ui/table';

	let { data } = $props();

	const isLoading = $derived($navigating !== null);
	const isEmpty = $derived(!isLoading && !data.error && data.items.length === 0);
	const isError = $derived(!isLoading && !!data.error);

	const skeletonWidths = ['w-12', 'w-20', 'w-28', 'w-16', 'w-20', 'w-20'];

	const columns: ColumnDef<Template01, unknown>[] = [
		{
			accessorKey: 'id',
			header: 'ID'
		},
		{
			accessorKey: 'code',
			header: '코드'
		},
		{
			accessorKey: 'desc',
			header: '설명'
		},
		{
			accessorKey: 'createdBy',
			header: '생성자'
		},
		{
			accessorKey: 'createdAt',
			header: '생성일',
			cell: ({ getValue }) => {
				const val = getValue() as Date;
				return val ? new Date(val).toLocaleDateString('ko-KR') : '-';
			}
		},
		{
			accessorKey: 'updatedAt',
			header: '수정일',
			cell: ({ getValue }) => {
				const val = getValue() as Date;
				return val ? new Date(val).toLocaleDateString('ko-KR') : '-';
			}
		}
	];
</script>

<div class="flex h-full flex-col px-5 pb-5">
	<!-- Title area -->
	<div class="shrink-0 pt-5 pb-4">
		<h2 class="text-base font-medium tracking-tight text-foreground">
			Template 01
		</h2>
		<p class="mt-0.5 text-xs text-muted-foreground/70">
			{#if data.search}
				{m.common_search_result({search: data.search})}
			{/if}
		</p>
	</div>

	<!-- Search area with subtle separator -->
	<div class="shrink-0 border-b border-border/40 pb-4">
		<SearchInput class="max-w-sm" />
	</div>

	<!-- Table area: fills remaining viewport, scrolls internally -->
	<div class="flex-1 min-h-0 overflow-auto pt-4">
		{#if isError}
			<!-- Error state -->
			<div
				class="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
			>
				<AlertCircle class="h-5 w-5 shrink-0 text-destructive" />
				<p class="text-sm text-destructive">{data.error}</p>
			</div>
		{:else if isLoading}
			<!-- Loading skeleton -->
			<div class="rounded-2xl border border-border/50 bg-card overflow-hidden">
				<Table.Root>
					<Table.Header>
						<Table.Row class="bg-muted/50 hover:bg-muted/50">
						{#each columns as _col, ci (ci)}
							<Table.Head class="font-medium whitespace-nowrap">
								<Skeleton class="h-4 w-16" />
							</Table.Head>
						{/each}
						</Table.Row>
					</Table.Header>
					<Table.Body>
					{#each Array(8) as _, i (i)}
						<Table.Row class="transition-colors">
							{#each columns as _col, ci (ci)}
								<Table.Cell class="whitespace-nowrap">
									<Skeleton class="h-4 {skeletonWidths[i % 6]}" />
								</Table.Cell>
							{/each}
						</Table.Row>
					{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:else if isEmpty}
			<!-- Empty state -->
			<div
				class="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card py-16"
			>
				<Inbox class="mb-4 h-12 w-12 text-muted-foreground/50" strokeWidth={1.5} />
				<p class="text-base font-medium text-foreground">{m.common_empty_result()}</p>
				<p class="mt-1 text-sm text-muted-foreground">{m.common_empty_hint()}</p>
			</div>
		{:else}
			<!-- Normal data table -->
			<DataTable data={data.items} {columns} />
		{/if}
	</div>

	<!-- Pagination pinned at bottom -->
	{#if !isEmpty && !isError && !isLoading}
		<div class="shrink-0 border-t border-border/40 pt-3">
			<Pagination currentPage={data.page} totalPages={data.totalPages} total={data.total} />
		</div>
	{/if}
</div>
