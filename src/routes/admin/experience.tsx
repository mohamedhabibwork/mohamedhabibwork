import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, Button, Checkbox, ConfirmButton, EmptyState, IconButton, Input, LinesField, Modal, Textarea } from "#/design-system/ui";
import { useSave } from "#/design-system/use-save";
import { deleteExperience, type ExperienceInput, listExperiences, saveExperience } from "#/server/fn/admin";

export const Route = createFileRoute("/admin/experience")({
	loader: () => listExperiences(),
	component: ExperiencePage,
});

const blank = (sort: number): ExperienceInput => ({ company: "", role: "", location: "", start: "", end: "", current: false, summary: "", highlights: [], tech: [], sort });

function ExperiencePage() {
	const rows = Route.useLoaderData();
	const router = useRouter();
	const [edit, setEdit] = useState<ExperienceInput | null>(null);
	const save = useSave();
	const fe = (k: string) => save.fieldErrors[k];

	async function move(i: number, d: -1 | 1) {
		const a = rows[i];
		const b = rows[i + d];
		if (!a || !b) return;
		await saveExperience({ data: { ...a, sort: b.sort } });
		await saveExperience({ data: { ...b, sort: a.sort } });
		router.invalidate();
	}

	return (
		<>
			<div className="admin-page-head">
				<div><h1>Experience</h1><p>Most recent first. Highlights become CV bullets: start with a verb and add a number.</p></div>
				<Button leadingIcon="plus" onClick={() => setEdit(blank(rows.length))}>New role</Button>
			</div>
			{rows.length === 0 ? <EmptyState icon="clock" title="No roles yet" /> : (
				<div className="admin-list">
					{rows.map((r, i) => (
						<div key={r.id} className="admin-row">
							<div className="admin-row__main">
								<div className="admin-row__title">{r.role}</div>
								<div className="admin-row__sub">{r.company} · {r.start} – {r.current ? "Present" : r.end}</div>
							</div>
							<IconButton icon="arrow-up" label="Move up" size="sm" disabled={i === 0} onClick={() => move(i, -1)} />
							<IconButton icon="arrow-down" label="Move down" size="sm" disabled={i === rows.length - 1} onClick={() => move(i, 1)} />
							<IconButton icon="edit" label={`Edit ${r.role}`} size="sm" onClick={() => setEdit({ ...r })} />
							<ConfirmButton label="Delete" confirmTitle="Delete this role?" confirmText="It's removed from your site. CVs keep their own copy." onConfirm={async () => { await deleteExperience({ data: { id: r.id } }); router.invalidate(); }} />
						</div>
					))}
				</div>
			)}
			{edit && (
				<Modal open title={edit.id ? "Edit role" : "New role"} onClose={() => setEdit(null)} footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button form="exp-form" type="submit" loading={save.saving}>Save</Button></>}>
					<form id="exp-form" className="form-grid" onSubmit={async (e) => { e.preventDefault(); const r = await save.run(() => saveExperience({ data: edit })); if (r) { setEdit(null); router.invalidate(); } }}>
						{save.error && <Alert variant="danger">{save.error}</Alert>}
						<div className="form-grid-2">
							<Input label="Role" required value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} error={fe("role")} />
							<Input label="Company" required value={edit.company} onChange={(e) => setEdit({ ...edit, company: e.target.value })} error={fe("company")} />
							<Input label="Location" value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} />
							<div />
							<Input label="Start" placeholder="Sep 2025" required value={edit.start} onChange={(e) => setEdit({ ...edit, start: e.target.value })} error={fe("start")} />
							<Input label="End" placeholder="2025" disabled={edit.current} value={edit.current ? "" : edit.end} onChange={(e) => setEdit({ ...edit, end: e.target.value })} />
						</div>
						<Checkbox label="I currently work here" checked={edit.current} onChange={(e) => setEdit({ ...edit, current: e.target.checked })} />
						<Textarea label="Summary" rows={2} value={edit.summary} onChange={(e) => setEdit({ ...edit, summary: e.target.value })} />
						<LinesField label="Highlights" value={edit.highlights} onChange={(highlights) => setEdit({ ...edit, highlights })} rows={5} hint="One per line. Start with a verb; include a number." />
						<LinesField label="Tech" value={edit.tech} onChange={(tech) => setEdit({ ...edit, tech })} rows={3} />
					</form>
				</Modal>
			)}
		</>
	);
}
