<script lang="ts">
	import type { ColumnDef } from '@tanstack/table-core';
	import type { Template01 } from '$lib/server/services/template-01.service';
	import DataTable from '$lib/components/data-table.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data } = $props();

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

	const isEmpty = $derived(data.items.length === 0);
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Template 01</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			총 {data.total}건
			{#if data.search}
				· "{data.search}" 검색 결과
			{/if}
		</p>
	</div>

	<SearchInput placeholder="코드 또는 설명 검색..." class="max-w-sm" />

	<DataTable data={data.items} {columns} />

	{#if !isEmpty}
		<Pagination currentPage={data.page} totalPages={data.totalPages} />
	{/if}
</div>
