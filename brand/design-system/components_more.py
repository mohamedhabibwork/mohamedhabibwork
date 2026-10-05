# Specs for the theme, portfolio, admin and page components. exec()'d by build_ds.py (shares comp, C, re).
_js = (ROOT / "project/components/bundle.js").read_text()
_icons = __import__("json").loads(re.search(r'var ICON_NAMES = (\[.*?\]);', _js).group(1))
_union = " | ".join(f'"{n}"' for n in dict.fromkeys(_icons))
_g, _hgt, _rd, _pr, _dm = C["Icon"]
C["Icon"] = (_g, _hgt, _rd, re.sub(r'name: "check"[^;]*;', f"name: {_union};", _pr), _dm)

comp("ThemeToggle", "Theme", 120, """
Switches the colour theme by setting `data-theme="light" | "dark"` on `<html>` (or `target`). The choice is saved to `localStorage` (`mh-theme`) and defaults to the OS setting.

- `variant="icon"` (default): one square button that flips light and dark; the icon shows the theme you'll switch *to*, and the label says so.
- `variant="segmented"`: Light / Dark / System. Use it in settings pages; `withSystem={false}` drops System.
- Put the icon toggle in the site header and admin top bar, once per page. Every preview in this system carries one in its corner.
- It stays in sync if anything else changes `data-theme`. `MH.useTheme()` gives `{ theme, preference, setTheme, toggle }` for custom controls.
- To avoid a flash of the wrong theme, set `data-theme` in a blocking inline script in `<head>` from the same `localStorage` key before the bundle loads.
""", """
  variant?: "icon" | "segmented";
  /** Element that receives data-theme. Default document.documentElement. */
  target?: HTMLElement;
  /** Save the preference to localStorage. Default true. */
  persist?: boolean;
  storageKey?: string;
  defaultValue?: "light" | "dark" | "system";
  withSystem?: boolean;
  iconOnly?: boolean;
  label?: string;
""", """
h("div",{className:"mh-row",style:{gap:16}},h(M.ThemeToggle,{persist:false}),h(M.ThemeToggle,{variant:"segmented",persist:false}),h(M.ThemeToggle,{variant:"segmented",iconOnly:true,withSystem:false,persist:false}))
""")

comp("SegmentedControl", "Forms", 90, """
Two to five mutually exclusive options shown as one control (view modes, ranges, units). Built as a radio group, so arrow keys and screen readers treat it as one choice.
""", """
  options: { value: string; label: string; icon?: IconName }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
""", """
h("div",{className:"mh-row",style:{gap:16}},h(M.SegmentedControl,{label:"Range",options:[{value:"7d",label:"7d"},{value:"30d",label:"30d"},{value:"90d",label:"90d"}],defaultValue:"30d"}),h(M.SegmentedControl,{label:"View",options:[{value:"grid",label:"Grid",icon:"layout"},{value:"list",label:"List",icon:"menu"}]}))
""")

comp("LanguageSwitch", "Theme", 90, """
EN / عربي switch. By default it sets `lang` and `dir="rtl"` on `<html>`, and the layout mirrors through logical properties; Readex Pro takes over for Arabic text automatically through the font stacks.
""", """
  value?: "en" | "ar";
  defaultValue?: "en" | "ar";
  onChange?: (lang: "en" | "ar") => void;
  /** Set lang/dir on <html>. Default true. */
  applyToDocument?: boolean;
""", """
h(M.LanguageSwitch,{applyToDocument:false})
""")

