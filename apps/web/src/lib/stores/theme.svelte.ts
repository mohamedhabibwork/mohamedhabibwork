import { browser } from "$app/environment";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function createThemeStore() {
	let theme = $state<Theme>("dark");

	function init() {
		if (!browser) {
			return;
		}

		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)"
		).matches;
		const initial = stored ?? (prefersDark ? "dark" : "light");

		theme = initial;
		applyTheme(initial);
	}

	function applyTheme(t: Theme) {
		if (!browser) {
			return;
		}

		document.documentElement.classList.toggle("dark", t === "dark");
		localStorage.setItem(STORAGE_KEY, t);
	}

	function toggle() {
		theme = theme === "dark" ? "light" : "dark";
		applyTheme(theme);
	}

	function set(t: Theme) {
		theme = t;
		applyTheme(t);
	}

	return {
		get current() {
			return theme;
		},
		init,
		toggle,
		set,
	};
}

export const theme = createThemeStore();
