<script lang="ts" generics="TData">
	import type { ColumnDef } from "@tanstack/table-core";
	import { getCoreRowModel } from "@tanstack/table-core";
	import { createSvelteTable, FlexRender } from "$lib/components/ui/data-table";
	import * as Table from "$lib/components/ui/table";

	type Props = {
		data: TData[];
		columns: ColumnDef<TData, unknown>[];
	};

	let { data, columns }: Props = $props();

	const table = createSvelteTable({
		get data() {
			return data;
		},
		get columns() {
			return columns;
		},
		getCoreRowModel: getCoreRowModel(),
	});
</script>

{#snippet renderTable()}
	<Table.Root>
		<Table.Header>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row class="bg-muted/50 hover:bg-muted/50">
					{#each headerGroup.headers as header (header.id)}
						<Table.Head class="font-medium whitespace-nowrap">
							{#if !header.isPlaceholder}
								<FlexRender
									content={header.column.columnDef.header}
									context={header.getContext()}
								/>
							{/if}
						</Table.Head>
					{/each}
				</Table.Row>
			{/each}
		</Table.Header>
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row class="transition-colors hover:bg-muted/40">
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell class="whitespace-nowrap">
							<FlexRender
								content={cell.column.columnDef.cell}
								context={cell.getContext()}
							/>
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell
						colspan={columns.length}
						class="h-24 text-center text-muted-foreground"
					>
						데이터가 없습니다.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{/snippet}

<div class="rounded-2xl border border-border/50 bg-card overflow-hidden">
	{@render renderTable()}
</div>
