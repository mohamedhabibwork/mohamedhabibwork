<script lang="ts">
	interface ArticleMeta {
		author?: string;
		modifiedTime?: string;
		publishedTime?: string;
		section?: string;
		tags?: string[];
	}

	interface Props {
		articleMeta?: ArticleMeta;
		canonical?: string;
		description: string;
		jsonLd?: Record<string, unknown>;
		noindex?: boolean;
		ogImage?: string;
		ogImageAlt?: string;
		ogType?: "website" | "article" | "profile";
		title: string;
		twitterCard?: "summary" | "summary_large_image";
	}

	const {
		title,
		description,
		canonical = "",
		ogImage = "https://mohamedhabib.work/logo.png",
		ogImageAlt = "Mohammad Habib - Senior Full Stack Developer",
		ogType = "website",
		twitterCard = "summary_large_image",
		noindex = false,
		jsonLd,
		articleMeta,
	}: Props = $props();

	const siteUrl = "https://mohamedhabib.work";
	const fullCanonical = $derived(
		canonical ? `${siteUrl}${canonical}` : siteUrl
	);
	const fullOgImage = $derived(
		ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`
	);
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{title}</title>
	<meta name="title" content={title}>
	<meta name="description" content={description}>

	<!-- Canonical URL -->
	<link rel="canonical" href={fullCanonical}>

	<!-- Robots -->
	{#if noindex}
		<meta name="robots" content="noindex, nofollow">
	{:else}
		<meta
			name="robots"
			content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
		>
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType}>
	<meta property="og:url" content={fullCanonical}>
	<meta property="og:title" content={title}>
	<meta property="og:description" content={description}>
	<meta property="og:image" content={fullOgImage}>
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:image:alt" content={ogImageAlt}>
	<meta property="og:locale" content="en_US">
	<meta property="og:site_name" content="Mohammad Habib">

	<!-- Article-specific OG tags -->
	{#if ogType === "article" && articleMeta}
		{#if articleMeta.author}
			<meta property="article:author" content={articleMeta.author}>
		{/if}
		{#if articleMeta.publishedTime}
			<meta
				property="article:published_time"
				content={articleMeta.publishedTime}
			>
		{/if}
		{#if articleMeta.modifiedTime}
			<meta property="article:modified_time" content={articleMeta.modifiedTime}>
		{/if}
		{#if articleMeta.section}
			<meta property="article:section" content={articleMeta.section}>
		{/if}
		{#if articleMeta.tags}
			{#each articleMeta.tags as tag}
				<meta property="article:tag" content={tag}>
			{/each}
		{/if}
	{/if}

	<!-- Twitter -->
	<meta property="twitter:card" content={twitterCard}>
	<meta property="twitter:url" content={fullCanonical}>
	<meta property="twitter:title" content={title}>
	<meta property="twitter:description" content={description}>
	<meta property="twitter:image" content={fullOgImage}>
	<meta property="twitter:image:alt" content={ogImageAlt}>
	<meta property="twitter:creator" content="@mohamedhabib">
	<meta property="twitter:site" content="@mohamedhabib">

	<!-- JSON-LD Structured Data -->
	{#if jsonLd}
		{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
	{/if}
</svelte:head>
