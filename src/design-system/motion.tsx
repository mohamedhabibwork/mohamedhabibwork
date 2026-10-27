import {
	animate,
	domAnimation,
	LazyMotion,
	m,
	useInView,
	useReducedMotion,
	useSpring,
} from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Site-wide motion primitives on top of motion.dev. Every primitive renders its final state
 * when the visitor prefers reduced motion, and `[data-reveal]` elements are forced visible by a
 * <noscript> style in the root document so content never depends on JavaScript.
 */

/** Easing shared by every entrance so the site moves with one rhythm. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const REVEAL_DISTANCE = 24;
const REVEAL_DURATION = 0.6;
const STAGGER_STEP = 0.08;
const WORD_STEP = 0.035;
const COUNT_DURATION = 1.4;
const MAGNET_PULL = 0.25;
const IN_VIEW = { once: true, margin: "0px 0px -10% 0px" } as const;

/** Loads the DOM animation feature set once; wraps the whole app. */
export function MotionProvider({ children }: { children: ReactNode }) {
	return (
		<LazyMotion features={domAnimation} strict>
			{children}
		</LazyMotion>
	);
}

type RevealTag = "div" | "section" | "li" | "article" | "header";
type From = "up" | "down" | "start" | "none";

const offset = (from: From) => {
	if (from === "down") return { y: -REVEAL_DISTANCE };
	if (from === "start") return { x: -REVEAL_DISTANCE };
	if (from === "none") return {};
	return { y: REVEAL_DISTANCE };
};

/** Fades and slides its children in the first time they scroll into view. */
export function Reveal({
	children,
	as = "div",
	delay = 0,
	from = "up",
	className,
	id,
}: {
	children: ReactNode;
	as?: RevealTag;
	delay?: number;
	from?: From;
	className?: string;
	id?: string;
}) {
	const reduce = useReducedMotion();
	const Tag = m[as];
	if (reduce)
		return (
			<Tag className={className} id={id}>
				{children}
			</Tag>
		);
	return (
		<Tag
			data-reveal
			id={id}
			className={className}
			initial={{ opacity: 0, ...offset(from) }}
			whileInView={{ opacity: 1, x: 0, y: 0 }}
			viewport={IN_VIEW}
			transition={{ duration: REVEAL_DURATION, ease: EASE_OUT, delay }}
		>
			{children}
		</Tag>
	);
}

/** Container whose `StaggerItem` children reveal one after another. */
export function Stagger({
	children,
	className,
	as = "div",
}: {
	children: ReactNode;
	className?: string;
	as?: "div" | "ul" | "ol";
}) {
	const reduce = useReducedMotion();
	const Tag = m[as];
	if (reduce) return <Tag className={className}>{children}</Tag>;
	return (
		<Tag
			className={className}
			initial="hidden"
			whileInView="shown"
			viewport={IN_VIEW}
			variants={{
				hidden: {},
				shown: { transition: { staggerChildren: STAGGER_STEP } },
			}}
		>
			{children}
		</Tag>
	);
}

export function StaggerItem({
	children,
	className,
	as = "div",
}: {
	children: ReactNode;
	className?: string;
	as?: "div" | "li" | "article";
}) {
	const reduce = useReducedMotion();
	const Tag = m[as];
	if (reduce) return <Tag className={className}>{children}</Tag>;
	return (
		<Tag
			data-reveal
			className={className}
			variants={{
				hidden: { opacity: 0, y: REVEAL_DISTANCE },
				shown: {
					opacity: 1,
					y: 0,
					transition: { duration: REVEAL_DURATION, ease: EASE_OUT },
				},
			}}
		>
			{children}
		</Tag>
	);
}

/**
 * Splits a heading into words that rise in sequence. The plain text is kept in a visually
 * hidden span for screen readers; the animated words are hidden from assistive tech.
 */
