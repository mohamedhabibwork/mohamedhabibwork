import { Link } from "@tanstack/react-router";
import { AnimatePresence, m as motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { EASE_OUT } from "#/design-system/motion";
import { IconButton, LinkButton } from "#/design-system/ui";
import { m } from "#/paraglide/messages";
import { LocaleSwitch } from "./LocaleSwitch";
import { NAV } from "./nav";

const FOCUSABLE = "a[href], button:not([disabled])";

/**
 * Full-screen navigation sheet for small screens: traps focus, closes on Esc or link click.
 * Portalled to <body> because the header's backdrop-filter would otherwise contain `position: fixed`.
 */
export function MobileNav({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const panel = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();

	useEffect(() => {
		if (!open) return;
		const previous = document.activeElement as HTMLElement | null;
		document.body.style.overflow = "hidden";
		panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") return onClose();
			if (e.key !== "Tab" || !panel.current) return;
			const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
			const first = items[0];
			const last = items[items.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last?.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first?.focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
			previous?.focus();
		};
	}, [open, onClose]);

	if (typeof document === "undefined") return null;
	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					ref={panel}
					id="mobile-nav"
					className="mobile-nav"
					role="dialog"
					aria-modal="true"
					aria-label={m.nav_main()}
					initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
					animate={{ clipPath: "inset(0 0 0% 0)" }}
					exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
					transition={{ duration: 0.45, ease: EASE_OUT }}
				>
					<div className="mobile-nav__top">
						<IconButton icon="x" label={m.nav_close_menu()} onClick={onClose} />
					</div>
					<nav aria-label={m.nav_main()}>
						<ul className="mobile-nav__list">
							{NAV.map((item, i) => (
								<motion.li
									key={item.label()}
									initial={reduce ? false : { opacity: 0, y: 24 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										delay: 0.12 + i * 0.05,
										duration: 0.4,
										ease: EASE_OUT,
									}}
								>
									<Link to={item.to} hash={item.hash} onClick={onClose}>
										{item.label()}
									</Link>
								</motion.li>
							))}
						</ul>
					</nav>
					<div className="mobile-nav__foot">
						<LocaleSwitch />
						<LinkButton
							href="/#contact"
							onClick={onClose}
							trailingIcon="arrow-right"
						>
							{m.cta_hire_me()}
						</LinkButton>
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
