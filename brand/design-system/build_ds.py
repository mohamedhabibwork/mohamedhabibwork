"""Generate the MH design system's component previews, guidelines, types, cover and test harness.

Hand-written sources: project/tokens.json, project/components/bundle.{js,css}.
Run: python3 build_ds.py  → writes project/components/<Comp>/{preview.html,README.md},
project/components/index.d.ts, project/components/Cover/preview.html, and _test/index.html
(a local page that renders every preview with a compiled tokens.css).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent
P = ROOT / "project"
COMP = P / "components"

# name: (group, height, summary + guidelines markdown, props d.ts body, demo JS returning an element)
C = {}


def comp(name, group, height, readme, props, demo):
    C[name] = (group, height, readme.strip(), props.strip("\n"), demo.strip())


comp("Logo", "Brand", 150, """
The MH monogram, alone or locked up with the name and "TECH LEAD", drawn from the master artwork in `brand/logo`.

- The mark fills with `logo-mark`: lime on dark, ink on light (lime is 1.2:1 on white). `tone="mono"` forces one-colour `text`.
- Keep clear space equal to the mark's crossbar height (about 1/6 of the mark's height) on every side.
- The mark is drawn from **Assets → Marks → mh-mark.svg** (as a mask, so it takes `logo-mark`); replace that file and every Logo, Hero, ProjectCard and SignInPage updates. Built-in vectors are only the fallback before assets load.
- Never recolour, stretch, outline or add effects; use the files in Assets → Logos for print and decks.
- Consumer provides: `href` when it links home.
""", """
  variant?: "lockup" | "mark";
  /** Mark height in px; the wordmark scales from it. Default 40. */
  size?: number;
  tone?: "brand" | "mono";
  name?: string;
  /** Tagline under the name; `false` hides it. */
  tagline?: string | false;
  href?: string;
  /** Use this file instead of Assets → Marks/mh-mark.svg. */
  markSrc?: string;
""", """
h("div",{className:"mh-stack"},
  h(M.Logo,{size:44}),
  h("div",{className:"mh-row"},h(M.Logo,{variant:"mark",size:36}),h(M.Logo,{variant:"mark",size:36,tone:"mono"}),h(M.Logo,{size:28,tone:"mono"})))
""")

comp("Icon", "Brand", 150, """
Stroke icons on a 24px grid in the Lucide idiom (1.75 stroke, round caps), inheriting `currentColor`.

- Default colour is the surrounding text; use `text-muted` for decorative icons and `accent-text` for active ones.
- Sizes: 14 (badges), 16 (buttons sm/md, inputs), 18 (default), 20 (alerts, buttons lg).
- Pass `label` only when the icon carries meaning on its own; otherwise it is hidden from assistive tech.
- Each glyph is the file **Assets → Icons → `<name>`.svg**, drawn as a mask so it takes `currentColor`. Replace a file there and every component using that icon changes. The built-in paths are only the fallback before assets load.
- `MH.Icon.names` lists every glyph. For anything missing, add an SVG to Assets → Icons (24px, 1.75 stroke) or use lucide-react with the same stroke.
""", """
  name: "check" | "x" | "chevron-left" | "chevron-right" | "chevron-down" | "search" | "info" | "alert-triangle" | "check-circle" | "x-circle" | "plus" | "arrow-right" | "arrow-up-right" | "arrow-down-right" | "mail" | "code" | "menu" | "bell" | "trash" | "download" | "external-link" | "calendar" | "inbox" | "user" | "settings" | "github" | "linkedin";
  size?: number;
  strokeWidth?: number;
  /** Accessible name; omit for decorative icons. */
  label?: string;
  /** Use this file instead of Assets → Icons/<name>.svg. */
  src?: string;
  className?: string;
