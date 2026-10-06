/**
 * MH design system: React components for this app. Class names and tokens come from
 * components.css / tokens.css (synced from brand/design-system by scripts/sync-design-system.mjs).
 * Artwork lives in /public/brand (icons, marks, images): nothing is drawn inline.
 */
import {
	type ButtonHTMLAttributes,
	type ComponentProps,
	type CSSProperties,
	type InputHTMLAttributes,
	type ReactNode,
	type SelectHTMLAttributes,
	type TextareaHTMLAttributes,
	useEffect,
	useId,
	useState,
} from "react";

export const cx = (...c: (string | false | null | undefined)[]) =>
	c.filter(Boolean).join(" ");
const ASSET_BASE = "/brand";

function mask(
	url: string,
	w: number | string,
	h: number | string,
	color = "currentColor",
): CSSProperties {
	const u = `url("${url}")`;
	return {
		display: "inline-block",
		width: w,
		height: h,
		backgroundColor: color,
		WebkitMaskImage: u,
		maskImage: u,
		WebkitMaskRepeat: "no-repeat",
		maskRepeat: "no-repeat",
		WebkitMaskPosition: "center",
		maskPosition: "center",
		WebkitMaskSize: "contain",
		maskSize: "contain",
		flex: "none",
	};
}

export type IconName =
	| "alert-triangle"
	| "arrow-down"
	| "arrow-down-right"
	| "arrow-right"
	| "arrow-up"
	| "arrow-up-right"
	| "award"
	| "bar-chart"
	| "bell"
	| "bold"
	| "book"
	| "briefcase"
	| "calendar"
	| "check"
	| "check-circle"
	| "chevron-down"
	| "chevron-left"
	| "chevron-right"
	| "chevron-up"
	| "clock"
	| "code"
	| "command"
	| "copy"
	| "download"
	| "edit"
	| "external-link"
	| "eye"
	| "eye-off"
	| "file"
	| "filter"
	| "github"
	| "globe"
	| "grip"
	| "home"
	| "image"
	| "inbox"
	| "info"
	| "italic"
	| "layers"
	| "layout"
	| "link"
	| "linkedin"
	| "list"
	| "log-out"
	| "mail"
	| "map-pin"
	| "menu"
	| "minus"
	| "monitor"
	| "moon"
	| "more-horizontal"
	| "phone"
	| "plus"
	| "printer"
	| "search"
	| "send"
	| "server"
	| "settings"
	| "sparkles"
	| "star"
	| "sun"
	| "trash"
	| "upload"
	| "user"
	| "users"
	| "x"
	| "x-circle"
	| "zap";

export function Icon({
	name,
	size = 18,
	label,
	className,
}: {
	name: IconName;
	size?: number;
	label?: string;
	className?: string;
}) {
	const style = mask(`${ASSET_BASE}/icons/${name}.svg`, size, size);
	if (label)
		return (
			<span
				className={cx("mh-icon", className)}
				style={style}
				role="img"
				aria-label={label}
			/>
		);
	return (
		<span className={cx("mh-icon", className)} style={style} aria-hidden />
	);
}

export function Logo({
	size = 32,
	variant = "lockup",
	tagline = "Tech Lead",
	href,
}: {
	size?: number;
	variant?: "lockup" | "mark";
	tagline?: string | false;
	href?: string;
}) {
	const content = (
		<>
			<span
				className="mh-logo__mark"
				aria-hidden
				style={mask(
					`${ASSET_BASE}/marks/mh-mark.svg`,
					(size * 442) / 348,
					size,
					"var(--logo-mark)",
				)}
			/>
			{variant === "lockup" && (
				<span>
					<span className="mh-logo__name" style={{ fontSize: size * 0.55 }}>
						Mohamed Habib
					</span>
					{tagline !== false && (
						<span
							className="mh-logo__tag"
							style={{ fontSize: Math.max(8, size * 0.22) }}
						>
							{tagline}
						</span>
					)}
				</span>
			)}
		</>
	);
	return href ? (
		<a className="mh-logo" href={href} aria-label="Mohamed Habib, home">
			{content}
		</a>
	) : (
		<span className="mh-logo">{content}</span>
	);
}

export function MarkArt({
	className,
	fill = "var(--accent-soft)",
	position = "center",
}: {
	className?: string;
	fill?: string;
	position?: string;
}) {
	const style = mask(`${ASSET_BASE}/marks/mh-mark.svg`, "100%", "100%", fill);
	return (
		<span
			className={className}
			aria-hidden
			style={{
				...style,
				display: "block",
				WebkitMaskPosition: position,
				maskPosition: position,
			}}
		/>
	);
}

