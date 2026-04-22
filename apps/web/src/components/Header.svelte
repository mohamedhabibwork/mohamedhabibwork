<script lang="ts">
	import { page } from "$app/stores";
	import ThemeToggle from "./ui/ThemeToggle.svelte";

	const navLinks = [
		{ href: "/", label: "Home" },
		{ href: "/about", label: "About" },
		{ href: "/projects", label: "Projects" },
		{ href: "/resume", label: "Resume" },
		{ href: "/contact", label: "Contact" },
	];

	const currentPath = $derived($page.url.pathname);

	function getNavLinkClasses(href: string): string {
		const isActive = currentPath === href;
		const base =
			"px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";
		if (isActive) {
			return `${base} bg-primary text-primary-foreground shadow-md`;
		}
		return `${base} text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`;
	}
</script>

<header class="sticky top-0 z-50 backdrop-blur-lg border-b bg-background/85">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<nav class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a
				href="/"
				class="flex items-center gap-2 transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg px-2 py-1 -ml-2"
				aria-label="Mohammad Habib - Home"
			>
				<img
					src="/logo.png"
					alt="Mohammad Habib logo"
					width="36"
					height="36"
					class="rounded-md"
					loading="eager"
				>
				<span class="text-xl font-bold hidden sm:inline text-foreground">
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
				<ThemeToggle />

				<!-- CTA Button -->
				<a
					href="/contact"
					class="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground"
				>
					Hire Me
				</a>

				<!-- Mobile Menu Button -->
				<button
					type="button"
					class="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200"
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
