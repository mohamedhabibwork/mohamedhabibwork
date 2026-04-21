<script lang="ts">
	import { QueryClientProvider } from "@tanstack/svelte-query";
	import { onMount } from "svelte";
	import "../app.css";
	import { queryClient } from "$lib/orpc";
	import { theme } from "$lib/stores/theme.svelte";
	import Header from "../components/Header.svelte";

	const { children } = $props();

	onMount(() => {
		theme.init();
	});
</script>

<QueryClientProvider client={queryClient}>
	<div class="grid h-svh grid-rows-[auto_1fr]">
		<Header />
		<main class="overflow-y-auto">{@render children()}</main>
	</div>
</QueryClientProvider>
