import { createFileRoute, Link, Outlet, redirect, useRouter, useRouterState } from "@tanstack/react-router";
import { Avatar, Icon, type IconName, IconButton, Logo, ThemeToggle } from "#/design-system/ui";
import { getSession, signOut } from "#/server/fn/auth";

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		if (!(await getSession()).signedIn) throw redirect({ to: "/login" });
	},
	head: () => ({ meta: [{ title: "Dashboard · mohamedhabib.me" }, { name: "robots", content: "noindex" }] }),
	component: AdminLayout,
});

const NAV: { group?: string; items: { to: string; label: string; icon: IconName; exact?: boolean }[] }[] = [
	{ items: [{ to: "/admin", label: "Dashboard", icon: "home", exact: true }, { to: "/admin/messages", label: "Messages", icon: "mail" }] },
	{ group: "Portfolio", items: [{ to: "/admin/profile", label: "Profile", icon: "user" }, { to: "/admin/projects", label: "Projects", icon: "briefcase" }, { to: "/admin/services", label: "Services", icon: "layers" }, { to: "/admin/experience", label: "Experience", icon: "clock" }, { to: "/admin/skills", label: "Skills", icon: "zap" }] },
	{ group: "Career", items: [{ to: "/admin/cvs", label: "CVs & ATS", icon: "file" }] },
];

function AdminLayout() {
	const router = useRouter();
	const path = useRouterState({ select: (s) => s.location.pathname });
	const isActive = (to: string, exact?: boolean) => (exact ? path === to || path === `${to}/` : path.startsWith(to));
	const title = NAV.flatMap((g) => g.items).find((i) => isActive(i.to, i.exact))?.label ?? "Dashboard";

	async function onSignOut() {
		await signOut();
		await router.navigate({ to: "/login" });
	}

	return (
		<div className="admin">
			<aside className="mh-sidebar">
				<div className="mh-sidebar__brand"><Logo size={24} tagline="Dashboard" href="/admin" /></div>
				{NAV.map((g) => (
					<nav key={g.group ?? "main"} className="mh-sidebar__group" aria-label={g.group ?? "Main"}>
						{g.group && <span className="mh-sidebar__label">{g.group}</span>}
						{g.items.map((it) => (
							<Link key={it.to} to={it.to} className="mh-sidebar__item" activeOptions={{ exact: Boolean(it.exact), includeSearch: false }}>
								<Icon name={it.icon} size={17} />
								{it.label}
							</Link>
						))}
					</nav>
				))}
				<div className="mh-sidebar__foot">
					<Avatar name="Mohamed Habib" size="sm" src="/brand/images/profile.jpg" />
					<span style={{ minWidth: 0, flex: 1 }}>Mohamed Habib<small>Owner</small></span>
					<IconButton icon="log-out" label="Sign out" size="sm" onClick={onSignOut} />
				</div>
			</aside>
			<div className="admin-main">
				<header className="mh-topbar">
					<div className="mh-topbar__title">{title}</div>
					<a className="mh-btn mh-btn--outline mh-btn--sm" href="/" target="_blank" rel="noopener noreferrer"><Icon name="external-link" size={14} />View site</a>
					<ThemeToggle />
				</header>
				<nav className="admin-mobile-bar" aria-label="Dashboard sections">
					{NAV.flatMap((g) => g.items).map((it) => (
						<Link key={it.to} to={it.to} activeOptions={{ exact: Boolean(it.exact), includeSearch: false }}>{it.label}</Link>
					))}
					<button type="button" className="mh-btn mh-btn--ghost mh-btn--sm" onClick={onSignOut}>Sign out</button>
				</nav>
				<main id="main" className="admin-content">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
