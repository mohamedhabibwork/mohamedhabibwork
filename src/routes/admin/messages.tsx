import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, ConfirmButton, EmptyState, Tabs } from "#/design-system/ui";
import { deleteMessage, listMessages, setMessageRead } from "#/server/fn/admin";

export const Route = createFileRoute("/admin/messages")({
	loader: () => listMessages(),
	component: Messages,
});

function Messages() {
	const all = Route.useLoaderData();
	const router = useRouter();
	const [tab, setTab] = useState<"unread" | "all">("unread");
	const [open, setOpen] = useState<number | null>(null);
	const list = tab === "unread" ? all.filter((m) => !m.read) : all;
	const refresh = () => router.invalidate();
	return (
		<>
			<div className="admin-page-head"><div><h1>Messages</h1><p>From the contact form on your site.</p></div></div>
			<Tabs label="Filter" value={tab} onChange={setTab} items={[{ id: "unread", label: "Unread", count: all.filter((m) => !m.read).length }, { id: "all", label: "All", count: all.length }]} />
			{list.length === 0 ? (
				<EmptyState icon="inbox" title={tab === "unread" ? "You're all caught up" : "No messages yet"} />
			) : (
				<div className="admin-list">
					{list.map((m) => (
						<article key={m.id} className="mh-card" style={{ gap: 8 }}>
							<div className="mh-row mh-row--between">
								<div>
									<strong>{m.name}</strong> · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "your message"}`)}`}>{m.email}</a>
									<div className="admin-row__sub">{new Date(m.createdAt).toLocaleString()}</div>
								</div>
								<div className="mh-row" style={{ gap: 4 }}>
									{!m.read && <Badge variant="brand" dot>New</Badge>}
									<Button size="sm" variant="ghost" onClick={async () => { await setMessageRead({ data: { id: m.id, read: !m.read } }); refresh(); }}>{m.read ? "Mark unread" : "Mark read"}</Button>
									<ConfirmButton label="Delete" confirmTitle="Delete this message?" confirmText="It's removed permanently." onConfirm={async () => { await deleteMessage({ data: { id: m.id } }); refresh(); }} />
								</div>
							</div>
							{m.subject && <div style={{ fontWeight: 600 }}>{m.subject}</div>}
							<p style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--text-muted)" }}>{open === m.id || m.body.length < 280 ? m.body : `${m.body.slice(0, 280)}…`}</p>
							{m.body.length >= 280 && <Button size="sm" variant="ghost" onClick={() => setOpen(open === m.id ? null : m.id)}>{open === m.id ? "Show less" : "Read all"}</Button>}
						</article>
					))}
				</div>
			)}
		</>
	);
}