export function SplitText({
	text,
	className,
	delay = 0,
}: {
	text: string;
	className?: string;
	delay?: number;
}) {
	const reduce = useReducedMotion();
	if (reduce) return <span className={className}>{text}</span>;
	const words = text.split(/\s+/).filter(Boolean);
	return (
		<span className={className}>
			<span className="mh-sr">{text}</span>
			<span aria-hidden>
				{words.map((word, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: words repeat; order is the identity
					<span key={i} className="split-word">
						<m.span
							data-reveal
							className="split-word__inner"
							initial={{ y: "110%" }}
							animate={{ y: 0 }}
							transition={{
								duration: 0.7,
								ease: EASE_OUT,
								delay: delay + i * WORD_STEP,
							}}
						>
							{word}
						</m.span>{" "}
					</span>
				))}
			</span>
		</span>
	);
}

const NUMBER_PARTS = /^(\D*)([\d.,]+)(.*)$/;

/** Counts from 0 up to the number in `value`, keeping any prefix/suffix such as `+` or `%`. */
export function CountUp({
	value,
	className,
}: {
	value: string;
	className?: string;
}) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true });
	const reduce = useReducedMotion();
	const [shown, setShown] = useState(value);

	useEffect(() => {
		const parts = NUMBER_PARTS.exec(value);
		if (!parts || reduce || !inView) return;
		const [, prefix, num, suffix] = parts;
		const target = Number(num.replace(/,/g, ""));
		if (!Number.isFinite(target)) return;
		const decimals = num.includes(".") ? (num.split(".")[1]?.length ?? 0) : 0;
		const controls = animate(0, target, {
			duration: COUNT_DURATION,
			ease: EASE_OUT,
			onUpdate: (v) => setShown(`${prefix}${v.toFixed(decimals)}${suffix}`),
		});
		return () => controls.stop();
	}, [inView, reduce, value]);

	return (
		<span ref={ref} className={className}>
			{shown}
		</span>
	);
}

/** Pulls its child slightly towards the mouse pointer on hover. */
export function Magnetic({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const reduce = useReducedMotion();
	const x = useSpring(0, { stiffness: 300, damping: 20 });
	const y = useSpring(0, { stiffness: 300, damping: 20 });
	if (reduce) return <span className={className}>{children}</span>;
	return (
		<m.span
			className={className}
			style={{ x, y, display: "inline-flex" }}
			onPointerMove={(e) => {
				if (e.pointerType !== "mouse") return;
				const r = e.currentTarget.getBoundingClientRect();
				x.set((e.clientX - r.left - r.width / 2) * MAGNET_PULL);
				y.set((e.clientY - r.top - r.height / 2) * MAGNET_PULL);
			}}
			onPointerLeave={() => {
				x.set(0);
				y.set(0);
			}}
		>
			{children}
		</m.span>
	);
}

/**
 * Fades each route in on client-side navigation; keyed by pathname in the site layout.
 * The server-rendered first page starts visible so the largest paint never waits on JavaScript.
 */
export function PageTransition({
	children,
	routeKey,
}: {
	children: ReactNode;
	routeKey: string;
}) {
	const reduce = useReducedMotion();
	const firstRoute = useRef(routeKey);
	if (reduce) return <>{children}</>;
	return (
		<m.div
			key={routeKey}
			initial={routeKey === firstRoute.current ? false : { opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: EASE_OUT }}
		>
			{children}
		</m.div>
	);
}

/** Thin bar at the top of the viewport that tracks how far the page has been read. */
export function ScrollProgress() {
	const reduce = useReducedMotion();
	const progress = useSpring(0, { stiffness: 200, damping: 30 });
	useEffect(() => {
		const onScroll = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight;
			progress.set(max > 0 ? window.scrollY / max : 0);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [progress]);
	if (reduce) return null;
	return (
		<m.div
			className="scroll-progress"
			style={{ scaleX: progress }}
			aria-hidden
		/>
	);
}
