import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, Button, Input, LinesField, Textarea } from "#/design-system/ui";
import { useSave } from "#/design-system/use-save";
import { getProfile, type ProfileInput, saveProfile } from "#/server/fn/admin";

export const Route = createFileRoute("/admin/profile")({
	loader: () => getProfile(),
	component: ProfilePage,
});

const EMPTY: ProfileInput = { name: "", headline: "", tagline: "", summary: "", email: "", phone: "", location: "", website: "", github: "", linkedin: "", availability: "", photoUrl: "/brand/marks/mh-mark.svg", stats: [], certifications: [] };

function ProfilePage() {
	const loaded = Route.useLoaderData();
	const router = useRouter();
	const [form, setForm] = useState<ProfileInput>(() => (loaded ? { ...EMPTY, ...loaded, stats: loaded.stats } : EMPTY));
	const save = useSave();
	const set = <K extends keyof ProfileInput>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
	const f = (k: keyof ProfileInput) => save.fieldErrors[k];

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				const r = await save.run(() => saveProfile({ data: form }));
				if (r) router.invalidate();
			}}
			style={{ display: "grid", gap: 8 }}
		>
			<div className="admin-page-head">
				<div><h1>Profile</h1><p>Shown on your site's hero, contact section and every new CV.</p></div>
				<Button type="submit" loading={save.saving} leadingIcon={save.saved ? "check" : undefined}>{save.saved ? "Saved" : "Save profile"}</Button>
			</div>
			{save.error && <Alert variant="danger" title="Not saved">{save.error}</Alert>}
			<section className="mh-formsec">
				<div className="mh-formsec__head"><h3 className="mh-formsec__title">Identity</h3><p className="mh-formsec__desc">Your name, headline and the pitch under it.</p></div>
				<div className="mh-formsec__body mh-formsec__body--2">
					<Input label="Name" value={form.name} onChange={set("name")} required error={f("name")} />
					<Input label="Headline" value={form.headline} onChange={set("headline")} required error={f("headline")} />
					<div style={{ gridColumn: "1 / -1" }}><Textarea label="Tagline" rows={2} value={form.tagline} onChange={set("tagline")} error={f("tagline")} /></div>
					<div style={{ gridColumn: "1 / -1" }}><Textarea label="Summary" hint="Used as the default CV summary." rows={5} value={form.summary} onChange={set("summary")} error={f("summary")} /></div>
					<Input label="Photo URL" value={form.photoUrl} onChange={set("photoUrl")} hint="A path under /brand/images or a full URL." error={f("photoUrl")} />
					<Input label="Availability" value={form.availability} onChange={set("availability")} error={f("availability")} />
				</div>
			</section>
			<section className="mh-formsec">
				<div className="mh-formsec__head"><h3 className="mh-formsec__title">Contact</h3><p className="mh-formsec__desc">Public on your site and CVs.</p></div>
				<div className="mh-formsec__body mh-formsec__body--2">
					<Input label="Email" type="email" value={form.email} onChange={set("email")} required error={f("email")} />
					<Input label="Phone" type="tel" value={form.phone} onChange={set("phone")} error={f("phone")} />
					<Input label="Location" value={form.location} onChange={set("location")} error={f("location")} />
					<Input label="Website" value={form.website} onChange={set("website")} error={f("website")} />
					<Input label="GitHub" value={form.github} onChange={set("github")} error={f("github")} />
					<Input label="LinkedIn" value={form.linkedin} onChange={set("linkedin")} error={f("linkedin")} />
				</div>
			</section>
			<section className="mh-formsec">
				<div className="mh-formsec__head"><h3 className="mh-formsec__title">Certifications</h3><p className="mh-formsec__desc">One per line. Shown on your site and new CVs.</p></div>
				<div className="mh-formsec__body">
					<LinesField label="Certifications" value={form.certifications} onChange={(certifications) => setForm({ ...form, certifications })} rows={5} />
				</div>
			</section>
			<section className="mh-formsec">
				<div className="mh-formsec__head"><h3 className="mh-formsec__title">Highlights</h3><p className="mh-formsec__desc">Up to 8 stats under the hero.</p></div>
				<div className="mh-formsec__body">
					{form.stats.map((s, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: rows have no identity; inputs are fully controlled
						<div key={i} className="form-grid-2" style={{ alignItems: "end" }}>
							<Input label="Value" value={s.value} onChange={(e) => setForm({ ...form, stats: form.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
							<div className="mh-row" style={{ alignItems: "end", flexWrap: "nowrap" }}>
								<div style={{ flex: 1 }}><Input label="Label" value={s.label} onChange={(e) => setForm({ ...form, stats: form.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} /></div>
								<Button variant="ghost" onClick={() => setForm({ ...form, stats: form.stats.filter((_, j) => j !== i) })}>Remove</Button>
							</div>
						</div>
					))}
					{form.stats.length < 8 && <div><Button variant="outline" leadingIcon="plus" onClick={() => setForm({ ...form, stats: [...form.stats, { label: "", value: "" }] })}>Add stat</Button></div>}
				</div>
			</section>
		</form>
	);
}
