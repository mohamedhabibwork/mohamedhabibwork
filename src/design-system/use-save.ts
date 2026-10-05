import { useState } from "react";

/** Wraps a save call with busy / saved / error state and zod-issue → field-error mapping. */
export function useSave() {
	const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
	const [error, setError] = useState("");
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
		setState("saving");
		setError("");
		setFieldErrors({});
		try {
			const out = await fn();
			if (out && typeof out === "object" && "ok" in out && out.ok === false) {
				setError(String((out as { error?: string }).error ?? "Couldn't save."));
				setState("idle");
				return out;
			}
			setState("saved");
			setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 2500);
			return out;
		} catch (err) {
			setState("idle");
			const msg = err instanceof Error ? err.message : String(err);
			try {
				const issues = JSON.parse(msg) as { path: (string | number)[]; message: string }[];
				setFieldErrors(Object.fromEntries(issues.map((i) => [i.path.join("."), i.message])));
				setError("Fix the highlighted fields.");
			} catch {
				setError(msg === "UNAUTHORIZED" ? "Your session expired. Sign in again." : "Couldn't save. Try again.");
			}
			return undefined;
		}
	}
	return { state, error, fieldErrors, run, saving: state === "saving", saved: state === "saved" };
}