/* ── Actions ── */
type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";
const btnClass = (
	variant: Variant,
	size: Size,
	block?: boolean,
	className?: string,
) =>
	cx(
		"mh-btn",
		`mh-btn--${variant}`,
		size !== "md" && `mh-btn--${size}`,
		block && "mh-btn--block",
		className,
	);

export function Button({
	variant = "primary",
	size = "md",
	block,
	loading,
	leadingIcon,
	trailingIcon,
	className,
	children,
	disabled,
	type = "button",
	...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
	size?: Size;
	block?: boolean;
	loading?: boolean;
	leadingIcon?: IconName;
	trailingIcon?: IconName;
}) {
	const iconSize = size === "lg" ? 20 : 16;
	return (
		<button
			type={type}
			className={btnClass(variant, size, block, className)}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...rest}
		>
			{loading ? (
				<span className="mh-spinner" aria-hidden />
			) : (
				leadingIcon && <Icon name={leadingIcon} size={iconSize} />
			)}
			{children}
			{trailingIcon && !loading && <Icon name={trailingIcon} size={iconSize} />}
		</button>
	);
}

export function LinkButton({
	variant = "primary",
	size = "md",
	block,
	leadingIcon,
	trailingIcon,
	className,
	children,
	...rest
}: ComponentProps<"a"> & {
	variant?: Variant;
	size?: Size;
	block?: boolean;
	leadingIcon?: IconName;
	trailingIcon?: IconName;
}) {
	const iconSize = size === "lg" ? 20 : 16;
	return (
		<a className={btnClass(variant, size, block, className)} {...rest}>
			{leadingIcon && <Icon name={leadingIcon} size={iconSize} />}
			{children}
			{trailingIcon && <Icon name={trailingIcon} size={iconSize} />}
		</a>
	);
}

export function IconButton({
	icon,
	label,
	variant = "ghost",
	size = "md",
	className,
	type = "button",
	...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
	icon: IconName;
	label: string;
	variant?: "ghost" | "outline" | "primary";
	size?: "sm" | "md";
}) {
	return (
		<button
			type={type}
			aria-label={label}
			title={label}
			className={cx(
				"mh-iconbtn",
				variant !== "ghost" && `mh-iconbtn--${variant}`,
				size === "sm" && "mh-iconbtn--sm",
				className,
			)}
			{...rest}
		>
			<Icon name={icon} size={size === "sm" ? 16 : 18} />
		</button>
	);
}

/* ── Display ── */
export function Badge({
	variant = "neutral",
	dot,
	children,
}: {
	variant?: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
	dot?: boolean;
	children: ReactNode;
}) {
	return (
		<span
			className={cx(
				"mh-badge",
				variant !== "neutral" && `mh-badge--${variant}`,
			)}
		>
			{dot && <span className="mh-badge__dot" aria-hidden />}
			{children}
		</span>
	);
}

export function Card({
	eyebrow,
	title,
	footer,
	children,
	className,
	as: As = "article",
}: {
	eyebrow?: string;
	title?: ReactNode;
	footer?: ReactNode;
	children?: ReactNode;
	className?: string;
	as?: "article" | "section" | "div";
}) {
	return (
		<As className={cx("mh-card", className)}>
			{eyebrow && <span className="mh-card__eyebrow">{eyebrow}</span>}
			{title && <h3 className="mh-card__title">{title}</h3>}
			{children && <div className="mh-card__body">{children}</div>}
			{footer && <div className="mh-card__footer">{footer}</div>}
		</As>
	);
}

export function StatCard({
	label,
	value,
	delta,
	trend = "up",
}: {
	label: string;
	value: ReactNode;
	delta?: string;
	trend?: "up" | "down";
}) {
	return (
		<div className="mh-stat">
			<div className="mh-stat__label">{label}</div>
			<div className="mh-stat__value">{value}</div>
			{delta && (
				<span className={`mh-stat__delta mh-stat__delta--${trend}`}>
					<Icon
						name={trend === "up" ? "arrow-up-right" : "arrow-down-right"}
						size={14}
					/>
					{delta}
				</span>
			)}
		</div>
	);
}

