<script lang="ts">
	import type { Snippet } from "svelte";

	type Variant = "primary" | "secondary" | "ghost";
	type Size = "sm" | "md" | "lg";

	interface Props {
		children: Snippet;
		class?: string;
		disabled?: boolean;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		size?: Size;
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
	}: Props = $props();

	const baseClasses =
		"inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const variantClasses: Record<Variant, string> = {
		primary:
			"bg-blue-600 hover:bg-blue-500 focus:ring-blue-500 shadow-lg shadow-blue-600/20 dark:bg-blue-600 dark:hover:bg-blue-500",
		secondary: "border-2 focus:ring-neutral-400",
		ghost: "focus:ring-neutral-400",
	};

	const sizeClasses: Record<Size, string> = {
		sm: "px-3 py-1.5 text-sm gap-1.5",
		md: "px-5 py-2.5 text-base gap-2",
		lg: "px-7 py-3.5 text-lg gap-2.5",
	};

	const classes = $derived(
		[baseClasses, variantClasses[variant], sizeClasses[size], className]
			.filter(Boolean)
			.join(" ")
	);

	function getButtonStyle(variant: Variant): string {
		switch (variant) {
			case "primary":
				return "color: #ffffff;";
			case "secondary":
				return "color: var(--text-primary); border-color: var(--text-secondary);";
			case "ghost":
				return "color: var(--text-secondary);";
			default:
				return "";
		}
	}

	function getHoverStyle(variant: Variant): string {
		switch (variant) {
			case "secondary":
				return "background-color: var(--bg-secondary); border-color: var(--text-primary); color: var(--text-primary);";
			case "ghost":
				return "background-color: var(--bg-secondary); color: var(--text-primary);";
			default:
				return "";
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if href && !disabled}
	<a
		{href}
		class={classes}
		role="button"
		style={getButtonStyle(variant)}
		onmouseenter={(e) => {
			if (variant !== "primary") {
				e.currentTarget.style.cssText = getHoverStyle(variant);
			}
		}}
		onmouseleave={(e) => {
			if (variant !== "primary") {
				e.currentTarget.style.cssText = getButtonStyle(variant);
			}
		}}
	>
		{@render children()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={classes}
		{onclick}
		style={getButtonStyle(variant)}
		onmouseenter={(e) => {
			if (variant !== "primary") {
				e.currentTarget.style.cssText = getHoverStyle(variant);
			}
		}}
		onmouseleave={(e) => {
			if (variant !== "primary") {
				e.currentTarget.style.cssText = getButtonStyle(variant);
			}
		}}
	>
		{@render children()}
	</button>
{/if}
