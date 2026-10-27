import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, Badge, Button, Checkbox, ConfirmButton, EmptyState, IconButton, Input, LinesField, Modal, Textarea } from "#/design-system/ui";
import { useSave } from "#/design-system/use-save";
import { deleteProject, listProjects, type ProjectInput, saveProject } from "#/server/fn/admin";

export const Route = createFileRoute("/admin/projects")({
	loader: () => listProjects(),
	component: Projects,
});

const blank = (sort: number): ProjectInput => ({ slug: "", title: "", subtitle: "", category: "", year: "", summary: "", description: "", role: "", challenge: "", outcomes: [], features: [], tech: [], url: "", imageUrl: "", featured: false, published: true, sort });
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Projects() {
	const rows = Route.useLoaderData();
	const router = useRouter();
	const [edit, setEdit] = useState<ProjectInput | null>(null);
	const save = useSave();
	const fe = (k: string) => save.fieldErrors[k];

	return (
		<>
			<div className="admin-page-head">
				<div><h1>Projects</h1><p>Featured projects lead the Work section and new CVs.</p></div>
				<Button leadingIcon="plus" onClick={() => setEdit(blank(rows.length))}>New project</Button>
			</div>
			{rows.length === 0 ? <EmptyState icon="briefcase" title="No projects yet" action={<Button size="sm" onClick={() => setEdit(blank(0))}>Add project</Button>} /> : (
				<div className="admin-list">
					{rows.map((p) => (
						<div key={p.id} className="admin-row">
							<div className="admin-row__main">
								<div className="admin-row__title">{p.title} <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>· {p.category} · {p.year}</span></div>
								<div className="admin-row__sub">{p.summary}</div>
							</div>
							{p.featured && <Badge variant="brand">Featured</Badge>}
							{!p.published && <Badge>Hidden</Badge>}
							<IconButton icon="edit" label={`Edit ${p.title}`} size="sm" onClick={() => setEdit({ ...p })} />
							<ConfirmButton label="Delete" confirmTitle={`Delete ${p.title}?`} confirmText="It's removed from your site. CVs keep their own copy." onConfirm={async () => { await deleteProject({ data: { id: p.id } }); router.invalidate(); }} />
						</div>
					))}
				</div>
			)}
			{edit && (
				<Modal
					open
					title={edit.id ? `Edit ${edit.title}` : "New project"}
					onClose={() => setEdit(null)}
					footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button form="project-form" type="submit" loading={save.saving}>Save</Button></>}
				>
					<form
						id="project-form"
						className="form-grid"
						onSubmit={async (e) => {
							e.preventDefault();
							const r = await save.run(() => saveProject({ data: { ...edit, slug: edit.slug || slugify(edit.title) } }));
							if (r && "ok" in r && r.ok) { setEdit(null); router.invalidate(); }
						}}
					>
						{save.error && <Alert variant="danger">{save.error}</Alert>}
						<div className="form-grid-2">
							<Input label="Title" required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} error={fe("title")} />
							<Input label="Slug" value={edit.slug} placeholder={slugify(edit.title)} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} error={fe("slug")} />
							<Input label="Category" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
							<Input label="Year" value={edit.year} onChange={(e) => setEdit({ ...edit, year: e.target.value })} />
						</div>
						<Textarea label="Summary" rows={3} value={edit.summary} onChange={(e) => setEdit({ ...edit, summary: e.target.value })} error={fe("summary")} />
						<LinesField label="Tech stack" value={edit.tech} onChange={(tech) => setEdit({ ...edit, tech })} rows={3} />
						<LinesField label="Key features" value={edit.features} onChange={(features) => setEdit({ ...edit, features })} rows={3} />
						<Input label="My role" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} error={fe("role")} />
						<Textarea label="The challenge" rows={2} value={edit.challenge} onChange={(e) => setEdit({ ...edit, challenge: e.target.value })} error={fe("challenge")} />
						<Textarea label="Case study" hint="Shown on the project page. Separate paragraphs with a blank line." rows={6} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} error={fe("description")} />
						<LinesField label="Outcomes" value={edit.outcomes} onChange={(outcomes) => setEdit({ ...edit, outcomes })} rows={3} />
						<fieldset className="form-grid" style={{ border: 0, padding: 0, margin: 0 }}>
							<legend className="mh-formsec__title">Arabic</legend>
							<p className="mh-formsec__desc">Leave a field empty to show the English text on the Arabic site.</p>
							<div className="form-grid-2">
								<Input label="Title (Arabic)" dir="rtl" value={edit.titleAr ?? ""} onChange={(e) => setEdit({ ...edit, titleAr: e.target.value })} error={fe("titleAr")} />
								<Input label="Subtitle (Arabic)" dir="rtl" value={edit.subtitleAr ?? ""} onChange={(e) => setEdit({ ...edit, subtitleAr: e.target.value })} error={fe("subtitleAr")} />
							</div>
							<Textarea label="Summary (Arabic)" dir="rtl" rows={3} value={edit.summaryAr ?? ""} onChange={(e) => setEdit({ ...edit, summaryAr: e.target.value })} error={fe("summaryAr")} />
							<LinesField label="Key features (Arabic)" dir="rtl" value={edit.featuresAr ?? []} onChange={(featuresAr) => setEdit({ ...edit, featuresAr })} rows={3} />
							<Input label="My role (Arabic)" dir="rtl" value={edit.roleAr ?? ""} onChange={(e) => setEdit({ ...edit, roleAr: e.target.value })} error={fe("roleAr")} />
							<Textarea label="The challenge (Arabic)" dir="rtl" rows={2} value={edit.challengeAr ?? ""} onChange={(e) => setEdit({ ...edit, challengeAr: e.target.value })} error={fe("challengeAr")} />
							<Textarea label="Case study (Arabic)" dir="rtl" rows={6} value={edit.descriptionAr ?? ""} onChange={(e) => setEdit({ ...edit, descriptionAr: e.target.value })} error={fe("descriptionAr")} />
							<LinesField label="Outcomes (Arabic)" dir="rtl" value={edit.outcomesAr ?? []} onChange={(outcomesAr) => setEdit({ ...edit, outcomesAr })} rows={3} />
						</fieldset>
						<div className="form-grid-2">
							<Input label="Live URL" value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} />
							<Input label="Cover image URL" value={edit.imageUrl} onChange={(e) => setEdit({ ...edit, imageUrl: e.target.value })} hint="Leave empty to use the generated cover" />
						</div>
						<div className="mh-row" style={{ gap: 24 }}>
							<Checkbox label="Featured" checked={edit.featured} onChange={(e) => setEdit({ ...edit, featured: e.target.checked })} />
							<Checkbox label="Published" checked={edit.published} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} />
						</div>
					</form>
				</Modal>
			)}
		</>
	);
}
