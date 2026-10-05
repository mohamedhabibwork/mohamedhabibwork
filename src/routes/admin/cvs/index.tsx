import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, Badge, Button, Checkbox, ConfirmButton, EmptyState, Icon, IconButton, Input, Modal } from "#/design-system/ui";
import { useSave } from "#/design-system/use-save";
import { createCv, deleteCv, duplicateCv, listCvs } from "#/server/fn/cv";

export const Route = createFileRoute("/admin/cvs/")({
	loader: () => listCvs(),
	component: CvList,
});

function CvList() {
	const rows = Route.useLoaderData();
	const router = useRouter();
	const [creating, setCreating] = useState(false);
	const [title, setTitle] = useState("");
	const [fromPortfolio, setFromPortfolio] = useState(true);
	const save = useSave();

	async function create(e: React.FormEvent) {
		e.preventDefault();
		const r = await save.run(() => createCv({ data: { title, fromPortfolio } }));
		if (r) await router.navigate({ to: "/admin/cvs/$id", params: { id: String(r.id) } });
	}

	return (
		<>
			<div className="admin-page-head">
				<div><h1>CVs</h1><p>Tailor a CV per role, check it against the job with the ATS checker, and share a PDF link that always builds the latest version.</p></div>
				<Button leadingIcon="plus" onClick={() => { setTitle(""); setCreating(true); }}>New CV</Button>
			</div>
			{rows.length === 0 ? <EmptyState icon="file" title="No CVs yet" description="Start one from your portfolio content." action={<Button size="sm" onClick={() => setCreating(true)}>New CV</Button>} /> : (
				<div className="admin-list">
					{rows.map((c) => (
						<div key={c.id} className="admin-row">
							<div className="admin-row__main">
								<Link to="/admin/cvs/$id" params={{ id: String(c.id) }} className="admin-row__title" style={{ textDecoration: "none" }}>{c.title}</Link>
								<div className="admin-row__sub">/api/cv/{c.slug}/pdf · {c.template} · updated {new Date(c.updatedAt).toLocaleDateString()}</div>
							</div>
							<Badge variant={c.isPublic ? "success" : "neutral"} dot={c.isPublic}>{c.isPublic ? "Public" : "Private"}</Badge>
							<a className="mh-iconbtn mh-iconbtn--sm" href={`/api/cv/${c.slug}/pdf`} target="_blank" rel="noopener noreferrer" aria-label={`Open PDF of ${c.title}`} title="Open PDF"><Icon name="download" size={16} /></a>
							<IconButton icon="copy" label={`Duplicate ${c.title}`} size="sm" onClick={async () => { const r = await duplicateCv({ data: { id: c.id } }); await router.navigate({ to: "/admin/cvs/$id", params: { id: String(r.id) } }); }} />
							<ConfirmButton label="Delete" confirmTitle={`Delete ${c.title}?`} confirmText="The CV, its public PDF link and its ATS reports are removed permanently." onConfirm={async () => { await deleteCv({ data: { id: c.id } }); router.invalidate(); }} />
						</div>
					))}
				</div>
			)}
			<Modal open={creating} title="New CV" description="Give it the role or company you're targeting." onClose={() => setCreating(false)} footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button form="new-cv" type="submit" loading={save.saving}>Create</Button></>}>
				<form id="new-cv" className="form-grid" onSubmit={create}>
					{save.error && <Alert variant="danger">{save.error}</Alert>}
					<Input label="Title" required placeholder="Tech Lead – Acme" value={title} onChange={(e) => setTitle(e.target.value)} error={save.fieldErrors.title} autoFocus />
					<Checkbox label="Start from my portfolio" description="Copies your profile, experience, featured projects and skills." checked={fromPortfolio} onChange={(e) => setFromPortfolio(e.target.checked)} />
				</form>
			</Modal>
		</>
	);
}
