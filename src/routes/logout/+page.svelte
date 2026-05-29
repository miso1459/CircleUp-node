<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";

	onMount(() => {
		fetch("/logout", { method: "POST" }).then(() => {
			goto("/");
		});
	});
</script>

<p class="p-4 text-center text-muted-foreground">Signing out...</p>