# ── Site / portfolio ──
comp("Hero", "Site", 450, """
The opening block of a page: eyebrow, an uppercase Barlow headline with one lime-highlighted phrase, a lead sentence and up to two actions, over a faint trace of the mark.

- `highlight` is the phrase in lime: one or two words, the payoff ("ship.").
- One primary and one outline action at most.
""", """
  eyebrow?: string;
  title: string;
  highlight?: string;
  lead?: string;
  actions?: ReactNode;
  /** Show the mark trace. Default true. */
  art?: boolean;
  children?: ReactNode;
""", """
h(M.Hero,{eyebrow:"Tech Lead · Cairo / Remote",title:"I build platforms that",highlight:"ship.",lead:"Twelve years turning product ideas into reliable systems for web and mobile.",actions:[h(M.Button,{key:1,size:"lg",trailingIcon:"arrow-right"},"See my work"),h(M.Button,{key:2,size:"lg",variant:"outline",leadingIcon:"download"},"Résumé")]})
""")

comp("SectionHeading", "Site", 140, """
Eyebrow + Barlow title + optional description, opening every page section. Pass `action` for a right-aligned link such as "All projects".
""", """
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
""", """
h(M.SectionHeading,{eyebrow:"Selected work",title:"Case studies",description:"Platforms I've led from first commit to production.",action:h(M.Button,{variant:"ghost",trailingIcon:"arrow-right"},"All projects")})
""")

comp("ProjectCard", "Site", 380, """
A portfolio case-study tile: 16:9 media (or the mark as placeholder), category and year, title with an arrow, one-line summary and stack chips. The whole card is one link.
""", """
  title: string;
  href?: string;
  image?: string;
  /** Name of a picture in Assets → Images, e.g. "project-leap". */
  imageAsset?: string;
  category?: string;
  year?: string;
  description?: string;
  tags?: string[];
""", """
h("div",{className:"mh-grid-3"},h(M.ProjectCard,{category:"EdTech",year:"2026",title:"LEAP platform",imageAsset:"project-leap",description:"LMS and professional network in English and Arabic.",tags:["Bun","Elysia","Flutter"]}),h(M.ProjectCard,{category:"Fintech",year:"2024",title:"Ledger core",imageAsset:"project-ledger",description:"Double-entry ledger with audit trails.",tags:["Postgres","Go"]}))
""")

comp("Chip", "Display", 90, """
A compact tag. Static (stack, topics), removable (`onRemove`, used by TagInput) or a toggle filter (`onClick` + `active`, with `aria-pressed`).
""", """
  children: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
""", """
h("div",{className:"mh-row",style:{gap:8}},h(M.Chip,null,"TypeScript"),h(M.Chip,{active:true,onClick:()=>{}},"Published"),h(M.Chip,{onClick:()=>{}},"Drafts"),h(M.Chip,{onRemove:()=>{}},"Laravel"))
""")

comp("ChipList", "Display", 80, """
A list of static chips, used for stacks and topics.
""", """
  items: string[];
  label?: string;
""", """
h(M.ChipList,{label:"Stack",items:["TypeScript","Bun","Elysia","Postgres","Flutter","Cloudflare"]})
""")

comp("ServiceCard", "Site", 310, """
One offering: slanted lime icon tile, title, one sentence and up to four included points.
""", """
  icon?: IconName;
  title: string;
  description?: string;
  points?: string[];
""", """
h("div",{className:"mh-grid-3"},h(M.ServiceCard,{icon:"layers",title:"Architecture",description:"Systems that survive the second year.",points:["Domain modelling","Clean layers","ADRs"]}),h(M.ServiceCard,{icon:"users",title:"Technical leadership",description:"Teams that ship calmly.",points:["Hiring loops","Review culture"]}))
""")

comp("Testimonial", "Site", 230, """
A quote from a client or colleague with their name and role. Keep quotes to two or three sentences and real.
""", """
  quote: string;
  name: string;
  role?: string;
  avatar?: string;
  avatarAsset?: string;
""", """
h(M.Testimonial,{quote:"Mohamed turned a tangle of services into a platform the whole team understands. We ship twice as often with half the incidents.",name:"Sara Ali",role:"CTO, LEAP"})
""")

