<script lang="ts">
	import Footer from "../../components/Footer.svelte";
	import SEO from "../../components/SEO.svelte";
	import Button from "../../components/ui/Button.svelte";
	import Card from "../../components/ui/Card.svelte";
	import Section from "../../components/ui/Section.svelte";
	import { useContactMutation } from "../../lib/queries";
	import type { PageData } from "./$types";

	const { data }: { data: PageData } = $props();

	const profile = $derived(
		data.profile ?? {
			name: "Mohamed Habib",
			email: "",
			whatsapp: "",
			linkedin: "",
			location: "Egypt",
			timezone: "",
			availability: "",
			bio: "",
			github: "",
			tagline: "",
			title: "Senior Full Stack Developer & Team Leader",
			stats: { years: 7, projects: 50, industries: 5, successRate: 95 },
		}
	);

	// biome-ignore lint/correctness/useHookAtTopLevel: Svelte component top-level is valid for hooks
	const contactMutation = useContactMutation();

	let formState = $state({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	let status = $state<"idle" | "submitting" | "success" | "error">("idle");
	let statusMessage = $state("");

	async function handleSubmit(e: Event) {
		e.preventDefault();
		status = "submitting";
		statusMessage = "";

		try {
			const result = await $contactMutation.mutateAsync(formState);

			if (result.success) {
				status = "success";
				statusMessage = result.message;
				formState = { name: "", email: "", subject: "", message: "" };
			} else {
				throw new Error("Failed to send message");
			}
		} catch (err) {
			status = "error";
			statusMessage =
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.";
		}
	}
</script>

<SEO
	title="Contact {profile.name} - Full Stack Developer & Team Leader"
	description="Get in touch with {profile.name} for project inquiries, collaborations, or job opportunities. Available for freelance and full-time positions."
	canonical="/contact"
	ogType="website"
/>

<main class="min-h-screen">
	<div class="pt-16 pb-8 px-4 sm:px-6 lg:px-8">
		<div class="max-w-4xl mx-auto text-center">
			<h1 class="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
				Get in Touch
			</h1>
			<p class="text-xl text-muted-foreground">
				Ready to discuss your next project or collaboration opportunity?
			</p>
		</div>
	</div>

	<Section class="py-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
			<div>
				<h2 class="text-2xl font-bold mb-6 text-foreground">Send a Message</h2>

				{#if status === "success"}
					<Card class="p-6 border-green-500/50 bg-green-500/10">
						<div class="flex items-start gap-4">
							<svg
								class="w-6 h-6 flex-shrink-0 mt-0.5 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								role="img"
								aria-label="Success checkmark"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<div>
								<h3 class="text-lg font-semibold mb-1 text-green-500">
									Message Sent!
								</h3>
								<p class="text-muted-foreground">{statusMessage}</p>
							</div>
						</div>
					</Card>
				{:else if status === "error"}
					<Card class="p-6 border-red-500/50 bg-red-500/10">
						<div class="flex items-start gap-4">
							<svg
								class="w-6 h-6 flex-shrink-0 mt-0.5 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								role="img"
								aria-label="Error X mark"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
							<div>
								<h3 class="text-lg font-semibold mb-1 text-red-500">Error</h3>
								<p class="text-muted-foreground">{statusMessage}</p>
							</div>
						</div>
					</Card>
				{/if}

				<form onsubmit={handleSubmit} class="space-y-6 mt-6">
					<div>
						<label
							for="name"
							class="block text-sm font-medium mb-2 text-muted-foreground"
							>Name</label
						>
						<input
							type="text"
							id="name"
							bind:value={formState.name}
							required
							minlength="2"
							class="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground border border-border"
							placeholder="Your name"
						>
					</div>

					<div>
						<label
							for="email"
							class="block text-sm font-medium mb-2 text-muted-foreground"
							>Email</label
						>
						<input
							type="email"
							id="email"
							bind:value={formState.email}
							required
							class="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground border border-border"
							placeholder="you@example.com"
						>
					</div>

					<div>
						<label
							for="subject"
							class="block text-sm font-medium mb-2 text-muted-foreground"
							>Subject</label
						>
						<input
							type="text"
							id="subject"
							bind:value={formState.subject}
							required
							minlength="5"
							class="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-card text-foreground border border-border"
							placeholder="Project inquiry"
						>
					</div>

					<div>
						<label
							for="message"
							class="block text-sm font-medium mb-2 text-muted-foreground"
							>Message</label
						>
						<textarea
							id="message"
							bind:value={formState.message}
							required
							minlength="20"
							rows="5"
							class="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-card text-foreground border border-border"
							placeholder="Tell me about your project..."
						></textarea>
					</div>

					<Button
						type="submit"
						size="lg"
						disabled={status === "submitting"}
						class="w-full"
					>
						{status === "submitting" ? "Sending..." : "Send Message"}
					</Button>
				</form>
			</div>

			<div class="space-y-8">
				<div>
					<h2 class="text-2xl font-bold mb-6 text-foreground">
						Direct Contact
					</h2>
					<div class="space-y-4">
						<Card class="p-6">
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/15"
								>
									<svg
										class="w-6 h-6 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										role="img"
										aria-label="Email icon"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<div>
									<h3 class="font-semibold text-foreground">Email</h3>
									<a
										href="mailto:{profile.email}"
										class="transition-colors hover:opacity-80 text-primary"
									>
										{profile.email}
									</a>
								</div>
							</div>
						</Card>

						<Card class="p-6">
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500/15"
								>
									<svg
										class="w-6 h-6 text-green-500"
										fill="currentColor"
										viewBox="0 0 24 24"
										role="img"
										aria-label="WhatsApp icon"
									>
										<path
											d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
										/>
									</svg>
								</div>
								<div>
									<h3 class="font-semibold text-foreground">WhatsApp</h3>
									<a
										href={`https://wa.me/${(profile.whatsapp?.toString())?.replace('+','')}`}
										target="_blank"
										rel="noopener noreferrer"
										class="transition-colors hover:opacity-80 text-primary"
									>
										{profile.whatsapp}
									</a>
								</div>
							</div>
						</Card>

						<Card class="p-6">
							<div class="flex items-center gap-4">
								<div
									class="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-500/15"
								>
									<svg
										class="w-6 h-6 text-purple-500"
										fill="currentColor"
										viewBox="0 0 24 24"
										role="img"
										aria-label="LinkedIn icon"
									>
										<path
											d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
										/>
									</svg>
								</div>
								<div>
									<h3 class="font-semibold text-foreground">LinkedIn</h3>
									<a
										href={profile.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										class="transition-colors hover:opacity-80 text-primary"
									>
										Connect with me
									</a>
								</div>
							</div>
						</Card>
					</div>
				</div>

				<div>
					<h3 class="text-lg font-semibold mb-4 text-foreground">
						Availability
					</h3>
					<Card class="p-6 border-green-500/30 bg-green-500/5">
						<div class="flex items-center gap-3">
							<span
								class="w-3 h-3 rounded-full animate-pulse bg-green-500"
							></span>
							<span class="font-medium text-green-500">Available for hire</span>
						</div>
						<p class="text-sm mt-2 text-muted-foreground">
							{profile?.location}
							• {profile.timezone}
						</p>
					</Card>
				</div>

				<div>
					<h3 class="text-lg font-semibold mb-4 text-foreground">
						Response Time
					</h3>
					<p class="text-muted-foreground">
						Usually within 24 hours. For urgent matters, WhatsApp is the fastest
						way to reach me.
					</p>
				</div>
			</div>
		</div>
	</Section>

	<Footer {profile} />
</main>
