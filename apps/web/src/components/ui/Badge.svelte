<script lang="ts">
	import type { Snippet } from "svelte";

	type BadgeVariant =
		| "default"
		| "success"
		| "warning"
		| "error"
		| "info"
		| "outline";

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
			"bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30",
		success:
			"bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
		warning:
			"bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
		error:
			"bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
		info: "bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30",
		outline: "bg-transparent text-foreground border-border hover:bg-secondary",
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

<span class={classes}>{@render children()}</span>
