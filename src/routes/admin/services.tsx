import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, Badge, Button, Checkbox, ConfirmButton, EmptyState, Icon, IconButton, type IconName, Input, LinesField, Modal, Select, Textarea } from "#/design-system/ui";
import { useSave } from "#/design-system/use-save";
import { deleteService, listServices, type ServiceInput, saveService } from "#/server/fn/admin";

export const Route = createFileRoute("/admin/services")({
	loader: () => listServices(),
	component: Services,
});

const ICONS: IconName[] = ["code", "map-pin", "zap", "layers", "monitor", "users", "server", "globe", "briefcase", "bar-chart", "settings", "sparkles"];
const blank = (sort: number): ServiceInput => ({ slug: "", title: "", icon: "code", summary: "", description: "", deliverables: [], tech: [], startingAt: "", published: true, sort });
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Services() {
	const rows = Route.useLoaderData();
	const router = useRouter();
	const [edit, setEdit] = useState<ServiceInput | null>(null);
	const save = useSave();
	const fe = (k: string) => save.fieldErrors[k];

	return (
		<>
			<div className="admin-page-head">
				<div><h1>Services</h1><p>Each service gets its own page with a contact form that emails you.</p></div>
				<Button leadingIcon="plus" onClick={() => setEdit(blank(rows.length))}>New service</Button>
			</div>
			{rows.length === 0 ? <EmptyState icon="layers" title="No services yet" action={<Button size="sm" onClick={() => setEdit(blank(0))}>Add service</Button>} /> : (
				<div className="admin-list">
					{rows.map((s) => (
						<div key={s.id} className="admin-row">
							<Icon name={s.icon as IconName} />
							<div className="admin-row__main">
								<div className="admin-row__title">{s.title}</div>
								<div className="admin-row__sub">{s.summary}</div>
							</div>
							{!s.published && <Badge>Hidden</Badge>}
							<IconButton icon="edit" label={`Edit ${s.title}`} size="sm" onClick={() => setEdit({ ...s })} />
							<ConfirmButton label="Delete" confirmTitle={`Delete ${s.title}?`} confirmText="Its page is removed from your site." onConfirm={async () => { await deleteService({ data: { id: s.id } }); router.invalidate(); }} />
						</div>
					))}
				</div>
			)}
			{edit && (
				<Modal
					open
					title={edit.id ? `Edit ${edit.title}` : "New service"}
					onClose={() => setEdit(null)}
					footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button form="service-form" type="submit" loading={save.saving}>Save</Button></>}
				>
					<form
						id="service-form"
						className="form-grid"
						onSubmit={async (e) => {
							e.preventDefault();
							const r = await save.run(() => saveService({ data: { ...edit, slug: edit.slug || slugify(edit.title) } }));
							if (r && "ok" in r && r.ok) { setEdit(null); router.invalidate(); }
						}}
					>
						{save.error && <Alert variant="danger">{save.error}</Alert>}
						<div className="form-grid-2">
							<Input label="Title" required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} error={fe("title")} />
							<Input label="Slug" value={edit.slug} placeholder={slugify(edit.title)} onChange={(e) => setEdit({ ...edit, slug: slugify(e.target.value) })} error={fe("slug")} />
							<Select label="Icon" value={edit.icon} onChange={(e) => setEdit({ ...edit, icon: e.target.value })} options={ICONS.map((i) => ({ value: i, label: i }))} />
							<Input label="Starting at (optional)" value={edit.startingAt} placeholder="e.g. $2,000" onChange={(e) => setEdit({ ...edit, startingAt: e.target.value })} />
						</div>
						<Textarea label="Summary" rows={2} value={edit.summary} onChange={(e) => setEdit({ ...edit, summary: e.target.value })} error={fe("summary")} />
						<Textarea label="Description" hint="Separate paragraphs with a blank line." rows={5} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} error={fe("description")} />
						<LinesField label="Deliverables" value={edit.deliverables} onChange={(deliverables) => setEdit({ ...edit, deliverables })} rows={4} />
						<LinesField label="Typical stack" value={edit.tech} onChange={(tech) => setEdit({ ...edit, tech })} rows={3} />
						<Checkbox label="Published" checked={edit.published} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} />
					</form>
				</Modal>
			)}
		</>
	);
}
