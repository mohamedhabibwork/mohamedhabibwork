<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
		class?: string;
		glow?: boolean;
		hover?: boolean;
		style?: string;
	}

	const {
		class: className = "",
		hover = true,
		style = "",
		glow = false,
		children,
	}: Props = $props();

	const classes = $derived(
		[
			"rounded-xl border bg-card text-card-foreground theme-transition",
			hover && "card-lift cursor-pointer",
			glow && "glow-hover",
			className,
		]
			.filter(Boolean)
			.join(" ")
	);
</script>

<div
	class={classes}
	style="border-color: var(--border); {style}"
	role="article"
	onmouseenter={(e) => {
		if (hover) {
			e.currentTarget.style.borderColor = "var(--ring)";
		}
	}}
	onmouseleave={(e) => {
		if (hover) {
			e.currentTarget.style.borderColor = "var(--border)";
		}
	}}
>
	{@render children()}
</div>