export function Avatar({
	name,
	src,
	size = "md",
}: {
	name: string;
	src?: string;
	size?: "sm" | "md" | "lg";
}) {
	const initials = name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((s) => s[0])
		.join("")
		.toUpperCase();
	return (
		<span
			className={cx("mh-avatar", size !== "md" && `mh-avatar--${size}`)}
			role="img"
			aria-label={name}
		>
			{src ? <img src={src} alt="" /> : initials}
		</span>
	);
}

export function ChipList({
	items,
	label,
}: {
	items: string[];
	label?: string;
}) {
	return (
		<ul className="mh-chips" aria-label={label}>
			{items.map((t) => (
				<li key={t}>
					<span className="mh-chip">{t}</span>
				</li>
			))}
		</ul>
	);
}

export function ProgressBar({
	value,
	label,
	showValue,
}: {
	value: number;
	label?: string;
	showValue?: boolean;
}) {
	const v = Math.max(0, Math.min(100, value));
	return (
		<div className="mh-progress">
			{(label || showValue) && (
				<div className="mh-progress__head">
					<span>{label}</span>
					{showValue && <span>{Math.round(v)}%</span>}
				</div>
			)}
			<div
				className="mh-progress__track"
				role="progressbar"
				aria-valuenow={v}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={label}
			>
				<div className="mh-progress__fill" style={{ width: `${v}%` }} />
			</div>
		</div>
	);
}

export function SkillMeter({
	skills,
}: {
	skills: { name: string; level: number }[];
}) {
	return (
		<div className="mh-skills">
			{skills.map((s) => (
				<div key={s.name} className="mh-skill">
					<span>{s.name}</span>
					{/* biome-ignore lint/a11y/useSemanticElements: segmented visual meter from the design system; role=meter keeps the value readable */}
					<span
						className="mh-skill__bar"
						role="meter"
						aria-valuenow={s.level}
						aria-valuemin={0}
						aria-valuemax={5}
						aria-label={`${s.name} level`}
					>
						{[1, 2, 3, 4, 5].map((n) => (
							<span
								key={n}
								className={cx(
									"mh-skill__seg",
									n <= s.level && "mh-skill__seg--on",
								)}
							/>
						))}
					</span>
					<span className="mh-skill__lvl">{s.level}/5</span>
				</div>
			))}
		</div>
	);
}

export function Timeline({
	items,
}: {
	items: { meta?: string; title: string; body?: ReactNode }[];
}) {
	return (
		<ol className="mh-timeline">
			{items.map((it) => (
				<li key={`${it.meta}-${it.title}`} className="mh-timeline__item">
					<span className="mh-timeline__node" aria-hidden />
					<div>
						{it.meta && <div className="mh-timeline__meta">{it.meta}</div>}
						<div className="mh-timeline__title">{it.title}</div>
						{it.body && <div className="mh-timeline__body">{it.body}</div>}
					</div>
				</li>
			))}
		</ol>
	);
}

/** `as="h1"` when the heading is the page's main title (listing pages); sections keep `h2`. */
export function SectionHeading({
	eyebrow,
	title,
	description,
	action,
	id,
	as: Heading = "h2",
}: {
	eyebrow?: string;
	title: string;
	description?: string;
	action?: ReactNode;
	id?: string;
	as?: "h1" | "h2";
}) {
	return (
		<header
			className={cx(
				"mh-section-head",
				Boolean(action) && "mh-section-head--row",
			)}
		>
			<div style={{ display: "grid", gap: 8 }}>
				{eyebrow && <span className="mh-section-head__eyebrow">{eyebrow}</span>}
				<Heading className="mh-section-head__title" id={id}>
					{title}
				</Heading>
				{description && <p className="mh-section-head__desc">{description}</p>}
			</div>
			{action}
		</header>
	);
}

export function EmptyState({
	icon = "inbox",
	title,
	description,
	action,
}: {
	icon?: IconName;
	title: string;
	description?: string;
	action?: ReactNode;
}) {
	return (
		<div className="mh-empty">
			<span className="mh-empty__icon" aria-hidden>
				<Icon name={icon} size={22} />
			</span>
			<div className="mh-empty__title">{title}</div>
			{description && <div className="mh-empty__desc">{description}</div>}
			{action}
		</div>
	);
}

