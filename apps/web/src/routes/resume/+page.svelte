<script lang="ts">
	import Breadcrumbs from "../../components/Breadcrumbs.svelte";
	import SEO from "../../components/SEO.svelte";
	import type { PageData } from "./$types";

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let isGenerating = $state(false);

	async function downloadPDF() {
		isGenerating = true;

		try {
			const { jsPDF: PDF } = await import("jspdf");
			generatePDF(PDF);
		} finally {
			isGenerating = false;
		}
	}

	function generatePDF(doc: typeof import("jspdf").jsPDF) {
		const { profile, skills, experience } = data.resume;

		const pdf = new doc({
			orientation: "portrait",
			unit: "mm",
			format: "letter",
		});

		let y = 15;
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const margin = 15;
		const contentWidth = pageWidth - 2 * margin;

		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(22);
		pdf.setTextColor(0, 0, 0);
		pdf.text(profile.name.toUpperCase(), pageWidth / 2, y, {
			maxWidth: contentWidth,
		});

		y += 8;
		pdf.setFontSize(12);
		pdf.setFont("helvetica", "normal");
		pdf.text(profile.title, pageWidth / 2, y, { maxWidth: contentWidth });

		y += 6;
		pdf.setFontSize(9);
		const contactParts: string[] = [profile.email, profile?.location];
		if (profile.whatsapp) {
			contactParts.push(profile.whatsapp);
		}
		if (profile.linkedin) {
			contactParts.push(profile.linkedin);
		}
		if (profile.github) {
			contactParts.push(profile.github);
		}
		pdf.text(contactParts.join(" | "), pageWidth / 2, y, {
			maxWidth: contentWidth,
		});

		y += 3;
		pdf.setDrawColor(150, 150, 150);
		pdf.setLineWidth(0.3);
		pdf.line(margin, y, pageWidth - margin, y);

		y += 8;
		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(11);
		pdf.setTextColor(0, 0, 0);
		pdf.text("Professional Summary", margin, y);

		y += 5;
		pdf.setFont("helvetica", "normal");
		pdf.setFontSize(9);
		const bioLines = pdf.splitTextToSize(profile?.bio, contentWidth);
		pdf.text(bioLines, margin, y);
		y += bioLines.length * 4 + 4;

		y += 4;
		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(11);
		pdf.text("Technical Skills", margin, y);

		y += 5;
		pdf.setFont("helvetica", "normal");
		pdf.setFontSize(8.5);

		const skillCategories = [
			{ title: "Backend", items: skills.backend },
			{ title: "Frontend", items: skills.frontend },
			{ title: "Database", items: skills.database },
			{ title: "Cloud & DevOps", items: skills.cloud },
			{ title: "Leadership", items: skills.leadership },
		];

		for (const category of skillCategories) {
			if (category.items.length === 0) {
				continue;
			}

			if (y > pageHeight - 25) {
				pdf.addPage();
				y = 15;
			}

			pdf.setFont("helvetica", "bold");
			pdf.setFontSize(8.5);
			pdf.text(`${category.title}:`, margin, y);
			y += 3.5;

			pdf.setFont("helvetica", "normal");
			const skillNames = category.items.map((s) => s.name).join(", ");
			const skillLines = pdf.splitTextToSize(skillNames, contentWidth - 3);
			pdf.text(skillLines, margin + 2, y);
			y += skillLines.length * 3 + 2;
		}

		y += 4;
		pdf.setFont("helvetica", "bold");
		pdf.setFontSize(11);
		pdf.text("Professional Experience", margin, y);

		y += 5;
		pdf.setFont("helvetica", "normal");
		pdf.setFontSize(9);

		for (const exp of experience) {
			if (y > pageHeight - 35) {
				pdf.addPage();
				y = 15;
			}

			pdf.setFont("helvetica", "bold");
			pdf.text(exp.role, margin, y);

			pdf.setFont("helvetica", "normal");
			const periodWidth = pdf.getTextWidth(exp.period);
			pdf.text(exp.period, pageWidth - margin - periodWidth, y);

			y += 4;
			pdf.setFont("helvetica", "italic");
			pdf.text(exp.company, margin, y);
			y += 4;

			pdf.setFont("helvetica", "normal");
			const descLines = pdf.splitTextToSize(exp.description, contentWidth);
			pdf.text(descLines, margin, y);
			y += descLines.length * 3.5 + 2;

			if (exp.tech.length > 0) {
				pdf.setFont("helvetica", "italic");
				pdf.setFontSize(8);
				pdf.text(`Tech: ${exp.tech.join(", ")}`, margin, y);
				y += 4;
				pdf.setFontSize(9);
			}

			y += 3;
		}

		const safeName = data.resume.profile.name.replace(/[^a-zA-Z0-9]/g, "_");
		pdf.save(`${safeName}_Resume.pdf`);
	}
</script>

<SEO
	title="Resume - {data.resume.profile.name}"
	description="Professional resume of {data.resume.profile.name}, {data.resume.profile.title}. Download as PDF or view online."
	canonical="/resume"
	noindex={true}
	ogType="website"
/>

