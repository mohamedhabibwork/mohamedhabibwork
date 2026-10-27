import { m } from "#/paraglide/messages";

export type NavItem = {
	to: "/" | "/projects" | "/services" | "/blog";
	hash?: string;
	label: () => string;
};

/** Primary navigation, shared by the desktop header, the mobile sheet and the footer. */
export const NAV: NavItem[] = [
	{ to: "/projects", label: m.nav_projects },
	{ to: "/services", label: m.nav_services },
	{ to: "/blog", label: m.nav_blog },
	{ to: "/", hash: "experience", label: m.nav_about },
	{ to: "/", hash: "contact", label: m.nav_contact },
];
