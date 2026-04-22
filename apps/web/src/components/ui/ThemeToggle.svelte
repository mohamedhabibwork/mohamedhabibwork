<script lang="ts">
	import { theme } from "$lib/stores/theme.svelte";

	interface Props {
		class?: string;
	}

	const { class: className = "" }: Props = $props();

	function handleToggle() {
		theme.toggle();
	}
</script>

<button
	type="button"
	onclick={handleToggle}
	class="relative inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-all duration-300 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring {className}"
	aria-label={theme.current === "dark" ? "Switch to light mode" : "Switch to dark mode"}
	title={theme.current === "dark" ? "Switch to light mode" : "Switch to dark mode"}
>
	<span class="sr-only">
		{theme.current === "dark" ? "Switch to light mode" : "Switch to dark mode"}
	</span>
	{#if theme.current === "dark"}
		<!-- Sun icon for dark mode (click to switch to light) -->
		<svg
			class="size-5 transition-transform duration-300 rotate-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			role="img"
			aria-label="Sun icon"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
			/>
		</svg>
	{:else}
		<!-- Moon icon for light mode (click to switch to dark) -->
		<svg
			class="size-5 transition-transform duration-300 rotate-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			role="img"
			aria-label="Moon icon"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
			/>
		</svg>
	{/if}
</button>
