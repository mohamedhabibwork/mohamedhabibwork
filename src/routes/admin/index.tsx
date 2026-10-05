import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Card, EmptyState, StatCard } from "#/design-system/ui";
import { getDashboard } from "#/server/fn/admin";

export const Route = createFileRoute("/admin/")({
	loader: () => getDashboard(),
	component: Dashboard,
});

const fmt = (d: Date | string) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function Dashboard() {
	const d = Route.useLoaderData();
	return (
		<>
			<div className="admin-page-head">
				<div>
					<h1>Welcome back</h1>
					<p>Your portfolio, CVs and messages at a glance.</p>
				</div>
				<Link to="/admin/cvs" className="mh-btn mh-btn--primary">Build a CV</Link>
			</div>
			<div className="mh-grid-4">
				<StatCard label="Unread messages" value={d.counts.unread} />
				<StatCard label="CVs" value={d.counts.cvs} />
				<StatCard label="Projects" value={d.counts.projects} />
				<StatCard label="Roles" value={d.counts.experiences} />
			</div>
			<div className="mh-grid-2">
				<Card title="Recent messages" footer={<Link className="mh-link" to="/admin/messages">All messages →</Link>}>
					{d.recentMessages.length === 0 ? (
						<EmptyState icon="inbox" title="No messages yet" description="Contact-form messages from your site land here." />
					) : (
						<ul className="mh-feed">
							{d.recentMessages.map((m) => (
								<li key={m.id} className={m.read ? "mh-feed__item" : "mh-feed__item mh-feed__item--unread"}>
									<span />
									<span className="mh-feed__text"><b>{m.name}</b> {m.subject || m.body.slice(0, 60)}</span>
									<time className="mh-feed__time">{fmt(m.createdAt)}</time>
								</li>
							))}
						</ul>
					)}
				</Card>
				<Card title="Recent CVs and ATS checks" footer={<Link className="mh-link" to="/admin/cvs">All CVs →</Link>}>
					<div className="admin-list">
						{d.recentCvs.map((c) => (
							<Link key={c.id} to="/admin/cvs/$id" params={{ id: String(c.id) }} className="admin-row" style={{ textDecoration: "none" }}>
								<div className="admin-row__main">
									<div className="admin-row__title">{c.title}</div>
									<div className="admin-row__sub">Updated {fmt(c.updatedAt)}</div>
								</div>
								<Badge variant={c.isPublic ? "success" : "neutral"} dot={c.isPublic}>{c.isPublic ? "Public" : "Private"}</Badge>
							</Link>
						))}
						{d.recentAts.map((r) => (
							<div key={`ats-${r.id}`} className="admin-row">
								<div className="admin-row__main">
									<div className="admin-row__title">ATS · {r.jobTitle || "Untitled job"}</div>
									<div className="admin-row__sub">{fmt(r.createdAt)}</div>
								</div>
								<Badge variant={r.score >= 70 ? "success" : r.score >= 50 ? "warning" : "danger"}>{r.score}/100</Badge>
							</div>
						))}
					</div>
				</Card>
			</div>
		</>
	);
}
