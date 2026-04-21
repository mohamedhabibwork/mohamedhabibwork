<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
		class?: string;
		id?: string;
	}

	const { id, class: className = "", children }: Props = $props();

	const classes = $derived(
		["max-w-6xl mx-auto px-4 sm:px-6 lg:px-8", className]
			.filter(Boolean)
			.join(" ")
	);
</script>

<section {id} class={classes}>{@render children()}</section>
