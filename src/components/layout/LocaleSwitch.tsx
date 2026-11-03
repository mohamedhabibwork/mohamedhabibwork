import { useLocation, useMatch } from "@tanstack/react-router";
import { Icon } from "#/design-system/ui";
import { postSwitchPath } from "#/lib/blog";
import { m } from "#/paraglide/messages";
import { getLocale, type Locale, localizeHref } from "#/paraglide/runtime";

const OTHER: Record<Locale, Locale> = { en: "ar", ar: "en" };

/**
 * Link to the same page in the other language. A full page load (not client navigation) so the
 * server renders the right `lang`/`dir` and localized data. A blog post exists in one language,
 * so it links to its translation or, without one, to the blog index.
 */
export function LocaleSwitch() {
	const { pathname, searchStr } = useLocation();
	const target = OTHER[getLocale()];
	const post = useMatch({ from: "/_site/blog/$slug", shouldThrow: false });
	const path = post?.loaderData
		? postSwitchPath(post.loaderData.translation?.slug)
		: `${pathname}${searchStr}`;
	return (
		<a
			className="locale-switch"
			href={localizeHref(path, { locale: target })}
			hrefLang={target}
			lang={target}
			aria-label={`${m.language_label()}: ${m.language_switch_to()}`}
		>
			<Icon name="globe" size={16} />
			<span>{m.language_switch_to()}</span>
		</a>
	);
}