comp("SkillMeter", "Site", 200, """
Skills on a five-step scale of slanted segments (the mark's angle), each exposed as a `meter`. Use honest levels; five 5/5s mean nothing.
""", """
  skills: { name: string; level: 1 | 2 | 3 | 4 | 5 }[];
""", """
h(M.SkillMeter,{skills:[{name:"TypeScript",level:5},{name:"PHP / Laravel",level:5},{name:"Postgres",level:4},{name:"Flutter",level:4},{name:"Rust",level:2}]})
""")

comp("SocialLinks", "Site", 80, """
Icon links to profiles. Each has an accessible label; set `external` to open in a new tab safely.
""", """
  links: { label: string; icon: IconName; href?: string; external?: boolean }[];
  variant?: "ghost" | "outline";
""", """
h(M.SocialLinks,{variant:"outline",links:[{label:"GitHub",icon:"github"},{label:"LinkedIn",icon:"linkedin"},{label:"Email",icon:"mail"}]})
""")

comp("CtaBand", "Site", 230, """
A full-lime call-to-action band, once per page at most, usually just before the footer. The button inverts to ink so it reads on lime in both themes.
""", """
  title: string;
  description?: string;
  action?: ReactNode;
""", """
h(M.CtaBand,{title:"Have a project in mind?",description:"I reply within a day.",action:h(M.Button,{size:"lg",trailingIcon:"send"},"Get in touch")})
""")

comp("Footer", "Site", 380, """
Site footer: logo and blurb, up to three link columns, legal line and an optional trailing slot (social links).
""", """
  blurb?: string;
  columns?: { title: string; links: { label: string; href?: string }[] }[];
  legal?: string;
  end?: ReactNode;
""", """
h(M.Footer,{blurb:"Tech lead building reliable platforms for web and mobile.",columns:[{title:"Site",links:[{label:"Work"},{label:"Writing"},{label:"About"}]},{title:"Elsewhere",links:[{label:"GitHub"},{label:"LinkedIn"}]},{title:"Contact",links:[{label:"Email"},{label:"Book a call"}]}],end:h(M.SocialLinks,{links:[{label:"GitHub",icon:"github"},{label:"LinkedIn",icon:"linkedin"}]})})
""")

comp("PostCard", "Site", 230, """
A blog or writing entry in a list: date, read time, tag, title and excerpt. Stack them with no gaps; each draws its own bottom rule.
""", """
  title: string;
  href?: string;
  date: string;
  readTime?: string;
  tag?: string;
  excerpt?: string;
""", """
h("div",null,h(M.PostCard,{date:"Oct 2026",readTime:"8 min",tag:"Architecture",title:"One mutation pipeline for every write",excerpt:"Metrics, auth, transactions and audit in the same order, every time."}),h(M.PostCard,{date:"Sep 2026",readTime:"5 min",tag:"Leadership",title:"Code review as a teaching tool"}))
""")

comp("Divider", "Layout", 90, """
A hairline separator, optionally with a centred uppercase label ("or").
""", """
  label?: string;
""", """
h("div",null,h(M.Divider,null),h(M.Divider,{label:"or"}))
""")

comp("Kbd", "Display", 70, """
A keyboard key, for shortcuts in menus, tooltips and docs.
""", """
  children: ReactNode;
""", """
h("span",{className:"mh-row",style:{gap:4}},h(M.Kbd,null,"⌘"),h(M.Kbd,null,"K"),h("span",{style:{marginLeft:8,color:"var(--text-muted)",fontSize:14}},"to search"))
""")

comp("Banner", "Feedback", 120, """
A full-width announcement strip at the very top of a site or console. Lime for news, `neutral` (inverse) for notices. One at a time.
""", """
  children: ReactNode;
  variant?: "brand" | "neutral";
  linkLabel?: string;
  href?: string;
  onDismiss?: () => void;
""", """
h("div",{className:"mh-stack",style:{gap:8}},h(M.Banner,{linkLabel:"Read the case study",onDismiss:()=>{}},"New: how LEAP ships web and mobile from one API."),h(M.Banner,{variant:"neutral"},"Scheduled maintenance Sunday 02:00–03:00 UTC."))
""")

