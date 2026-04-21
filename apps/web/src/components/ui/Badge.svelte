<script lang="ts">
	import type { Snippet } from "svelte";

	type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

	interface Props {
		children: Snippet;
		class?: string;
		variant?: BadgeVariant;
	}

	const {
		variant = "default",
		class: className = "",
		children,
	}: Props = $props();

	const variantClasses: Record<BadgeVariant, string> = {
		default:
			"bg-neutral-200 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
		success:
			"bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400 dark:border-emerald-700/50",
		warning:
			"bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-400 dark:border-amber-700/50",
		error:
			"bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-700/50",
		info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-400 dark:border-blue-700/50",
	};

	const classes = $derived(
		[
			"inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border",
			variantClasses[variant],
			className,
		]
			.filter(Boolean)
			.join(" ")
	);
</script>

<span class={classes}> {@render children()} </span>
