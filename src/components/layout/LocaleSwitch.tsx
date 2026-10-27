import { useLocation } from "@tanstack/react-router";
import { Icon } from "#/design-system/ui";
import { m } from "#/paraglide/messages";
import { getLocale, type Locale, localizeHref } from "#/paraglide/runtime";

const OTHER: Record<Locale, Locale> = { en: "ar", ar: "en" };

/**
 * Link to the same page in the other language. A full page load (not client navigation) so the
 * server renders the right `lang`/`dir` and localized data.
 */
export function LocaleSwitch() {
	const { pathname, searchStr } = useLocation();
	const target = OTHER[getLocale()];
	return (
		<a
			className="locale-switch"
			href={localizeHref(`${pathname}${searchStr}`, { locale: target })}
			hrefLang={target}
			lang={target}
			aria-label={`${m.language_label()}: ${m.language_switch_to()}`}
		>
			<Icon name="globe" size={16} />
			<span>{m.language_switch_to()}</span>
		</a>
	);
}
