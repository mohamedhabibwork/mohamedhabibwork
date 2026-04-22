<script lang="ts">
	import type { Snippet } from "svelte";
	import { browser } from "$app/environment";

	interface Props {
		animation?: "slide-up" | "slide-in-left" | "scale-in" | "fade-in";
		children: Snippet;
		class?: string;
		delay?: number;
	}

	const {
		children,
		class: className = "",
		delay = 0,
		animation = "slide-up",
	}: Props = $props();

	let element = $state<HTMLDivElement | null>(null);
	let isVisible = $state(false);

	const animationClass = $derived(() => {
		switch (animation) {
			case "slide-up":
				return "animate-slide-up";
			case "slide-in-left":
				return "animate-slide-in-left";
			case "scale-in":
				return "animate-scale-in";
			case "fade-in":
				return "animate-fade-in";
			default:
				return "animate-slide-up";
		}
	});

	$effect(() => {
		if (!(browser && element)) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setTimeout(() => {
							isVisible = true;
						}, delay);
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
		);

		observer.observe(element);

		return () => observer.disconnect();
	});
</script>

<div
	bind:this={element}
	class={className}
	style="opacity: {isVisible ? 1 : 0}; transform: {isVisible
		? 'translateY(0)'
		: 'translateY(24px)'}; transition: opacity 0.6s ease, transform 0.6s ease;"
>
	{@render children()}
</div>