# ── Admin ──
comp("AppShell", "Admin", 440, """
The admin layout: `Sidebar` on the left, `Topbar` above the scrolling content. Under 720px the sidebar hides; give the topbar a menu button that opens it in a `Drawer`.
""", """
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
""", """
h(M.AppShell,{sidebar:h(M.Sidebar,{active:"Projects",groups:[{items:[{label:"Dashboard",icon:"home"},{label:"Projects",icon:"briefcase",count:3},{label:"Messages",icon:"mail"}]}],user:{name:"Mohamed Habib",role:"Owner"}}),topbar:h(M.Topbar,{title:"Projects",persistTheme:false})},h(M.EmptyState,{icon:"briefcase",title:"Content area",description:"Pages render here."}))
""")

comp("Sidebar", "Admin", 440, """
Grouped admin navigation with icons, counts and the signed-in user. The current page gets `accent-soft`, lime text and a lime rail.
""", """
  groups: { label?: string; items: { label: string; icon?: IconName; href?: string; count?: number }[] }[];
  active?: string;
  user?: { name: string; role?: string; avatar?: string; avatarAsset?: string };
  brand?: ReactNode;
  tagline?: string;
""", """
h("div",{style:{width:240,height:400,display:"flex"}},h(M.Sidebar,{active:"Dashboard",groups:[{items:[{label:"Dashboard",icon:"home"},{label:"Projects",icon:"briefcase",count:3},{label:"Messages",icon:"mail",count:12}]},{label:"Manage",items:[{label:"Users",icon:"users"},{label:"Settings",icon:"settings"}]}],user:{name:"Mohamed Habib",role:"Owner",avatarAsset:"profile"}}))
""")

comp("Topbar", "Admin", 90, """
Admin page header: page title, search with ⌘K hint, actions, and the theme toggle (on by default).
""", """
  title: string;
  leading?: ReactNode;
  actions?: ReactNode;
  search?: boolean;
  searchPlaceholder?: string;
  themeToggle?: boolean;
  persistTheme?: boolean;
""", """
h(M.Topbar,{title:"Dashboard",persistTheme:false,leading:h(M.IconButton,{icon:"menu",label:"Open navigation"}),actions:h(M.IconButton,{icon:"bell",label:"Notifications",variant:"outline"})})
""")

comp("DropdownMenu", "Admin", 280, """
A menu of actions under a trigger (default: a "more" icon button). Closes on outside click, Escape or selection. Supports headings, separators, shortcuts and a danger item, which goes last.
""", """
  items: ({ label: string; icon?: IconName; shortcut?: string; danger?: boolean; onSelect?: () => void } | { heading: string } | "-")[];
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  align?: "start" | "end";
  label?: string;
""", """
h("div",{style:{display:"flex",justifyContent:"flex-start",paddingLeft:200}},h(M.DropdownMenu,{defaultOpen:true,items:[{heading:"Project"},{label:"Edit",icon:"edit",shortcut:"E"},{label:"Duplicate",icon:"copy",shortcut:"D"},{label:"View live",icon:"eye"},"-",{label:"Delete",icon:"trash",danger:true}]}))
""")

comp("Drawer", "Admin", 360, """
A side panel over the page for details and edit forms that need more room than a Modal. Scrim click calls `onClose`; consumer handles focus trap and Escape.
""", """
  title: string;
  open?: boolean;
  onClose?: () => void;
  footer?: ReactNode;
  inline?: boolean;
  children?: ReactNode;
""", """
h(M.Drawer,{inline:true,title:"Edit project",onClose:()=>{},footer:[h(M.Button,{key:1,variant:"ghost"},"Cancel"),h(M.Button,{key:2},"Save")]},h(M.Input,{label:"Title",defaultValue:"LEAP platform"}),h(M.Select,{label:"Status",options:[{value:"live",label:"Live"},{value:"draft",label:"Draft"}]}))
""")

