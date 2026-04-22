<script lang="ts">
	import type { Snippet } from "svelte";
	import Button from "../ui/Button.svelte";

	interface Props {
		children?: Snippet;
		class?: string;
		description?: string;
		error?: Error | null;
		onBack?: () => void;
		onRetry?: () => void;
		showHome?: boolean;
		title?: string;
	}

	const {
		title = "Something went wrong",
		description = "An unexpected error occurred. Please try again.",
		error,
		onRetry,
		onBack,
		showHome = true,
		class: className = "",
		children,
	}: Props = $props();

	function handleBack() {
		if (onBack) {
			onBack();
		} else {
			window.history.back();
		}
	}

	const errorMessage = $derived(error?.message);
</script>

<div class="flex min-h-[400px] items-center justify-center p-4 {className}">
	<div class="max-w-sm rounded-xl border border-border bg-card p-6 text-center">
		<div class="mb-3 text-5xl">😕</div>
		<h2 class="mb-2 text-xl font-semibold text-foreground">{title}</h2>
		<p class="mb-4 text-sm text-muted-foreground">{description}</p>

		{#if errorMessage}
			<div
				class="mb-4 max-w-xs rounded-lg px-3 py-2 text-left text-xs bg-destructive/10 text-destructive"
			>
				{errorMessage}
			</div>
		{/if}

		{#if children}
			<div class="mb-4">{@render children()}</div>
		{/if}

		<div class="flex flex-wrap items-center justify-center gap-2">
			{#if onRetry}
				<Button variant="primary" onclick={onRetry}>Retry</Button>
			{/if}
			{#if onBack}
				<Button variant="secondary" onclick={handleBack}>Go Back</Button>
			{/if}
			{#if showHome}
				<Button variant="ghost" href="/">Home</Button>
			{/if}
		</div>
	</div>
</div>