<main class="min-h-screen bg-background py-12 px-4">
	<div class="max-w-4xl mx-auto">
		<Breadcrumbs
			items={[
				{ name: "Home", url: "/" },
				{ name: "Resume", url: "" },
			]}
		/>
		<div class="flex justify-between items-center mb-8 mt-4">
			<div>
				<h1 class="text-3xl font-bold text-foreground">Resume</h1>
				<p class="text-muted-foreground mt-1">Download as PDF or view online</p>
			</div>
			<button
				type="button"
				onclick={downloadPDF}
				disabled={isGenerating}
				class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
			>
				{#if isGenerating}
					<svg
						class="animate-spin h-5 w-5"
						viewBox="0 0 24 24"
						fill="none"
						role="img"
						aria-label="Generating PDF"
					>
						<title>Generating PDF</title>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Generating...
				{:else}
					<svg
						class="w-5 h-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						role="img"
						aria-label="Download"
					>
						<title>Download PDF</title>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					Download PDF
				{/if}
			</button>
		</div>

		<div
			class="bg-card rounded-xl border shadow-sm p-8 print:shadow-none print:border-none"
		>
			<header class="text-center mb-8 pb-6 border-b">
				<h2 class="text-4xl font-bold text-foreground mb-2">
					{data.resume.profile.name}
				</h2>
				<p class="text-xl text-primary font-medium mb-3">
					{data.resume.profile.title}
				</p>
				<div
					class="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground"
				>
					<span>{data.resume.profile.email}</span>
					<span class="text-muted-foreground/50">|</span>
					<span>{data.resume.profile?.location}</span>
					{#if data.resume.profile.whatsapp}
						<span class="text-muted-foreground/50">|</span>
						<span>{data.resume.profile.whatsapp}</span>
					{/if}
				</div>
			</header>

			<section class="mb-8">
				<h3 class="text-lg font-bold text-foreground mb-3 pb-2 border-b">
					Professional Summary
				</h3>
				<p class="text-muted-foreground leading-relaxed">
					{data.resume.profile?.bio}
				</p>
			</section>

			<section class="mb-8">
				<h3 class="text-lg font-bold text-foreground mb-3 pb-2 border-b">
					Technical Skills
				</h3>
				<div class="grid gap-4">
					{#if data.resume.skills.backend.length > 0}
						<div>
							<h4 class="font-semibold text-foreground mb-1">Backend</h4>
							<p class="text-muted-foreground text-sm">
								{data.resume.skills.backend.map((s) => s.name).join(", ")}
							</p>
						</div>
					{/if}
					{#if data.resume.skills.frontend.length > 0}
						<div>
							<h4 class="font-semibold text-foreground mb-1">Frontend</h4>
							<p class="text-muted-foreground text-sm">
								{data.resume.skills.frontend.map((s) => s.name).join(", ")}
							</p>
						</div>
					{/if}
					{#if data.resume.skills.database.length > 0}
						<div>
							<h4 class="font-semibold text-foreground mb-1">Database</h4>
							<p class="text-muted-foreground text-sm">
								{data.resume.skills.database.map((s) => s.name).join(", ")}
							</p>
						</div>
					{/if}
					{#if data.resume.skills.cloud.length > 0}
						<div>
							<h4 class="font-semibold text-foreground mb-1">Cloud & DevOps</h4>
							<p class="text-muted-foreground text-sm">
								{data.resume.skills.cloud.map((s) => s.name).join(", ")}
							</p>
						</div>
					{/if}
					{#if data.resume.skills.leadership.length > 0}
						<div>
							<h4 class="font-semibold text-foreground mb-1">Leadership</h4>
							<p class="text-muted-foreground text-sm">
								{data.resume.skills.leadership.map((s) => s.name).join(", ")}
							</p>
						</div>
					{/if}
				</div>
			</section>

			<section class="mb-8">
				<h3 class="text-lg font-bold text-foreground mb-3 pb-2 border-b">
					Professional Experience
				</h3>
				<div class="space-y-6">
					{#each data.resume.experience as exp}
						<div class="relative pl-4 border-l-2 border-primary/30">
							<div class="flex justify-between items-start mb-1">
								<h4 class="font-semibold text-foreground">{exp.role}</h4>
								<span class="text-sm text-muted-foreground font-medium"
									>{exp.period}</span
								>
							</div>
							<p class="text-primary font-medium mb-2">{exp.company}</p>
							<p class="text-muted-foreground text-sm mb-2">
								{exp.description}
							</p>
							{#if exp.tech.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each exp.tech as tech}
										<span
											class="inline-block px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
										>
											{tech}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			{#if data.resume.projects.length > 0}
				<section>
					<h3 class="text-lg font-bold text-foreground mb-3 pb-2 border-b">
						Notable Projects
					</h3>
					<div class="space-y-4">
						{#each data.resume.projects.slice(0, 5) as project}
							<div>
								<div class="flex justify-between items-start mb-1">
									<h4 class="font-semibold text-foreground">{project.title}</h4>
									<span class="text-sm text-muted-foreground"
										>{project.year}</span
									>
								</div>
								<p class="text-primary text-sm font-medium mb-1">
									{project.company}
								</p>
								<p class="text-muted-foreground text-sm mb-2">
									{project.description}
								</p>
								{#if project.techStack.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each project.techStack.slice(0, 6) as tech}
											<span
												class="inline-block px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
											>
												{tech}
											</span>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	</div>
</main>
