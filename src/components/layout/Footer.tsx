import { Link } from "@tanstack/react-router";
import { Reveal } from "#/design-system/motion";
import { Icon, Logo } from "#/design-system/ui";
import { m } from "#/paraglide/messages";
import { localizeHref } from "#/paraglide/runtime";
import type { SiteOwner } from "#/server/fn/site";
import { NAV } from "./nav";

export function Footer({ owner }: { owner: SiteOwner | null }) {
	const socials = [
		owner?.github && {
			href: owner.github,
			label: "GitHub",
			icon: "github" as const,
		},
		owner?.linkedin && {
			href: owner.linkedin,
			label: "LinkedIn",
			icon: "linkedin" as const,
		},
		owner?.email && {
			href: `mailto:${owner.email}`,
			label: "Email",
			icon: "mail" as const,
		},
	].filter(
		(
			s,
		): s is {
			href: string;
			label: string;
			icon: "github" | "linkedin" | "mail";
		} => Boolean(s),
	);

	return (
		<footer className="site-footer">
			<Reveal className="site site-footer__grid">
				<div className="site-footer__brand">
					<Logo size={28} href={localizeHref("/")} />
					<p>{m.footer_tagline()}</p>
					{owner?.availability && (
						<span className="availability">
							<span className="availability__dot" aria-hidden />
							{m.footer_available()}
						</span>
					)}
				</div>
				<nav aria-label={m.footer_explore()}>
					<h2 className="site-footer__title">{m.footer_explore()}</h2>
					<ul>
						{NAV.map((n) => (
							<li key={n.label()}>
								<Link to={n.to} hash={n.hash}>
									{n.label()}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				<div>
					<h2 className="site-footer__title">{m.footer_connect()}</h2>
					<ul>
						{socials.map((s) => (
							<li key={s.label}>
								<a
									href={s.href}
									{...(s.href.startsWith("http")
										? { target: "_blank", rel: "noopener noreferrer" }
										: {})}
								>
									<Icon name={s.icon} size={16} /> {s.label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</Reveal>
			<div className="site site-footer__bottom">
				<span>
					© {new Date().getFullYear()} {owner?.name ?? "Mohamed Habib"}.{" "}
					{m.footer_rights()}
				</span>
			</div>
		</footer>
	);
}