comp("Accordion", "Layout", 250, """
Expandable sections for FAQs and dense settings. One open at a time unless `multiple`. Triggers are buttons inside headings with `aria-expanded`.
""", """
  items: { title: string; content: ReactNode }[];
  multiple?: boolean;
  defaultOpen?: number[];
""", """
h(M.Accordion,{defaultOpen:[0],items:[{title:"Do you take freelance work?",content:"Yes: architecture reviews, technical leadership and MVP builds."},{title:"Which stacks do you use?",content:"TypeScript (Bun, Elysia, React), PHP (Laravel), Flutter, Postgres."},{title:"Do you work in Arabic?",content:"Yes, every product I ship is bilingual and RTL-ready."}]})
""")

comp("Slider", "Forms", 110, """
Pick a number in a range with a lime fill and a diamond thumb (the mark's angle). Always labelled; the value shows on the right.
""", """
  label: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  format?: (v: number) => string;
  onChange?: (v: number) => void;
""", """
h(M.Slider,{label:"Budget",min:5,max:100,step:5,defaultValue:40,format:v=>"$"+v+"k"})
""")

comp("FileDrop", "Forms", 310, """
Drag-and-drop or click-to-upload zone with a file list. The label is the whole zone, so keyboard users can open it; dropped files are reported through `onChange(files, FileList)`.
""", """
  accept?: string;
  multiple?: boolean;
  hint?: string;
  files?: { name: string; size: number }[];
  defaultFiles?: { name: string; size: number }[];
  onChange?: (files: { name: string; size: number }[], raw?: FileList) => void;
""", """
h(M.FileDrop,{hint:"PNG, JPG or PDF up to 10 MB",defaultFiles:[{name:"leap-cover.png",size:482133},{name:"case-study.pdf",size:2310044}]})
""")

comp("TagInput", "Forms", 130, """
Free-form tags: Enter or comma adds, Backspace on empty removes the last one, duplicates are ignored.
""", """
  label?: string;
  hint?: string;
  value?: string[];
  defaultValue?: string[];
  placeholder?: string;
  onChange?: (tags: string[]) => void;
""", """
h(M.TagInput,{label:"Stack",defaultValue:["Bun","Elysia","Postgres"],hint:"Press Enter to add."})
""")

comp("DescriptionList", "Data", 220, """
Label-value pairs for record details (a project, a user, an invoice). Terms in `text-muted`, values in `text`, hairline rows.
""", """
  items: { term: string; value: ReactNode }[];
""", """
h(M.DescriptionList,{items:[{term:"Client",value:"LEAP PM Services"},{term:"Role",value:"Tech Lead"},{term:"Status",value:h(M.Badge,{variant:"success",dot:true},"Live")},{term:"Stack",value:"Bun · Elysia · TanStack · Flutter"}]})
""")

comp("ActivityFeed", "Data", 220, """
A chronological list of who did what. Unread items carry a lime dot before the time.
""", """
  items: { actor: string; action: string; target?: string; time: string; unread?: boolean }[];
""", """
h(M.ActivityFeed,{items:[{actor:"Sara Ali",action:"sent a message about",target:"MVP build",time:"2m",unread:true},{actor:"Omar K",action:"commented on",target:"Ledger core",time:"1h"},{actor:"Lee C",action:"booked a call",time:"3h"}]})
""")

