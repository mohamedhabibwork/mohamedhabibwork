<script lang="ts">
	import { onMount } from "svelte";
	import { queryClient } from "$lib/orpc";

	interface QueryErrorEvent {
		error: Error;
		queryKey: unknown[];
	}

	let errors = $state<QueryErrorEvent[]>([]);
	let isVisible = $state(false);
	let currentError = $state<QueryErrorEvent | null>(null);
	let isDismissing = $state(false);

	function showError(errorInfo: QueryErrorEvent) {
		errors = [...errors, errorInfo];
		if (!isVisible) {
			processNextError();
		}
	}

	function processNextError() {
		if (errors.length === 0) {
			isVisible = false;
			currentError = null;
			return;
		}

		currentError = errors[0];
		isVisible = true;
		isDismissing = false;
	}

	function dismiss() {
		if (isDismissing) {
			return;
		}
		isDismissing = true;

		setTimeout(() => {
			errors = errors.slice(1);
			isVisible = false;
			setTimeout(() => {
				processNextError();
			}, 150);
		}, 200);
	}

	function handleRetry() {
		if (currentError?.queryKey) {
			queryClient.invalidateQueries({ queryKey: currentError.queryKey });
		}
		dismiss();
	}

	onMount(() => {
		const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
			if (event.type === "updated" && event.query?.state.status === "error") {
				const error = event.query.state.error as Error | null;
				if (error) {
					showError({
						error,
						queryKey: event.query.queryKey,
					});
				}
			}
		});

		return unsubscribe;
	});
</script>

{#if isVisible && currentError}
	<div
		class="pointer-events-auto fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border shadow-lg transition-all duration-200 bg-card border-border"
		class:opacity-0={isDismissing}
		class:translate-y-2={isDismissing}
		role="alert"
		aria-live="assertive"
	>
		<div class="flex items-start gap-3 p-4">
			<div class="flex-shrink-0 text-2xl">⚠️</div>
			<div class="flex-1 min-w-0">
				<h3 class="text-sm font-semibold text-foreground">Server Error</h3>
				<p class="mt-1 text-sm text-muted-foreground">
					{currentError.error.message || "An unexpected error occurred"}
				</p>
			</div>
			<button
				type="button"
				class="flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-muted text-muted-foreground"
				onclick={dismiss}
				aria-label="Dismiss"
			>
				<svg
					class="h-4 w-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
		<div class="flex gap-2 border-t border-border px-4 py-3">
			<button
				type="button"
				class="flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors bg-secondary text-secondary-foreground"
				onclick={handleRetry}
			>
				Retry
			</button>
			<button
				type="button"
				class="flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors text-muted-foreground"
				onclick={dismiss}
			>
				Dismiss
			</button>
		</div>
	</div>
{/if}
