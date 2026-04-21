<script lang="ts">
	import { page } from "$app/stores";
	import { theme } from "$lib/stores/theme.svelte";

	const navLinks = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/projects", label: "Projects" },
		{ href: "/contact", label: "Contact" },
	];

	const currentPath = $derived($page.url.pathname);

	function getNavLinkClasses(href: string): string {
		const isActive = currentPath === href;
		const base =
			"px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
		if (isActive) {
			return `${base} bg-blue-600 text-white shadow-md shadow-blue-600/20`;
		}
		return `${base} text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`;
	}

	function getIconButtonClasses(): string {
		return "p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";
	}
</script>

<header
	class="sticky top-0 z-50 backdrop-blur-lg border-b"
	style="background-color: rgba(var(--bg-primary-rgb), 0.85); border-color: var(--border-color);"
>
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<nav class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a
				href="/"
				class="flex items-center gap-2 transition-all duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded-lg px-2 py-1 -ml-2"
				aria-label="Mohammad Habib - Home"
			>
				<img
					src="/logo.png"
					alt="Mohammad Habib logo, an MH monogram with code brackets and circuit lines"
					width="36"
					height="36"
					class="rounded-md"
					loading="eager"
				/>
				<span class="text-xl font-bold hidden sm:inline" style="color: var(--text-primary);">
					MH
				</span>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden sm:flex items-center gap-1">
				{#each navLinks as link}
					<a
						href={link.href}
						class={getNavLinkClasses(link.href)}
						aria-current={currentPath === link.href ? "page" : undefined}
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Right Side Actions -->
			<div class="flex items-center gap-2">
				<!-- Theme Toggle -->
				<button
					type="button"
					onclick={() => theme.toggle()}
					class={getIconButtonClasses()}
					aria-label="Toggle theme"
					title="Toggle theme"
				>
					{#if theme.current === "dark"}
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							role="img"
							aria-label="Sun icon"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					{:else}
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							role="img"
							aria-label="Moon icon"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{/if}
				</button>

				<!-- CTA Button -->
				<a
					href="/contact"
					class="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-blue-600/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
					style="background-color: var(--accent); color: #ffffff;"
				>
					Hire Me
				</a>

				<!-- Mobile Menu Button -->
				<button
					type="button"
					class="sm:hidden {getIconButtonClasses()}"
					aria-label="Menu"
					aria-expanded="false"
					title="Menu"
				>
					<svg
						class="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						role="img"
						aria-label="Menu icon"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</div>
		</nav>
	</div>
</header>