""", """
h("div",{className:"mh-row",style:{gap:16,color:"var(--text-muted)"}},M.Icon.names.map(n=>h("span",{key:n,title:n},h(M.Icon,{name:n,size:20}))))
""")

comp("Button", "Actions", 230, """
The action trigger, in LEAP's five variants and three sizes, restyled for MH: lime primary, square-cut 4px corners.

- One `primary` per view. `secondary` for the next most likely action, `outline` for neutral ones, `ghost` inside dense toolbars, `danger` only for destructive confirmation.
- `loading` swaps the leading icon for a spinner and sets `aria-busy`; the label stays so width doesn't jump.
- Labels: sentence case, verb first ("Deploy to staging"), no trailing punctuation.
- Consumer provides: the label, an optional icon name, and the handler.
""", """
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  block?: boolean;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent) => void;
  children: ReactNode;
""", """
h("div",{className:"mh-stack"},
  h("div",{className:"mh-row"},h(M.Button,{trailingIcon:"arrow-right"},"Hire me"),h(M.Button,{variant:"secondary"},"Résumé"),h(M.Button,{variant:"outline",leadingIcon:"github"},"GitHub"),h(M.Button,{variant:"ghost"},"Cancel")),
  h("div",{className:"mh-row"},h(M.Button,{size:"sm"},"Small"),h(M.Button,{size:"lg"},"Large"),h(M.Button,{loading:true},"Deploying"),h(M.Button,{variant:"danger",leadingIcon:"trash",size:"sm"},"Delete"),h(M.Button,{disabled:true,size:"sm"},"Disabled")))
""")

comp("IconButton", "Actions", 100, """
A square button holding one icon, for toolbars and dismiss controls.

- `label` is required: it becomes the accessible name and the native tooltip.
- `ghost` (default) in toolbars, `outline` when it stands alone, `primary` for a single floating action.
""", """
  icon: IconName;
  label: string;
  variant?: "ghost" | "outline" | "primary";
  size?: "sm" | "md";
  onClick?: (e: MouseEvent) => void;
""", """
h("div",{className:"mh-row"},h(M.IconButton,{icon:"menu",label:"Menu"}),h(M.IconButton,{icon:"bell",label:"Notifications",variant:"outline"}),h(M.IconButton,{icon:"plus",label:"New",variant:"primary"}),h(M.IconButton,{icon:"x",label:"Close",size:"sm"}))
""")

comp("Badge", "Display", 100, """
A short uppercase status label, in LEAP's six tones but with 2px corners like the mark's cuts.

- State colours tint both text and ground so they stay legible in both themes; never rely on colour alone, so keep the word.
- `dot` adds a status dot for live states ("Live", "Online").
- One or two words; uppercase is applied by CSS, so write it in sentence case.
""", """
  variant?: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
  dot?: boolean;
  children: ReactNode;
""", """
h("div",{className:"mh-row"},h(M.Badge,{variant:"brand"},"Tech lead"),h(M.Badge,null,"Draft"),h(M.Badge,{variant:"success",dot:true},"Live"),h(M.Badge,{variant:"warning"},"Pending"),h(M.Badge,{variant:"danger"},"Failed"),h(M.Badge,{variant:"info"},"Beta"))
""")

comp("Avatar", "Display", 110, """
A person's photo or initials in a circle, with an optional presence dot. `AvatarGroup` stacks several and collapses the rest into "+N".

- Initials come from the first two words of `name` (Barlow, lime on `accent-soft`).
- `name` is always required: it is the accessible label even when a photo is shown.
""", """
  name: string;
  src?: string;
  /** Name of a picture in Assets → Images, e.g. "profile". */
  photoAsset?: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "away" | "offline";
