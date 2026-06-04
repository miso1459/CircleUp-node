<script lang="ts">
	let { children } = $props();

	// Lock scroll on this route — table scrolls internally
	$effect(() => {
		const html = document.documentElement;
		const body = document.body;
		const main = document.querySelector('main');

		const prevHtml = html.style.overflow;
		const prevBody = body.style.overflow;
		const prevMain = main?.style.overflow ?? '';

		html.style.overflow = 'hidden';
		body.style.overflow = 'hidden';
		if (main) main.style.overflow = 'hidden';

		return () => {
			html.style.overflow = prevHtml;
			body.style.overflow = prevBody;
			if (main) main.style.overflow = prevMain;
		};
	});
</script>

<div class="flex h-full flex-col overflow-hidden">
	{@render children()}
</div>