export function Alert({
	variant = "info",
	title,
	children,
	onDismiss,
}: {
	variant?: "info" | "success" | "warning" | "danger" | "brand";
	title?: string;
	children?: ReactNode;
	onDismiss?: () => void;
}) {
	const icon: Record<string, IconName> = {
		info: "info",
		success: "check-circle",
		warning: "alert-triangle",
		danger: "x-circle",
		brand: "bell",
	};
	return (
		<div
			className={`mh-alert mh-alert--${variant}`}
			role={variant === "danger" || variant === "warning" ? "alert" : "status"}
		>
			<Icon name={icon[variant]} size={20} />
			<div>
				{title && <div className="mh-alert__title">{title}</div>}
				{children && <div className="mh-alert__body">{children}</div>}
			</div>
			{onDismiss ? (
				<IconButton icon="x" label="Dismiss" size="sm" onClick={onDismiss} />
			) : (
				<span />
			)}
		</div>
	);
}

/* ── Forms ── */
function FieldShell({
	id,
	label,
	hint,
	error,
	required,
	children,
}: {
	id: string;
	label?: ReactNode;
	hint?: ReactNode;
	error?: string;
	required?: boolean;
	children: ReactNode;
}) {
	return (
		<div className="mh-field">
			{label && (
				<label className="mh-field__label" htmlFor={id}>
					{label}
					{required && (
						<span className="mh-field__req" aria-hidden>
							*
						</span>
					)}
				</label>
			)}
			{children}
			{error ? (
				<span className="mh-field__error" id={`${id}-err`}>
					<Icon name="x-circle" size={14} />
					{error}
				</span>
			) : hint ? (
				<span className="mh-field__hint" id={`${id}-hint`}>
					{hint}
				</span>
			) : null}
		</div>
	);
}

type FieldProps = { label?: ReactNode; hint?: ReactNode; error?: string };
const describedBy = (id: string, p: FieldProps) =>
	p.error ? `${id}-err` : p.hint ? `${id}-hint` : undefined;

export function Input({
	label,
	hint,
	error,
	leadingIcon,
	id: idProp,
	className,
	...rest
}: InputHTMLAttributes<HTMLInputElement> &
	FieldProps & { leadingIcon?: IconName }) {
	const auto = useId();
	const id = idProp ?? auto;
	const input = (
		<input
			id={id}
			className={cx("mh-input", className)}
			aria-invalid={error ? true : undefined}
			aria-describedby={describedBy(id, { error, hint })}
			{...rest}
		/>
	);
	return (
		<FieldShell
			id={id}
			label={label}
			hint={hint}
			error={error}
			required={rest.required}
		>
			{leadingIcon ? (
				<div className="mh-control">
					<Icon name={leadingIcon} size={16} />
					{input}
				</div>
			) : (
				input
			)}
		</FieldShell>
	);
}

export function Textarea({
	label,
	hint,
	error,
	id: idProp,
	className,
	...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) {
	const auto = useId();
	const id = idProp ?? auto;
	return (
		<FieldShell
			id={id}
			label={label}
			hint={hint}
			error={error}
			required={rest.required}
		>
			<textarea
				id={id}
				className={cx("mh-textarea", className)}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy(id, { error, hint })}
				{...rest}
			/>
		</FieldShell>
	);
}

export function Select({
	label,
	hint,
	error,
	options,
	id: idProp,
	className,
	...rest
}: SelectHTMLAttributes<HTMLSelectElement> &
	FieldProps & { options: readonly { value: string; label: string }[] }) {
	const auto = useId();
	const id = idProp ?? auto;
	return (
		<FieldShell
			id={id}
			label={label}
			hint={hint}
			error={error}
			required={rest.required}
		>
			<select
				id={id}
				className={cx("mh-select", className)}
				aria-invalid={error ? true : undefined}
				{...rest}
			>
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</FieldShell>
	);
}

export function Checkbox({
	label,
	description,
	...rest
}: InputHTMLAttributes<HTMLInputElement> & {
	label: ReactNode;
	description?: string;
}) {
	return (
		<label className="mh-check">
			<input type="checkbox" {...rest} />
			<span className="mh-check__box" aria-hidden>
				<Icon name="check" size={13} />
			</span>
			<span>
				{label}
				{description && <span className="mh-check__desc">{description}</span>}
			</span>
		</label>
	);
}