""", """
h("div",{className:"mh-row",style:{gap:20}},h(M.Avatar,{name:"Mohamed Habib",size:"lg",status:"online",photoAsset:"profile"}),h(M.Avatar,{name:"Sara Ali",status:"away"}),h(M.Avatar,{name:"Omar K",size:"sm"}),h(M.AvatarGroup,{names:["Ana B","Lee C","Ravi D","Mia E","Tom F","Zed G"],max:4}))
""")

comp("AvatarGroup", "Display", 90, """
Overlapping avatars for a team or attendee list; anything past `max` collapses into "+N".
""", """
  names: string[];
  max?: number;
  size?: "sm" | "md" | "lg";
""", """
h(M.AvatarGroup,{names:["Ana B","Lee C","Ravi D","Mia E","Tom F","Zed G","Kai H"],max:5})
""")

comp("Card", "Layout", 270, """
A bordered container on `surface-raised`: borders, not shadows, 8px corners, `space-6` padding.

- `eyebrow` is the wide-tracked Barlow kicker, as in "TECH LEAD".
- `interactive` makes the whole card focusable with a lime border on hover; put a single link or action inside, not several.
- Consumer provides: the body, and an optional `footer` row of actions or meta.
""", """
  eyebrow?: string;
  title?: string;
  interactive?: boolean;
  footer?: ReactNode;
  as?: "article" | "section" | "div";
  children?: ReactNode;
""", """
h(M.Card,{eyebrow:"Case study",title:"LEAP platform",interactive:true,footer:[h(M.Badge,{key:1,variant:"brand"},"Bun"),h(M.Badge,{key:2},"Elysia"),h(M.Badge,{key:3},"Flutter")]},"An LMS and professional network in English and Arabic: clean architecture, one mutation pipeline, web and mobile.")
""")

comp("StatCard", "Display", 150, """
One headline number with its label and change, for dashboards and résumé highlights.

- The value is Barlow ExtraBold; keep it short ("82%", "1,446", "12 yrs").
- `trend` picks the delta colour and arrow; say what the delta compares to in the label or a hint nearby.
""", """
  label: string;
  value: ReactNode;
  delta?: string;
  trend?: "up" | "down";
""", """
h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},h(M.StatCard,{label:"Test coverage",value:"82%",delta:"+4.1 pts",trend:"up"}),h(M.StatCard,{label:"p95 latency",value:"184ms",delta:"-38ms",trend:"down"}))
""")

comp("ProgressBar", "Display", 120, """
A determinate progress bar: `accent-indicator` fill on a `surface-field` track.

- Always give a `label`; add `showValue` when the exact number matters.
- For unknown durations use `Spinner` or `Skeleton` instead.
""", """
  value: number;
  label?: string;
  showValue?: boolean;
""", """
h("div",{className:"mh-stack"},h(M.ProgressBar,{label:"Course progress",value:64,showValue:true}),h(M.ProgressBar,{label:"Upload",value:22}))
""")

comp("Stepper", "Navigation", 110, """
Numbered steps for a linear flow (checkout, onboarding). Done and current steps carry the lime rule; the current step is announced with `aria-current="step"`.
""", """
  steps: string[];
  /** Zero-based index of the current step. */
  current: number;
""", """
h(M.Stepper,{steps:["Account","Profile","Plan","Confirm"],current:2})
""")

comp("Timeline", "Display", 260, """
A vertical list of dated events (career history, changelog) with the mark's slanted parallelogram as the node.
""", """
  items: { title: string; meta?: string; body?: string }[];
""", """
h(M.Timeline,{items:[{meta:"2024 — now",title:"Tech Lead, LEAP",body:"Platform architecture across API, web and mobile."},{meta:"2020 — 2024",title:"Senior Full-Stack Developer",body:"Laravel, Vue and TypeScript products."},{meta:"2016",title:"First production deploy"}]})
""")

comp("Tabs", "Navigation", 110, """
Switches between views of the same content. The selected tab gets `text` colour and a 2px `accent-indicator` rule.

