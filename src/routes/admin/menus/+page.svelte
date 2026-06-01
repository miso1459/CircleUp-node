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

				const isSelf = Boolean(editMode && editItemId && node.id === editItemId);
				if (isSelf) {
					walk(node.children, depth + 1, true);
					continue;
				}

				if (node.type === 'folder') {
					result.push({
						id: node.id,
						label: `${' '.repeat(depth)}${node.ko_name}`,
						depth
					});
				}
				walk(node.children, depth + 1, false);
			}
		}
		walk(data.menuTree, 0, false);
		return result;
	});

	// -----------------------------------------------------------------------
	// Drag & Drop
	// -----------------------------------------------------------------------
	let draggedId = $state<string | null>(null);
	let dropOverId = $state<string | null>(null);
	let dropPosition = $state<'before' | 'after' | 'inside' | null>(null);

	function handleDragStart(e: DragEvent, itemId: string) {
		draggedId = itemId;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	/**
	 * 마우스 Y 위치로 before / after / inside 자동 판단
	 * - 폴더이고 중간 30~70% 구간이면 inside
	 * - 그 외 상단 50% 미만이면 before, 이상이면 after
	 */
	function handleDragOver(e: DragEvent, itemId: string) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}

		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const ratio = (e.clientY - rect.top) / rect.height;

		// flatTree에서 해당 아이템의 타입 조회
		const targetFlatItem = flatTree.find((f) => f.item.id === itemId);
		const isFolder = targetFlatItem?.item.type === 'folder';

		let pos: 'before' | 'after' | 'inside';
		if (isFolder && ratio > 0.3 && ratio < 0.7) {
			pos = 'inside';
		} else if (ratio < 0.5) {
			pos = 'before';
		} else {
			pos = 'after';
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

	/**
	 * draggedId를 리셋하기 전에 캡처한 뒤 실제 drop 로직 처리
	 */
	async function handleDropWithSource(
		e: DragEvent,
		targetId: string,
		targetParentId: string | null,
		sourceDraggedId: string,
		currentDropPosition: 'before' | 'after' | 'inside'
	) {
		if (sourceDraggedId === targetId) return;

		// ── inside drop: 폴더 안으로 이동 ──────────────────────────────────
		if (currentDropPosition === 'inside') {
			function isDescendant(parentId: string, childId: string): boolean {
				const children = data.flatMenus.filter((m: MenuTreeNode) => m.parentId === parentId);
				for (const child of children) {
					if (child.id === childId) return true;
					if (isDescendant(child.id, childId)) return true;
				}
				return false;
			}
			if (isDescendant(sourceDraggedId, targetId)) return;

			const targetChildren = data.flatMenus
				.filter((m: MenuTreeNode) => m.parentId === targetId)
				.sort((a: MenuTreeNode, b: MenuTreeNode) => a.sort_order - b.sort_order);

			const updates = targetChildren
				.filter((item: MenuTreeNode) => item.id !== sourceDraggedId)
				.map((item: MenuTreeNode, i: number) => ({
					id: item.id,
					parentId: targetId,
					sort_order: i
				}));

			updates.push({
				id: sourceDraggedId,
				parentId: targetId,
				sort_order: updates.length
			});

			const fd = new FormData();
			fd.append('updates', JSON.stringify(updates));
			const response = await fetch('?/reorderMenu', { method: 'POST', body: fd });
			if (response.ok) window.location.reload();
			return;
		}

		// ── before / after: 같은 레벨 순서 변경 ───────────────────────────
		// 드래그된 아이템의 현재 parentId 조회
		const draggedFlatItem = flatTree.find((f) => f.item.id === sourceDraggedId);
		const draggedParentId = draggedFlatItem?.item.parentId ?? null;

		// 같은 부모 레벨의 형제들
		const siblings = data.flatMenus
			.filter((m: MenuTreeNode) => (m.parentId ?? null) === (targetParentId ?? null))
			.sort((a: MenuTreeNode, b: MenuTreeNode) => a.sort_order - b.sort_order);

		const draggedIdx = siblings.findIndex((m: MenuTreeNode) => m.id === sourceDraggedId);
		const targetIdx = siblings.findIndex((m: MenuTreeNode) => m.id === targetId);

		// 드래그 아이템이 형제 목록에 없으면 (다른 부모에서 온 경우) → 크로스 레벨 이동
		if (draggedIdx < 0) {
			// 드래그 아이템을 target 레벨(targetParentId)로 이동시키고 위치 조정
			const reordered = [...siblings];
			const insertAt = currentDropPosition === 'before' ? targetIdx : targetIdx + 1;

			// 기존 형제들의 새 순서
			const updates = reordered.map((item, i) => ({
				id: item.id,
				parentId: targetParentId,
				sort_order: i >= insertAt ? i + 1 : i
			}));

			// 드래그 아이템 삽입
			updates.push({
				id: sourceDraggedId,
				parentId: targetParentId,
				sort_order: insertAt
			});

			// sort_order 재정렬 (0, 1, 2, ... 연속하게)
			updates.sort((a, b) => a.sort_order - b.sort_order);
			const normalizedUpdates = updates.map((item, i) => ({ ...item, sort_order: i }));

			const fd = new FormData();
			fd.append('updates', JSON.stringify(normalizedUpdates));
			const response = await fetch('?/reorderMenu', { method: 'POST', body: fd });
			if (response.ok) window.location.reload();
			return;
		}

		// 같은 부모 내 순서 변경
		const reordered = siblings.filter((m: MenuTreeNode) => m.id !== sourceDraggedId);
		const draggedItem = siblings[draggedIdx];
		let insertAt = targetIdx;
		if (draggedIdx < targetIdx) {
			insertAt = targetIdx - 1;
		}
		if (currentDropPosition === 'after' && draggedIdx > targetIdx) {
			insertAt = targetIdx + 1;
		}
		reordered.splice(insertAt, 0, draggedItem);

		const updates = reordered.map((item, i) => ({
			id: item.id,
			parentId: item.parentId ?? null,
			sort_order: i
		}));

		const fd = new FormData();
		fd.append('updates', JSON.stringify(updates));
		const response = await fetch('?/reorderMenu', { method: 'POST', body: fd });
		if (response.ok) window.location.reload();
	}

	function handleDragEnd() {
		draggedId = null;
		dropOverId = null;
		dropPosition = null;
	}

	// -----------------------------------------------------------------------
	// 통합 drag 이벤트 핸들러 (draggedId를 리셋 전에 캡처)
	// -----------------------------------------------------------------------
	async function onDrop(e: DragEvent, targetId: string, targetParentId: string | null) {
		e.preventDefault();
		if (!draggedId || !dropPosition) {
			draggedId = null;
			dropOverId = null;
			dropPosition = null;
			return;
		}

		const sourceDraggedId = draggedId;
		const currentDropPosition = dropPosition;

		draggedId = null;
		dropOverId = null;
		dropPosition = null;

		await handleDropWithSource(e, targetId, targetParentId, sourceDraggedId, currentDropPosition);
	}

	// -----------------------------------------------------------------------
	// Type / badge helpers
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

	// 드롭 인디케이터 클래스
	function rowClasses(itemId: string, type: 'folder' | 'link'): string {
		const base =
			'group relative flex items-center gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/50';
		const isDragging = draggedId === itemId ? ' opacity-50' : '';
		const isDropInside =
			type === 'folder' && dropOverId === itemId && dropPosition === 'inside'
				? ' bg-primary/10 border-primary/50'
				: '';
		return `${base}${isDragging}${isDropInside}`;
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
				<!-- ── 드롭 인디케이터: before ── -->
				{#if dropOverId === item.id && dropPosition === 'before'}
					<div
						class="pointer-events-none mx-2 h-0.5 rounded-full bg-primary"
						style="margin-left: calc({depth * 1.5}rem + 0.5rem)"
					></div>
				{/if}

				<div
					class={rowClasses(item.id, item.type)}
					style="margin-left: {depth * 1.5}rem"
					draggable={true}
					role="listitem"
					ondragstart={(e) => handleDragStart(e, item.id)}
					ondragend={handleDragEnd}
					ondragover={(e) => handleDragOver(e, item.id)}
					ondragleave={handleDragLeave}
					ondrop={(e) => onDrop(e, item.id, item.parentId ?? null)}
				>
					<!-- Drag handle -->
					<div
						class="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100"
						role="none"
					>
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
				</div>

				<!-- ── 드롭 인디케이터: after ── -->
				{#if dropOverId === item.id && dropPosition === 'after'}
					<div
						class="pointer-events-none mx-2 h-0.5 rounded-full bg-primary"
						style="margin-left: calc({depth * 1.5}rem + 0.5rem)"
					></div>
				{/if}
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
				{#if editMode && editItemId}
					<input type="hidden" name="id" value={editItemId} />
				{/if}

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
					<Input
						id="sort_order"
						name="sort_order"
						type="number"
						min="0"
						bind:value={formSortOrder}
					/>
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
							{#key JSON.stringify(parentOptions.map((p) => p.id))}
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