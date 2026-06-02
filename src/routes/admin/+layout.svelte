<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	let { children } = $props();
</script>

<div>
	<header class="mb-8 border-b border-border/30 pb-6">
		<h1 class="text-3xl font-bold tracking-tight">{m.admin_title()}</h1>
	</header>
	{@render children()}
</div>