- Uncontrolled by default (`defaultValue`); pass `value` + `onChange` to control it.
- Keep to 2–6 short labels; `count` shows a quiet number.
""", """
  items: { id: string; label: string; count?: number }[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  label?: string;
""", """
h(M.Tabs,{label:"Profile sections",items:[{id:"work",label:"Work",count:12},{id:"writing",label:"Writing",count:4},{id:"talks",label:"Talks"},{id:"about",label:"About"}]})
""")

comp("Pagination", "Navigation", 100, """
Page navigation for lists and tables; collapses long ranges with an ellipsis. The current page is the one lime fill.
""", """
  pageCount: number;
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
""", """
h(M.Pagination,{pageCount:12,defaultPage:5})
""")

comp("Breadcrumb", "Navigation", 90, """
Shows where a page sits in the hierarchy. The last item is the current page and is not a link.
""", """
  items: { label: string; href?: string }[];
""", """
h(M.Breadcrumb,{items:[{label:"Home"},{label:"Projects"},{label:"LEAP"},{label:"Architecture"}]})
""")

comp("Navbar", "Navigation", 120, """
The site header: logo lockup on the left, primary links on the right, one optional action.

- The active link uses `accent-text` and `aria-current="page"`.
- Keep to five links; collapse to a `menu` IconButton under 720px (consumer's responsibility).
""", """
  links: { label: string; href?: string }[];
  active?: string;
  action?: ReactNode;
  homeHref?: string;
  tagline?: string | false;
""", """
h(M.Navbar,{logoSize:26,links:[{label:"Work"},{label:"Writing"},{label:"About"}],active:"Work",action:h(M.Button,{size:"sm"},"Contact")})
""")

comp("Input", "Forms", 230, """
A single-line text field with label, hint and error, on `surface-field` with a `line-strong` border and the lime focus ring.

- Always pass `label`; placeholder text is an example, never the label.
- `error` replaces the hint, sets `aria-invalid` and links the message with `aria-describedby`.
- `leadingIcon` for search, email or currency fields.
""", """
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  leadingIcon?: IconName;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
""", """
h("div",{className:"mh-stack"},h(M.Input,{label:"Email",required:true,leadingIcon:"mail",placeholder:"you@company.com",hint:"I reply within a day."}),h(M.Input,{label:"Website",defaultValue:"habib.dev/",error:"Enter a full URL, e.g. https://habib.dev"}))
""")

comp("Textarea", "Forms", 190, """
Multi-line text with the same label, hint and error contract as `Input`; resizes vertically.
""", """
  label?: string;
  hint?: string;
  error?: string;
  rows?: number;
  placeholder?: string;
""", """
h(M.Textarea,{label:"Project brief",placeholder:"What are you building?",hint:"Markdown supported."})
""")

comp("Select", "Forms", 120, """
A native select styled like `Input`. Use for 4–15 options; fewer, use `RadioGroup`; more, a searchable combobox.
""", """
  label?: string;
  options: { value: string; label: string }[];
  hint?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
""", """
h(M.Select,{label:"Engagement",options:[{value:"lead",label:"Technical leadership"},{value:"arch",label:"Architecture review"},{value:"build",label:"Build an MVP"}]})
""")

comp("SearchInput", "Forms", 90, """
A search field with a leading icon and an optional keyboard-shortcut hint (`⌘K`). Wrapped in `role="search"`.
""", """
  placeholder?: string;
  shortcut?: string;
  label?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
""", """
h(M.SearchInput,{placeholder:"Search projects",shortcut:"⌘K"})
""")

comp("OtpInput", "Forms", 110, """
One box per digit for one-time codes, as in LEAP's OTP sign-in. Typing advances, Backspace on an empty box goes back, and the first box carries `autocomplete="one-time-code"`.
""", """
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  error?: boolean;
  label?: string;
""", """
h(M.OtpInput,{length:6,defaultValue:"4821"})
""")

comp("Checkbox", "Forms", 140, """
An independent on/off choice with an optional description. Checked = lime box with an ink tick.
""", """
  label: ReactNode;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
""", """
h("div",{className:"mh-stack"},h(M.Checkbox,{label:"Send me the newsletter",defaultChecked:true}),h(M.Checkbox,{label:"Share my profile",description:"Recruiters can see your work history."}),h(M.Checkbox,{label:"Disabled",disabled:true}))
""")

comp("RadioGroup", "Forms", 170, """
One choice from 2–5 visible options, in a `fieldset` with a `legend`.
""", """
  label?: string;
  options: { value: string; label: string; description?: string; disabled?: boolean }[];
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (value: string) => void;
""", """
h(M.RadioGroup,{label:"Availability",defaultValue:"part",options:[{value:"full",label:"Full-time"},{value:"part",label:"Part-time",description:"Up to 20 hours a week"},{value:"none",label:"Not available"}]})
""")

comp("Switch", "Forms", 100, """
An immediate on/off setting (no Save button). For choices that need confirming, use `Checkbox`.
""", """
  label: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
""", """
h("div",{className:"mh-row",style:{gap:24}},h(M.Switch,{label:"Open to work",defaultChecked:true}),h(M.Switch,{label:"Dark mode"}))
""")

comp("Alert", "Feedback", 310, """
An inline message about the page or a section, in five tones. Danger and warning are announced (`role="alert"`); others are polite.

- Title states what happened; body says what to do.
- `onDismiss` adds a close button; don't make errors dismissible until fixed.
""", """
  variant?: "info" | "success" | "warning" | "danger" | "brand";
  title?: string;
  onDismiss?: () => void;
  children?: ReactNode;
""", """
h("div",{className:"mh-stack",style:{gap:10}},h(M.Alert,{variant:"brand",title:"New: case study published"},"Read how LEAP ships web and mobile from one API."),h(M.Alert,{variant:"success",title:"Deployed to staging"}),h(M.Alert,{variant:"warning",title:"Certificate expires in 7 days"}),h(M.Alert,{variant:"danger",title:"Build failed",onDismiss:()=>{}},"Type errors in 3 files."))
""")

comp("Toast", "Feedback", 170, """
A brief confirmation on the inverse surface, with a lime bar (critical for errors) and an optional action such as Undo.

- Auto-dismiss after 5s unless it has an action; stack bottom-right, newest on top (the host is the consumer's).
""", """
  title: string;
  description?: string;
  variant?: "default" | "danger";
  actionLabel?: string;
  onAction?: () => void;
""", """
h("div",{className:"mh-stack",style:{gap:10}},h(M.Toast,{title:"Message sent",description:"I'll get back to you soon.",actionLabel:"Undo"}),h(M.Toast,{variant:"danger",title:"Couldn't save draft"}))
""")

comp("Modal", "Feedback", 330, """
A dialog over an `overlay` scrim, for confirmations and short forms.

- Title asks or states; the footer holds at most two buttons, primary last.
- Clicking the scrim calls `onClose`. The consumer handles focus trap and Escape (or uses a headless dialog primitive).
- `inline` renders it in flow (for docs and previews).
""", """
  open?: boolean;
  title: string;
  description?: string;
  footer?: ReactNode;
  onClose?: () => void;
  inline?: boolean;
  children?: ReactNode;
""", """
h(M.Modal,{inline:true,title:"Delete project?",description:"This removes LEAP from your portfolio. It can't be undone.",onClose:()=>{},footer:[h(M.Button,{key:1,variant:"ghost"},"Cancel"),h(M.Button,{key:2,variant:"danger"},"Delete")]})
""")

comp("Tooltip", "Feedback", 120, """
A short label on hover or focus, on the inverse surface. Text only, never interactive content; don't hide essential information in it.
""", """
  content: ReactNode;
  open?: boolean;
  children: ReactElement;
""", """
h("div",{className:"mh-row",style:{paddingTop:34,gap:40}},h(M.Tooltip,{content:"Copy link",open:true},h(M.IconButton,{icon:"external-link",label:"Copy link",variant:"outline"})),h(M.Tooltip,{content:"Download PDF"},h(M.Button,{variant:"outline",size:"sm",leadingIcon:"download"},"Résumé")))
""")

comp("Spinner", "Feedback", 90, """
An indeterminate loading indicator with an accessible "Loading" label. Prefer `Skeleton` when the layout is known.
""", """
  size?: "sm" | "md" | "lg";
  label?: string;
""", """
h("div",{className:"mh-row",style:{gap:20}},h(M.Spinner,{size:"sm"}),h(M.Spinner,null),h(M.Spinner,{size:"lg"}))
""")

comp("Skeleton", "Feedback", 110, """
A shimmering placeholder in the shape of the content to come; slows down under reduced motion.
""", """
  lines?: number;
  avatar?: boolean;
""", """
h(M.Skeleton,{avatar:true,lines:3})
""")

comp("EmptyState", "Feedback", 280, """
What a list shows when it has nothing yet: a slanted lime icon tile, a title, one sentence, and the action that fills it.
""", """
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
""", """
h(M.EmptyState,{icon:"code",title:"No projects yet",description:"Add your first project to show it on your portfolio.",action:h(M.Button,{size:"sm",leadingIcon:"plus"},"Add project")})
""")

comp("DataTable", "Data", 240, """
A simple data table: Barlow uppercase headers on `surface-field`, hairline rows, numbers in JetBrains Mono aligned to the end, lime-tinted hover.

- Columns with `align: "end"` are numeric. `render` returns any node (badges, links).
- Provide `caption` for screen readers.
""", """
  columns: { key: string; label: string; align?: "start" | "end"; render?: (row: any) => ReactNode }[];
  rows: Record<string, any>[];
  caption?: string;
""", """
h(M.DataTable,{caption:"Services",columns:[{key:"svc",label:"Service"},{key:"status",label:"Status",render:r=>h(M.Badge,{variant:r.ok?"success":"danger",dot:true},r.ok?"Healthy":"Down")},{key:"p95",label:"p95 ms",align:"end"}],rows:[{svc:"api",ok:true,p95:184},{svc:"web",ok:true,p95:96},{svc:"worker",ok:false,p95:1204}]})
""")

comp("CodeBlock", "Data", 150, """
A monospace block for commands and snippets, with an optional lime `$` prompt; lines starting with `#` render as comments.
""", """
  code: string;
  prompt?: boolean;
""", """
h(M.CodeBlock,{prompt:true,code:"# scaffold a resource\\nbun run make:module courses\\nbun run check"})
""")


exec(open(ROOT / "components_more.py").read())
exec(open(ROOT / "components_cv.py").read())

PREVIEW = """<!-- @dsCard group="{group}" height={height} -->
<div class="mh-pv-single"><section class="mh-pv"><div class="mh-pv__toggle" id="t"></div><div id="d"></div></section></div>
<script>
(function () {{
  var h = React.createElement, M = window.MH;
  function Demo() {{
    return {demo};
  }}
  M.loadAssets("../../design-system.json");
  ReactDOM.createRoot(document.getElementById("t")).render(h(M.ThemeToggle, {{ persist: false }}));
  ReactDOM.createRoot(document.getElementById("d")).render(h(Demo));
}})();
</script>
"""


def write_components():
    dts = ["/** MH design system — React components (window.MH). Props are documentation; the bundle is plain JS. */",
           "import type { ReactNode, ReactElement, MouseEvent, ChangeEvent } from \"react\";",
           "",
           "export type IconName = " + C["Icon"][3].split("name: ")[1].split(";")[0].strip() + ";",
           ""]
    for name, (group, height, readme, props, demo) in C.items():
        if name in ("Logo", "Icon"):
            continue
        d = COMP / name
        d.mkdir(parents=True, exist_ok=True)
        (d / "preview.html").write_text(PREVIEW.format(group=group, height=height + 56, demo=demo).replace(" -->", " width=1280 -->" if group == "Pages" else " -->", 1))
        (d / "README.md").write_text(f"# {name}\n\n{readme}\n")
        body = re.sub(r"name: \"check\"[^;]*;", "name: IconName;", props) if name == "Icon" else props
        dts.append(f"export interface {name}Props {{\n{body}\n}}")
        dts.append(f"export declare function {name}(props: {name}Props): ReactElement;\n")
    (COMP / "index.d.ts").write_text("\n".join(dts))


def test_harness():
    """A local page compiling tokens.json the way the artifact page does, rendering every preview."""
    t = json.loads((P / "tokens.json").read_text())
    themes = [th["id"] for th in t["color"]["themes"]]

    def cval(v, th):
        if isinstance(v, str):
            return v if th == themes[0] else None
        return v.get(th)

    def css_v(v):
        m = re.fullmatch(r"\{(.+)\}", v)
        return f"var(--{m.group(1)})" if m else v

    blocks = []
    for i, th in enumerate(themes):
        sel = f':root, [data-theme="{th}"]' if i == 0 else f'[data-theme="{th}"]'
        lines = []
        for fam in ("color", "shadow"):
            for tok in t[fam]["tokens"]:
                v = cval(tok["value"], th)
                if v is None and i == 0:
                    continue
                if v is None:
                    if isinstance(tok["value"], str) and "{" in tok["value"]:
                        v = tok["value"]
                    else:
                        continue
                lines.append(f"  --{tok['name']}: {css_v(v)};")
        blocks.append(sel + " {\n" + "\n".join(lines) + "\n}")
    root = []
    for fam in ("spacing", "radius", "zIndex"):
        for tok in t[fam]["tokens"]:
            root.append(f"  --{tok['name']}: {tok['value']};")
    for k, v in t["type"]["families"].items():
        root.append(f"  --font-{k}: {v};")
    blocks.append(":root {\n" + "\n".join(root) + "\n}")
    for f in t["type"]["fonts"]:
        blocks.append(f"@font-face {{ font-family: \"{f['family']}\"; src: url(../project/{f['file']}) format(\"woff2\"); font-weight: {f['weight']}; font-display: swap; }}")
    out = ROOT / "_test"
    out.mkdir(exist_ok=True)
    (out / "tokens.css").write_text("\n".join(blocks))
    frames = "\n".join(
        f'<h2>{n}</h2><iframe src="frame.html?c={n}" style="width:100%;height:{C[n][1] + 56}px;border:1px solid #888"></iframe>'
        for n in C)
    (out / "index.html").write_text(f"<!doctype html><meta charset=utf-8><title>MH previews</title><body style='font-family:sans-serif;background:#555;color:#fff;margin:16px'>{frames}")
    (out / "frame.html").write_text("""<!doctype html><html data-theme="dark"><meta charset=utf-8>
<link rel=stylesheet href="tokens.css"><link rel=stylesheet href="../project/components/bundle.css">
<style>html,body{margin:0;height:100%}</style>
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="../project/components/bundle.js"></script>
<body><div id=host></div><script>
var c=new URLSearchParams(location.search).get('c');
fetch('../project/components/'+c+'/preview.html').then(r=>r.text()).then(function(t){
  var host=document.getElementById('host'); host.innerHTML=t.replace(/<script>[\\s\\S]*<\\/script>/,'');
  var code=/<script>([\\s\\S]*)<\\/script>/.exec(t)[1]; try{ new Function(code)(); }catch(e){ host.insertAdjacentHTML('beforeend','<pre style=color:red>'+e+'</pre>'); console.error(c,e); }
});
</script></body></html>""")


if __name__ == "__main__":
    write_components()
    test_harness()
    print(len(C), "components")