comp("BarChart", "Data", 290, """
Grouped bar chart in plain SVG, coloured `chart-1…6` in order with a legend for more than one series. Each bar has a native tooltip. For anything richer use a chart library with the same tokens.
""", """
  labels: string[];
  series: { name: string; data: number[] }[];
  height?: number;
  legend?: boolean;
  label?: string;
  format?: (v: number) => string;
""", """
h(M.BarChart,{label:"Traffic by channel",labels:["Jun","Jul","Aug","Sep","Oct"],series:[{name:"Organic",data:[420,510,610,580,720]},{name:"Referral",data:[210,260,240,330,390]},{name:"Social",data:[120,180,150,210,260]}]})
""")

comp("Sparkline", "Data", 80, """
A tiny trend line for tables and stat cards. Has no axes, so always put the number next to it.
""", """
  data: number[];
  width?: number;
  height?: number;
  label?: string;
""", """
h("div",{className:"mh-row",style:{gap:24}},h(M.Sparkline,{data:[3,5,4,6,8,7,9]}),h(M.Sparkline,{data:[9,7,8,5,6,4,3],width:80,height:24}))
""")

comp("Toolbar", "Admin", 90, """
The bar above a list: search, quick-filter chips and actions (usually one "New" button).
""", """
  search?: boolean;
  searchPlaceholder?: string;
  filters?: { label: string; active?: boolean; onClick?: () => void }[];
  actions?: ReactNode;
  label?: string;
""", """
h(M.Toolbar,{searchPlaceholder:"Search projects",filters:[{label:"All",active:true},{label:"Published"},{label:"Drafts"}],actions:h(M.Button,{size:"sm",leadingIcon:"plus"},"New project")})
""")

comp("BulkActionBar", "Admin", 90, """
Appears when table rows are selected: the count, bulk actions and a clear button, on the inverse surface so it stands apart from the table.
""", """
  count: number;
  actions?: ReactNode;
  onClear?: () => void;
""", """
h(M.BulkActionBar,{count:3,onClear:()=>{},actions:[h(M.Button,{key:1,size:"sm",variant:"outline"},"Publish"),h(M.Button,{key:2,size:"sm",variant:"danger"},"Delete")]})
""")

comp("CommandPalette", "Admin", 410, """
⌘K search-and-run for admin: filter as you type, arrow keys move, Enter runs, Escape closes. Grouped results, shortcuts on the right. Mount it inside a Modal-style scrim.
""", """
  items: { label: string; group?: string; icon?: IconName; shortcut?: string; onSelect?: () => void }[];
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: (item: { label: string }) => void;
  onClose?: () => void;
""", """
h(M.CommandPalette,{items:[{group:"Navigate",label:"Dashboard",icon:"home",shortcut:"G D"},{group:"Navigate",label:"Projects",icon:"briefcase",shortcut:"G P"},{group:"Create",label:"New project",icon:"plus",shortcut:"N"},{group:"Create",label:"New post",icon:"edit"},{group:"Theme",label:"Toggle dark mode",icon:"moon",shortcut:"⇧D"}]})
""")

# ── Pages ──
comp("PortfolioPage", "Pages", 3680, """
A complete portfolio home page composed only from this system: Navbar with ThemeToggle, Hero, stats, case studies, services, career and skills, a testimonial, the CTA band and the Footer. Use it as the reference layout for habib.dev.
""", """
  persistTheme?: boolean;
""", """
h(M.PortfolioPage,{persistTheme:false})
""")

comp("AdminDashboardPage", "Pages", 1200, """
The admin console's dashboard: AppShell with Sidebar and Topbar (theme toggle included), KPI StatCards, a BarChart and ActivityFeed, then a Toolbar, BulkActionBar, DataTable with Sparklines and Pagination.
""", """
  persistTheme?: boolean;
""", """
h(M.AdminDashboardPage,{persistTheme:false})
""")

comp("SignInPage", "Pages", 560, """
Admin sign-in: the brand panel (always dark, with the mark) beside the form, which follows the theme and has its own toggle. Email, password, remember me, forgot link, and a GitHub option.
""", """
  persistTheme?: boolean;
""", """
h(M.SignInPage,{persistTheme:false})
""")
