import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, Button, ConfirmButton, IconButton, Input, Modal, Select } from "#/design-system/ui";
import { useSave } from "#/design-system/use-save";
import { deleteSkill, listSkills, type SkillInput, saveSkill } from "#/server/fn/admin";

export const Route = createFileRoute("/admin/skills")({
	loader: () => listSkills(),
	component: SkillsPage,
});

const LEVELS = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: ["Familiar", "Working", "Proficient", "Advanced", "Expert"][n - 1] + ` (${n}/5)` }));

function SkillsPage() {
	const rows = Route.useLoaderData();
	const router = useRouter();
	const [edit, setEdit] = useState<SkillInput | null>(null);
	const save = useSave();
	const groups = [...new Set(rows.map((r) => r.category))];

	return (
		<>
			<div className="admin-page-head">
				<div><h1>Skills</h1><p>Grouped by category on your site; each category becomes a CV skills line.</p></div>
				<Button leadingIcon="plus" onClick={() => setEdit({ name: "", category: groups[0] ?? "Backend", level: 3, years: null, sort: rows.length })}>New skill</Button>
			</div>
			<div className="mh-grid-2">
				{groups.map((g) => (
					<section key={g} className="mh-card">
						<span className="mh-card__eyebrow">{g}</span>
						<div className="admin-list">
							{rows.filter((r) => r.category === g).map((s) => (
								<div key={s.id} className="mh-row" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
									<span>{s.name} <span style={{ color: "var(--text-subtle)" }}>{s.level}/5{s.years ? ` · ${s.years}y` : ""}</span></span>
									<span className="mh-row" style={{ gap: 2, flexWrap: "nowrap" }}>
										<IconButton icon="edit" label={`Edit ${s.name}`} size="sm" onClick={() => setEdit({ ...s })} />
										<ConfirmButton label="Delete" confirmTitle={`Delete ${s.name}?`} confirmText="It's removed from your site." onConfirm={async () => { await deleteSkill({ data: { id: s.id } }); router.invalidate(); }} />
									</span>
								</div>
							))}
						</div>
					</section>
				))}
			</div>
			{edit && (
				<Modal open title={edit.id ? "Edit skill" : "New skill"} onClose={() => setEdit(null)} footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button form="skill-form" type="submit" loading={save.saving}>Save</Button></>}>
					<form id="skill-form" className="form-grid" onSubmit={async (e) => { e.preventDefault(); const r = await save.run(() => saveSkill({ data: edit })); if (r) { setEdit(null); router.invalidate(); } }}>
						{save.error && <Alert variant="danger">{save.error}</Alert>}
						<Input label="Skill" required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} error={save.fieldErrors.name} />
						<Input label="Category" required list="skill-cats" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
						<datalist id="skill-cats">{groups.map((g) => <option key={g} value={g} />)}</datalist>
						<div className="form-grid-2">
							<Select label="Level" options={LEVELS} value={String(edit.level)} onChange={(e) => setEdit({ ...edit, level: Number(e.target.value) })} />
							<Input label="Years" type="number" min={0} max={60} value={edit.years ?? ""} onChange={(e) => setEdit({ ...edit, years: e.target.value === "" ? null : Number(e.target.value) })} />
						</div>
					</form>
				</Modal>
			)}
		</>
	);
}