export function Switch({
	label,
	...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
	return (
		<label className="mh-switch">
			<input
				type="checkbox"
				role="switch"
				aria-checked={Boolean(rest.checked)}
				{...rest}
			/>
			<span className="mh-switch__track" aria-hidden />
			{label}
		</label>
	);
}

/** Edits a list of strings as one item per line. */
export function LinesField({
	value,
	onChange,
	...p
}: {
	value: string[];
	onChange: (v: string[]) => void;
	label: string;
	hint?: string;
	rows?: number;
}) {
	return (
		<Textarea
			label={p.label}
			hint={p.hint ?? "One per line."}
			rows={p.rows ?? 4}
			value={value.join("\n")}
			onChange={(e) => onChange(e.target.value.split("\n"))}
			onBlur={() => onChange(value.map((s) => s.trim()).filter(Boolean))}
		/>
	);
}

/* ── Navigation ── */
export function Tabs<T extends string>({
	items,
	value,
	onChange,
	label,
}: {
	items: { id: T; label: string; count?: number }[];
	value: T;
	onChange: (id: T) => void;
	label: string;
}) {
	return (
		<div className="mh-tabs" role="tablist" aria-label={label}>
			{items.map((t) => (
				<button
					key={t.id}
					type="button"
					role="tab"
					className="mh-tab"
					aria-selected={t.id === value}
					tabIndex={t.id === value ? 0 : -1}
					onClick={() => onChange(t.id)}
				>
					{t.label}
					{t.count != null && <span className="mh-tab__count">{t.count}</span>}
				</button>
			))}
		</div>
	);
}

/* ── Theme ── */
export const THEME_STORAGE_KEY = "mh-theme";
/** Inline in <head> before CSS so the first paint uses the right theme. */
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(!t||t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}`;

export function ThemeToggle() {
	const [theme, setTheme] = useState<"light" | "dark" | null>(null);
	useEffect(() => {
		const read = () =>
			setTheme(
				document.documentElement.dataset.theme === "light" ? "light" : "dark",
			);
		read();
		const mo = new MutationObserver(read);
		mo.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
		return () => mo.disconnect();
	}, []);
	const next = theme === "dark" ? "light" : "dark";
	return (
		<button
			type="button"
			className="mh-themetoggle"
			aria-label={`Switch to ${next} theme`}
			title={`Switch to ${next} theme`}
			onClick={() => {
				document.documentElement.dataset.theme = next;
				try {
					localStorage.setItem(THEME_STORAGE_KEY, next);
				} catch {
					/* storage blocked: the theme still applies to this page */
				}
			}}
		>
			<Icon name={theme === "light" ? "moon" : "sun"} size={17} />
		</button>
	);
}

/* ── Overlays ── */
export function Modal({
	open,
	title,
	description,
	onClose,
	footer,
	children,
}: {
	open: boolean;
	title: string;
	description?: string;
	onClose: () => void;
	footer?: ReactNode;
	children?: ReactNode;
}) {
	const id = useId();
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);
	if (!open) return null;
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: scrim click is a mouse shortcut; Escape and the Close button cover keyboard users
		<div
			className="mh-modal-scrim"
			onMouseDown={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="mh-modal" role="dialog" aria-modal aria-labelledby={id}>
				<div className="mh-modal__head">
					<div>
						<h2 className="mh-modal__title" id={id}>
							{title}
						</h2>
						{description && <p className="mh-modal__desc">{description}</p>}
					</div>
					<IconButton icon="x" label="Close" size="sm" onClick={onClose} />
				</div>
				{children && <div className="mh-modal__body">{children}</div>}
				{footer && <div className="mh-modal__foot">{footer}</div>}
			</div>
		</div>
	);
}

/** Confirm before destructive actions. */
export function ConfirmButton({
	label,
	confirmTitle,
	confirmText,
	onConfirm,
	icon = "trash",
}: {
	label: string;
	confirmTitle: string;
	confirmText: string;
	onConfirm: () => Promise<unknown> | unknown;
	icon?: IconName;
}) {
	const [open, setOpen] = useState(false);
	const [busy, setBusy] = useState(false);
	return (
		<>
			<IconButton
				icon={icon}
				label={label}
				size="sm"
				onClick={() => setOpen(true)}
			/>
			<Modal
				open={open}
				title={confirmTitle}
				description={confirmText}
				onClose={() => setOpen(false)}
				footer={
					<>
						<Button variant="ghost" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="danger"
							loading={busy}
							onClick={async () => {
								setBusy(true);
								try {
									await onConfirm();
									setOpen(false);
								} finally {
									setBusy(false);
								}
							}}
						>
							{label}
						</Button>
					</>
				}
			/>
		</>
	);
}
