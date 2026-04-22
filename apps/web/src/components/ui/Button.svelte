<script lang="ts">
	import type { Snippet } from "svelte";

	type Variant = "primary" | "secondary" | "ghost" | "destructive";
	type Size = "sm" | "md" | "lg";

	interface Props {
		children: Snippet;
		class?: string;
		disabled?: boolean;
		href?: string | null;
		onclick?: (event: MouseEvent) => void;
		rel?: string;
		size?: Size;
		target?: string;
		type?: "button" | "submit" | "reset";
		variant?: Variant;
	}

	const {
		variant = "primary",
		size = "md",
		href,
		type = "button",
		disabled = false,
		class: className = "",
		children,
		onclick,
		rel,
		target,
	}: Props = $props();

	const baseClasses =
		"inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const variantClasses: Record<Variant, string> = {
		primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
		secondary:
			"bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
		ghost: "hover:bg-secondary hover:text-secondary-foreground",
		destructive:
			"bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
	};

	const sizeClasses: Record<Size, string> = {
		sm: "px-3 py-1.5 text-sm gap-1.5 h-8",
		md: "px-5 py-2.5 text-base gap-2 h-10",
		lg: "px-7 py-3.5 text-lg gap-2.5 h-12",
	};

	const classes = $derived(
		[baseClasses, variantClasses[variant], sizeClasses[size], className]
			.filter(Boolean)
			.join(" ")
	);
</script>

{#if href && !disabled}
	<a {href} {rel} {target} class={classes} role="button">
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} class={classes} {onclick}>
		{@render children()}
	</button>
{/if}
