<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogClose
	} from '$lib/components/ui/dialog';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import type { MenuTreeNode } from '$lib/server/services/menu.service';
	import { SvelteSet } from 'svelte/reactivity';

	// -----------------------------------------------------------------------
	// Props
	// -----------------------------------------------------------------------
	let { data } = $props();

	// -----------------------------------------------------------------------
	// Menu Tree type (flattened for rendering)
	// -----------------------------------------------------------------------
	interface FlatItem {
		item: MenuTreeNode;
		depth: number;
	}

	// -----------------------------------------------------------------------
	// UI State
	// -----------------------------------------------------------------------
	let expanded = new SvelteSet<string>();
	let initialized = $state(false);

	// Initialize expanded with all items (expand all by default).
	// Use $effect to reactively track data.menuTree changes.
	$effect(() => {
		const tree = data.menuTree;
		if (!initialized && tree.length > 0) {
			function walk(list: MenuTreeNode[]) {
				for (const node of list) {
					expanded.add(node.id);
					walk(node.children);
				}
			}
			walk(tree);
			initialized = true;
		}
	});

	function toggleExpand(id: string) {
		if (expanded.has(id)) {
			expanded.delete(id);
		} else {
			expanded.add(id);
		}
	}

	// Flat tree for rendering (depth-based indentation)
	let flatTree = $derived.by(() => {
		const result: FlatItem[] = [];
		function walk(items: MenuTreeNode[], depth: number) {
			for (const item of items) {
				result.push({ item, depth });
				if (expanded.has(item.id) && item.children.length > 0) {
					walk(item.children, depth + 1);
				}
			}
		}
		walk(data.menuTree, 0);
		return result;
	});

	// -----------------------------------------------------------------------
	// Dialog & Form State
	// -----------------------------------------------------------------------
	let dialogOpen = $state(false);
	let editMode = $state(false);
	let editItemId = $state<string | null>(null);
	let deleteDialogOpen = $state(false);
	let deleteItemId = $state<string | null>(null);
	let deleteItemName = $state('');
	let formError = $state('');

	let formType = $state<'folder' | 'link'>('link');
	let formKoName = $state('');
	let formEnName = $state('');
	let formPath = $state('');
	let formIcon = $state('');
	let formRole = $state<string[]>(['all']);
	let formSortOrder = $state(0);
	let formParentId = $state('');
	let formIsActive = $state(true);

	const roleOptions = ['admin', 'user', 'all'] as const;

	function resetForm() {
		formType = 'link';
		formKoName = '';
		formEnName = '';
		formPath = '';
		formIcon = '';
		formRole = ['all'];
		formSortOrder = 0;
		formParentId = '';
		formIsActive = true;
		formError = '';
	}

	function openAddDialog(presetParentId?: string) {
		editMode = false;
		editItemId = null;
		resetForm();
		if (presetParentId) {
			formParentId = presetParentId;
		}
		dialogOpen = true;
	}

	function openEditDialog(item: MenuTreeNode) {
		editMode = true;
		editItemId = item.id;
		formType = item.type;
		formKoName = item.ko_name;
		formEnName = item.en_name;
		formPath = item.path || '';
		formIcon = item.icon || '';
		formRole = [...item.role];
		formSortOrder = item.sort_order;
		formParentId = item.parentId || '';
		formIsActive = item.is_active;
		formError = '';
		dialogOpen = true;
	}

	function openDeleteDialog(item: MenuTreeNode) {
		deleteItemId = item.id;
		deleteItemName = item.ko_name;
		deleteDialogOpen = true;
	}

	// -----------------------------------------------------------------------
	// Role helpers
	// -----------------------------------------------------------------------
	function handleRoleChange(role: string) {
		if (role === 'all') {
			formRole = ['all'];
			return;
		}
		const filtered = formRole.filter((r) => r !== 'all');
		const idx = filtered.indexOf(role);
		if (idx >= 0) {
			filtered.splice(idx, 1);
		} else {
			filtered.push(role);
		}
		formRole = filtered.length > 0 ? filtered : ['all'];
	}

	function isRoleSelected(role: string): boolean {
		return formRole.includes(role);
	}

	// -----------------------------------------------------------------------
	// Parent select: exclude self & descendants when editing
	// -----------------------------------------------------------------------
	let parentOptions = $derived.by(() => {
		const result: Array<{ id: string; label: string; depth: number }> = [];

		function walk(items: MenuTreeNode[], depth: number, skipChildren: boolean) {
			for (const node of items) {
				if (skipChildren) continue;

				const isEditingNode = Boolean(editMode && editItemId && node.id === editItemId);

				result.push({
					id: node.id,
					label: `${'　'.repeat(depth)}${node.ko_name}`,
					depth
				});
				walk(node.children, depth + 1, isEditingNode);
			}
		}
		walk(data.menuTree, 0, false);
		return result;
	});

	// -----------------------------------------------------------------------
	// Drag & Drop (reorder within same parent)
	// -----------------------------------------------------------------------
	let draggedId = $state<string | null>(null);
	let dropOverId = $state<string | null>(null);
	let dropPosition = $state<'before' | 'after' | null>(null);

	function handleDragStart(e: DragEvent, itemId: string) {
		draggedId = itemId;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(e: DragEvent, itemId: string, pos: 'before' | 'after') {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		dropOverId = itemId;
		dropPosition = pos;
	}

	function handleDragLeave(e: DragEvent) {
		if (
			e.currentTarget instanceof Node &&
			e.relatedTarget instanceof Node &&
			!e.currentTarget.contains(e.relatedTarget)
		) {
			dropOverId = null;
			dropPosition = null;
		}
	}

	async function handleDrop(e: DragEvent, targetId: string, targetParentId: string | null) {
		e.preventDefault();
		if (!draggedId || draggedId === targetId) {
			draggedId = null;
			dropOverId = null;
			dropPosition = null;
			return;
		}

		// Get siblings (same parent level) sorted by sort_order
		const siblings = data.flatMenus
			.filter((m) => m.parentId === targetParentId)
			.sort((a, b) => a.sort_order - b.sort_order);

		const draggedIdx = siblings.findIndex((m) => m.id === draggedId);
		const targetIdx = siblings.findIndex((m) => m.id === targetId);

		if (draggedIdx < 0 || targetIdx < 0) {
			draggedId = null;
			dropOverId = null;
			dropPosition = null;
			return;
		}

		// Build new order: remove dragged, insert at target position
		const reordered = siblings.filter((m) => m.id !== draggedId);
		const draggedItem = siblings[draggedIdx];
		let insertAt = targetIdx;
		if (draggedIdx < targetIdx) {
			// Dragged item was before target, after removal target shifts left
			insertAt = targetIdx - 1;
		}
		reordered.splice(insertAt, 0, draggedItem);

		const updates = reordered.map((item, i) => ({
			id: item.id,
			parentId: item.parentId,
			sort_order: i
		}));

		// Submit reorder via fetch
		const fd = new FormData();
		fd.append('updates', JSON.stringify(updates));
		await fetch('?/reorderMenu', { method: 'POST', body: fd });

		draggedId = null;
		dropOverId = null;
		dropPosition = null;

		// Reload to reflect changes
		window.location.reload();
	}

	function handleDragEnd() {
		draggedId = null;
		dropOverId = null;
		dropPosition = null;
	}

	// -----------------------------------------------------------------------
	// CSS class helpers for DnD
	// -----------------------------------------------------------------------
	function dropClasses(itemId: string, pos: 'before' | 'after'): string {
		const base =
			'pointer-events-none absolute left-0 right-0 z-10 h-1 rounded-full bg-primary transition-all';
		if (dropOverId === itemId && dropPosition === pos) {
			return `${base} opacity-100`;
		}
		return `${base} opacity-0`;
	}

	// -----------------------------------------------------------------------
	// Type display helpers
	// -----------------------------------------------------------------------
	function typeBadgeVariant(type: 'folder' | 'link'): 'default' | 'outline' | 'secondary' {
		return type === 'folder' ? 'default' : 'outline';
	}

	function roleBadgeVariant(role: string): 'default' | 'secondary' | 'outline' {
		switch (role) {
			case 'admin':
				return 'default';
			case 'user':
				return 'secondary';
			default:
				return 'outline';
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-semibold">{m.admin_menus_title()}</h2>
		<Button onclick={() => openAddDialog()}>
			<Plus class="size-4" />
			{m.admin_menus_add()}
		</Button>
	</div>

	<!-- Menu Tree -->
	{#if flatTree.length === 0}
		<p class="text-muted-foreground py-8 text-center">
			{m.admin_menus_add()}...
		</p>
	{:else}
		<div class="space-y-0.5">
			{#each flatTree as { item, depth } (item.id)}
				<div
					class="group relative flex items-center gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/50 {draggedId === item.id ? 'opacity-50' : ''}"
					style="margin-left: {depth * 1.5}rem"
					draggable={draggedId !== item.id}
					role="listitem"
					ondragstart={(e) => handleDragStart(e, item.id)}
					ondragend={handleDragEnd}
				>
					<!-- Drop zone: before -->
				<div
					class={dropClasses(item.id, 'before')}
					style="top: -2px"
					role="none"
						ondragover={(e) => handleDragOver(e, item.id, 'before')}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, item.id, item.parentId)}
					></div>

					<!-- Drag handle -->
					<div class="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100" role="none">
						<GripVertical class="size-4" />
					</div>

					<!-- Expand / collapse (folders only) -->
					{#if item.type === 'folder' && item.children.length > 0}
						<button
							type="button"
							class="text-muted-foreground hover:text-foreground flex items-center transition-colors"
							aria-label={expanded.has(item.id) ? '접기' : '펼치기'}
							onclick={() => toggleExpand(item.id)}
						>
							{#if expanded.has(item.id)}
								<ChevronDown class="size-4" />
							{:else}
								<ChevronRight class="size-4" />
							{/if}
						</button>
					{:else}
						<span class="w-4"></span>
					{/if}

					<!-- Name -->
					<span class="flex-1 truncate text-sm font-medium">
						{item.ko_name}
						{#if item.en_name && item.en_name !== item.ko_name}
							<span class="text-muted-foreground ml-1 text-xs">({item.en_name})</span>
						{/if}
					</span>

					<!-- Type badge -->
					<Badge variant={typeBadgeVariant(item.type)}>
						{item.type === 'folder' ? m.admin_menus_type_folder() : m.admin_menus_type_link()}
					</Badge>

					<!-- Role badges -->
					<div class="hidden items-center gap-1 sm:flex" role="none">
						{#each item.role as role (role)}
							<Badge variant={roleBadgeVariant(role)} class="text-xs">
								{role}
							</Badge>
						{/each}
					</div>

					<!-- Action buttons -->
					<div class="flex items-center gap-1" role="none">
						<!-- Add child (folder only) -->
						{#if item.type === 'folder'}
							<Button
								variant="ghost"
								size="icon-xs"
								onclick={() => openAddDialog(item.id)}
								title={m.admin_menus_add()}
							>
								<Plus class="size-3.5" />
							</Button>
						{/if}

						<Button
							variant="ghost"
							size="icon-xs"
							onclick={() => openEditDialog(item)}
							title={m.admin_menus_edit()}
						>
							<Pencil class="size-3.5" />
						</Button>

						<Button
							variant="ghost"
							size="icon-xs"
							onclick={() => openDeleteDialog(item)}
							title={m.admin_menus_delete()}
						>
							<Trash2 class="size-3.5" />
						</Button>
					</div>

					<!-- Drop zone: after -->
					<div
						class={dropClasses(item.id, 'after')}
						style="bottom: -2px"
						role="none"
						ondragover={(e) => handleDragOver(e, item.id, 'after')}
						ondragleave={handleDragLeave}
						ondrop={(e) => handleDrop(e, item.id, item.parentId)}
					></div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- ========================================================================
	     Add / Edit Dialog
	     ======================================================================== -->
	<Dialog bind:open={dialogOpen}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>
					{editMode ? m.admin_menus_edit() : m.admin_menus_add()}
				</DialogTitle>
			</DialogHeader>

			<form
				method="POST"
				action={editMode ? '?/updateMenu' : '?/createMenu'}
				class="space-y-4"
			>
				<!-- Hidden id for edit -->
				{#if editMode && editItemId}
					<input type="hidden" name="id" value={editItemId} />
				{/if}

				<!-- Error message -->
				{#if formError}
					<p class="text-destructive text-sm">{formError}</p>
				{/if}

				<!-- Type -->
				<div class="space-y-1.5">
					<Label for="menu-type"
						>{m.admin_menus_type_folder()}/{m.admin_menus_type_link()}</Label
					>
					<Select
						type="single"
						value={formType}
						onValueChange={(v: string) => {
							formType = v as 'folder' | 'link';
						}}
					>
						<SelectTrigger id="menu-type" class="w-full">
							{formType === 'folder' ? m.admin_menus_type_folder() : m.admin_menus_type_link()}
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="folder">{m.admin_menus_type_folder()}</SelectItem>
							<SelectItem value="link">{m.admin_menus_type_link()}</SelectItem>
						</SelectContent>
					</Select>
					<input type="hidden" name="type" value={formType} />
				</div>

				<!-- ko_name -->
				<div class="space-y-1.5">
					<Label for="ko_name">{m.admin_menus_ko_name()}</Label>
					<Input id="ko_name" name="ko_name" bind:value={formKoName} required />
				</div>

				<!-- en_name -->
				<div class="space-y-1.5">
					<Label for="en_name">{m.admin_menus_en_name()}</Label>
					<Input id="en_name" name="en_name" bind:value={formEnName} required />
				</div>

				<!-- path (only for link type) -->
				{#if formType === 'link'}
					<div class="space-y-1.5">
						<Label for="path">{m.admin_menus_path()}</Label>
						<Input id="path" name="path" bind:value={formPath} placeholder="/example" />
					</div>
				{/if}

				<!-- icon -->
				<div class="space-y-1.5">
					<Label for="icon">Icon</Label>
					<Input
						id="icon"
						name="icon"
						bind:value={formIcon}
						placeholder="home, settings, ..."
					/>
				</div>

				<!-- role (checkboxes) -->
				<div class="space-y-1.5">
					<Label>{m.admin_menus_role()}</Label>
					<div class="flex flex-wrap gap-3">
						{#each roleOptions as role (role)}
							<label class="flex items-center gap-1.5 text-sm">
								<input
									type="checkbox"
									name="role"
									value={role}
									checked={isRoleSelected(role)}
									onchange={() => handleRoleChange(role)}
								/>
								{role}
							</label>
						{/each}
					</div>
				</div>

				<!-- sort_order -->
				<div class="space-y-1.5">
					<Label for="sort_order">{m.admin_menus_sort()}</Label>
					<Input id="sort_order" name="sort_order" type="number" min="0" bind:value={formSortOrder} />
				</div>

				<!-- parentId -->
				<div class="space-y-1.5">
					<Label for="parent_id">상위 메뉴</Label>
					<Select
						type="single"
						value={formParentId}
						onValueChange={(v: string) => {
							formParentId = v;
						}}
					>
						<SelectTrigger id="parent_id" class="w-full">
							{formParentId
								? (parentOptions.find((p) => p.id === formParentId)?.label ?? formParentId)
								: '없음 (최상위)'}
						</SelectTrigger>
						<SelectContent>
							{#key JSON.stringify(parentOptions.map(p => p.id))}
								<SelectItem value="">없음 (최상위)</SelectItem>
								{#each parentOptions as opt (opt.id)}
									<SelectItem value={opt.id}>{opt.label}</SelectItem>
								{/each}
							{/key}
						</SelectContent>
					</Select>
					<input type="hidden" name="parentId" value={formParentId} />
				</div>

				<!-- is_active (only in edit mode) -->
				{#if editMode}
					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							id="is_active"
							name="is_active"
							value="true"
							checked={formIsActive}
							onchange={(e) => {
								formIsActive = e.currentTarget.checked;
							}}
						/>
						<Label for="is_active">{m.admin_menus_is_active()}</Label>
					</div>
				{/if}

				<!-- Submit -->
				<div class="flex justify-end gap-2 pt-2">
					<DialogClose>
						<Button variant="outline" type="button">{m.common_cancel()}</Button>
					</DialogClose>
					<Button type="submit">{m.common_save()}</Button>
				</div>
			</form>
		</DialogContent>
	</Dialog>

	<!-- ========================================================================
	     Delete Confirmation Dialog
	     ======================================================================== -->
	<Dialog bind:open={deleteDialogOpen}>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{m.admin_menus_delete()}</DialogTitle>
			</DialogHeader>

			<p class="text-sm">{m.admin_menus_confirm_delete()}</p>
			<p class="font-medium">{deleteItemName}</p>

			<form method="POST" action="?/deleteMenu" class="flex justify-end gap-2 pt-2">
				<input type="hidden" name="id" value={deleteItemId ?? ''} />

				<DialogClose>
					<Button variant="outline" type="button">{m.common_cancel()}</Button>
				</DialogClose>
				<Button variant="destructive" type="submit">{m.common_delete()}</Button>
			</form>
		</DialogContent>
	</Dialog>
</div>
