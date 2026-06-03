<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { Markdown } from '@tiptap/markdown';
	import { Button } from '$lib/components/ui/button';
	import {
		Bold,
		Italic,
		Heading1,
		Heading2,
		List,
		ListOrdered,
		Code,
		Minus
	} from 'lucide-svelte';

	interface Props {
		content?: string;
	}

	let { content = '' }: Props = $props();

	let element: HTMLDivElement;
	let editor = $state<Editor | null>(null);

	export function setContent(newContent: string): void {
		if (editor) {
			editor.commands.setContent(newContent, { contentType: 'markdown' });
		}
	}

	export function getMarkdown(): string {
		return editor?.getMarkdown() ?? '';
	}

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [1, 2]
					}
				}),
				Markdown.configure({
					markedOptions: {
						gfm: true,
						breaks: true
					}
				})
			],
			content: content || '',
			contentType: 'markdown',
			onTransaction: ({ editor: newEditor }) => {
				editor = newEditor;
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div class="tiptap-editor">
	{#if editor}
		<div class="toolbar border-border bg-muted/50 flex flex-wrap gap-1 rounded-t-lg border-b p-1">
			<Button
				variant={editor.isActive('bold') ? 'default' : 'ghost'}
				size="icon-sm"
				onclick={() => editor!.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
			>
				<Bold class="size-4" />
			</Button>

			<Button
				variant={editor.isActive('italic') ? 'default' : 'ghost'}
				size="icon-sm"
				onclick={() => editor!.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
			>
				<Italic class="size-4" />
			</Button>

			<Button
				variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
				size="icon-sm"
				onclick={() => editor!.chain().focus().toggleHeading({ level: 1 }).run()}
			>
				<Heading1 class="size-4" />
			</Button>

			<Button
				variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
				size="icon-sm"
				onclick={() => editor!.chain().focus().toggleHeading({ level: 2 }).run()}
			>
				<Heading2 class="size-4" />
			</Button>

			<Button
				variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
				size="icon-sm"
				onclick={() => editor!.chain().focus().toggleBulletList().run()}
			>
				<List class="size-4" />
			</Button>

			<Button
				variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
				size="icon-sm"
				onclick={() => editor!.chain().focus().toggleOrderedList().run()}
			>
				<ListOrdered class="size-4" />
			</Button>

			<Button
				variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
				size="icon-sm"
				onclick={() => editor!.chain().focus().toggleCodeBlock().run()}
			>
				<Code class="size-4" />
			</Button>

			<Button
				variant="ghost"
				size="icon-sm"
				onclick={() => editor!.chain().focus().setHorizontalRule().run()}
			>
				<Minus class="size-4" />
			</Button>

		</div>
	{/if}

	<div bind:this={element} class="editor-content min-h-[300px] rounded-b-lg"></div>
</div>

<style>
	.tiptap-editor {
		border: 1px solid var(--border, hsl(var(--border)));
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.editor-content {
		padding: 1rem;
	}

	.editor-content :global(.tiptap) {
		outline: none;
	}

	.editor-content :global(.tiptap h1) {
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.editor-content :global(.tiptap h2) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.editor-content :global(.tiptap p) {
		margin-bottom: 0.5rem;
	}

	.editor-content :global(.tiptap ul),
	.editor-content :global(.tiptap ol) {
		padding-left: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.editor-content :global(.tiptap ul) {
		list-style-type: disc;
	}

	.editor-content :global(.tiptap ol) {
		list-style-type: decimal;
	}

	.editor-content :global(.tiptap pre) {
		background: hsl(var(--muted));
		border-radius: 0.375rem;
		padding: 0.75rem;
		overflow-x: auto;
		margin-bottom: 0.5rem;
	}

	.editor-content :global(.tiptap code) {
		font-family: monospace;
		font-size: 0.875rem;
	}

	.editor-content :global(.tiptap hr) {
		border: none;
		border-top: 1px solid var(--border, hsl(var(--border)));
		margin: 1rem 0;
	}
</style>
