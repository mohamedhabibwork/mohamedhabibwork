import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
/** Public sitekey, baked in at build time. */
const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined;

type TurnstileApi = {
	render: (el: HTMLElement, opts: Record<string, unknown>) => string;
	reset: (id: string) => void;
	remove: (id: string) => void;
};
declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

let scriptPromise: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
	if (window.turnstile) return Promise.resolve(window.turnstile);
	scriptPromise ??= new Promise((resolve, reject) => {
		const s = document.createElement("script");
		s.src = SCRIPT_SRC;
		s.async = true;
		s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile failed to load")));
		s.onerror = () => {
			scriptPromise = null;
			reject(new Error("Turnstile failed to load"));
		};
		document.head.appendChild(s);
	});
	return scriptPromise;
}

export type TurnstileHandle = { reset: () => void };

/**
 * Explicitly rendered Turnstile widget; reports its token via `onToken`.
 * Call `reset()` after each submit attempt: tokens are single-use.
 */
export const Turnstile = forwardRef<TurnstileHandle, { action: "contact" | "login"; onToken: (token: string) => void }>(function Turnstile({ action, onToken }, ref) {
	const el = useRef<HTMLDivElement>(null);
	const widgetId = useRef<string | null>(null);
	const onTokenRef = useRef(onToken);
	onTokenRef.current = onToken;

	useImperativeHandle(ref, () => ({
		reset: () => {
			onTokenRef.current("");
			if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current);
		},
	}));

	useEffect(() => {
		if (!SITEKEY || !el.current) return;
		let cancelled = false;
		loadTurnstile()
			.then((api) => {
				if (cancelled || !el.current) return;
				widgetId.current = api.render(el.current, {
					sitekey: SITEKEY,
					action,
					theme: document.documentElement.dataset.theme === "light" ? "light" : "dark",
					callback: (t: string) => onTokenRef.current(t),
					"expired-callback": () => onTokenRef.current(""),
					"error-callback": () => onTokenRef.current(""),
				});
			})
			.catch((e: unknown) => console.error(e));
		return () => {
			cancelled = true;
			if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
			widgetId.current = null;
		};
	}, [action]);

	return <div ref={el} className="turnstile" />;
});
