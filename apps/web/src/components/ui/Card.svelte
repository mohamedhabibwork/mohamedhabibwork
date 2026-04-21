<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		children: Snippet;
		class?: string;
		hover?: boolean;
		style?: string;
	}

	const {
		class: className = "",
		hover = true,
		style = "",
		children,
	}: Props = $props();

	const classes = $derived(
		[
			"rounded-xl border",
			hover && "transition-all duration-300 hover:-translate-y-0.5",
			className,
		]
			.filter(Boolean)
			.join(" ")
	);
</script>

<div
	class={classes}
	style="background-color: var(--card-bg); border-color: var(--border-color); {style}"
	role="article"
	onmouseenter={(e) => {
		if (hover) {
			e.currentTarget.style.borderColor = "var(--text-muted)";
		}
	}}
	onmouseleave={(e) => {
		if (hover) {
			e.currentTarget.style.borderColor = "var(--border-color)";
		}
	}}
>
	{@render children()}
</div>
