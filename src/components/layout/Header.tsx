import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Magnetic } from "#/design-system/motion";
import { IconButton, LinkButton, Logo, ThemeToggle } from "#/design-system/ui";
import { m } from "#/paraglide/messages";
import { LocaleSwitch } from "./LocaleSwitch";
import { MobileNav } from "./MobileNav";
import { NAV } from "./nav";

const SCROLLED_AT = 8;

export function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const closeMenu = useCallback(() => setMenuOpen(false), []);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > SCROLLED_AT);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<header className="site-header" data-scrolled={scrolled || undefined}>
			<div className="site site-header__inner">
				<Logo size={26} href="/" />
				<nav className="site-nav" aria-label={m.nav_main()}>
					{NAV.map((n) => (
						<Link
							key={n.label()}
							to={n.to}
							hash={n.hash}
							activeOptions={{ exact: Boolean(n.hash), includeHash: true }}
							activeProps={{ "aria-current": "page" }}
						>
							{n.label()}
						</Link>
					))}
				</nav>
				<div className="site-header__actions">
					<LocaleSwitch />
					<ThemeToggle />
					<span className="site-header__cta">
						<Magnetic>
							<LinkButton href="/#contact" size="sm">
								{m.cta_hire_me()}
							</LinkButton>
						</Magnetic>
					</span>
					<IconButton
						className="site-header__menu"
						icon="menu"
						label={m.nav_open_menu()}
						aria-expanded={menuOpen}
						aria-controls="mobile-nav"
						onClick={() => setMenuOpen(true)}
					/>
				</div>
			</div>
			<MobileNav open={menuOpen} onClose={closeMenu} />
		</header>
	);
}
