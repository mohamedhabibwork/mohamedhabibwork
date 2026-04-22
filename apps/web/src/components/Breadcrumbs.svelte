<script lang="ts">
	interface BreadcrumbItem {
		name: string;
		url: string;
	}

	interface Props {
		items: BreadcrumbItem[];
	}

	const { items }: Props = $props();

	const breadcrumbSchema = $derived({
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: `https://mohamedhabib.work${item.url}`,
		})),
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<nav aria-label="Breadcrumb" class="text-sm text-muted-foreground">
	<ol class="flex items-center gap-2 flex-wrap">
		{#each items as item, index}
			<li class="flex items-center gap-2">
				{#if index > 0}
					<span class="text-muted-foreground/50">/</span>
				{/if}
				{#if index === items.length - 1}
					<span class="text-foreground font-medium" aria-current="page">
						{item.name}
					</span>
				{:else}
					<a href={item.url} class="hover:text-foreground transition-colors">
						{item.name}
					</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
