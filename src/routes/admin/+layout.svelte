<script lang="ts">
	import * as m from '$lib/paraglide/messages';

	let { children } = $props();
</script>

<div class="mx-auto max-w-7xl p-6">
	<header class="mb-8">
		<h1 class="text-3xl font-bold">{m.admin_title()}</h1>
	</header>
	{@render children()}
</div>
