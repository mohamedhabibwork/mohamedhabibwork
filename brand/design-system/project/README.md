# MH Design System

**Mohamed Habib · Tech Lead.** A dark, angular system built from the MH monogram: one acid-lime accent on a near-black ground, wide uppercase wordmark type, crisp cut corners. Dark is the home theme; light exists for documents, résumés and print.

## Where it comes from

- **Structure from LEAP.** The token layers (surface / text / line / state), the component families and their APIs (Button's five variants and three sizes, Badge's six tones, Input's label-hint-error contract, OTP input, Stepper, DataTable…), the 4px spacing grid and the shadow roles are extracted from the LEAP web app (`Leap-pm-web/src/styles.css`, `src/components`).
- **Identity from the MH logo.** LEAP's indigo and sky become `lime-500` (#c2f852, sampled from the master artwork) on `carbon-950`. LEAP's soft 12–20px radii shrink to 2–8px to echo the mark's slanted, cut strokes.
- **Source files** live in the site repo at `brand/`: `brand/logo` (the kit plus `build_logo.py`), `brand/fonts`, and `brand/design-system` (this system's sources plus `build_ds.py`).

## Logo

The mark is three slanted planes, an **M** and an **H** that share their middle stem. The lockup sets it beside **MOHAMED HABIB** in Barlow ExtraBold, with **TECH LEAD** tracked wide beneath it.

| Use | File (Assets) |
|---|---|
| Dark grounds (default) | `mh-lockup-dark.svg`: lime mark, white words |
| Light grounds | `mh-lockup-light.svg`: ink mark and words (lime is 1.2:1 on white, so it can't carry the mark there) |
| Square spaces | `mh-stacked-dark.svg` / `mh-stacked-light.svg` |
| Small sizes, social, favicons | `mh-mark.svg`, `mh-app-icon.svg` (lime on ink), `mh-app-icon-lime.svg` (ink on lime) |
| One colour (print, engraving) | `mh-mark-black.svg`, `mh-mark-white.svg` |
| Print, Illustrator | `MH-Logo.pdf`: all 11 variants as artboards. The same document ships as `brand/logo/MH-Logo.ai`, with EPS per variant |

- **Clear space**: the height of the H's crossbar (≈1/6 of the mark's height) on every side.
- **Minimum size**: mark 16px tall on screen (favicon), lockup 120px wide.
- **Don't** recolour the mark outside lime / ink / white, stretch it, outline it, add gradients or shadows, or retype the wordmark in another face.
- In code use the `Logo` component; it switches to the ink mark on light automatically (`logo-mark` token).

## Colour

- **Lime is scarce.** One primary action per view uses `accent` with `on-accent` text. Lime also marks *the current thing* (active tab rule, current page, progress) through `accent-indicator`, which drops to olive #5d8a0c on light so it still reads at 3:1.
- **Lime is never text on light grounds.** Use `accent-text` (lime on dark, lime-900 on light).
- **Grounds**: `surface` → `surface-raised` (cards) → `surface-field` (inputs, wells). `surface-inverse` is for tooltips and toasts only.
- **State** colours (`positive`, `caution`, `critical`, `info`) always come with their `-soft` ground and a word or icon, never colour alone.
- **Charts** use `chart-1…6` in order (lime first), always with a legend.
- Every text pair in the tokens meets 4.5:1 in both themes; `line-strong` and `accent-indicator` meet 3:1 for control borders and indicators.

## Type

| Role | Face | Where |
|---|---|---|
| Display | **Barlow** 600–800 | Heroes, the name, stat numbers, uppercase eyebrows (0.3em tracking, like "TECH LEAD") |
| UI and reading | **Poppins** 400–700 | Everything else, inherited from LEAP |
| Arabic | **Readex Pro** 400–700 | RTL pages (Arabic subset files); pairs with Poppins in every stack |
| Code | **JetBrains Mono** 400/600 | Commands, IDs, table numbers |

All four faces are bundled as WOFF2 under `fonts/` (Google Fonts, SIL Open Font License). Display text is uppercase only for the name and eyebrows; headings are sentence case.

## Shape, space, depth

- Radii: `radius-sm` 2px (badges, checkboxes, tooltips), `radius-control` 4px (buttons, inputs, tabs), `radius-card` 8px (cards, dialogs). `radius-round` is for avatars, switches and dots only, never buttons.
- Spacing is a 4px grid (`space-1` … `space-24`). Cards pad `space-6`; sections are `space-16` apart.
- **Borders over shadows.** Cards use `line`; `shadow-raised` is for things that float (menus, toasts, dialogs). Focus is always `shadow-focus`, a lime ring.
- Motif: the mark's **slant** (≈33°) appears as parallelogram nodes in Timeline and the EmptyState icon tile. Use it sparingly, once per view.

## Iconography

68 stroke icons on a 24px grid in the Lucide idiom (1.75 stroke, round caps). Every icon is also an editable SVG file in **Assets → Icons**, and the mark is one in **Assets → Marks**.

- In code use `Icon` (paths inline, colour = `currentColor`); `text-muted` for decoration, `accent-text` when active. Use lucide-react for anything missing, with the same stroke.
- **Images live in Assets, not in components.** `Icon` draws `Assets → Icons/<name>.svg`; `Logo`, `Hero`, `ProjectCard` and `SignInPage` draw `Assets → Marks/mh-mark.svg`. Files are drawn as CSS masks, so they still take `currentColor` / `logo-mark`. **Replace a file in Assets and every component using it updates.**
- **Loading:** `MH.loadAssets("design-system.json")` reads this system's index and maps each asset to its stored file (every preview here does this). In your own app, copy the Icons and Marks folders and call `MH.configure({ assetBase: "/brand/" })`, which reads `/brand/icons/<name>.svg` and `/brand/marks/mh-mark.svg`. For one-off overrides use `iconUrl`, `logoMarkUrl`, or `<Icon src>` / `<Logo markSrc>` on a single instance.
- No artwork lives in the component code. Until assets load, icons and the mark reserve their space empty; outside this system, call `MH.configure({ assetBase })` or they stay empty.
- Page pictures are **Assets → Images**: `profile` (avatar, CV photo) and `project-leap` / `project-ledger` / `project-console` (case-study covers). Components take them by name (`photoAsset`, `imageAsset`, `avatarAsset`, `defaultAsset`); outside this system pass `MH.configure({ images: { profile: "/img/me.jpg" } })` or a plain `src`.
- CV template thumbnails are **Assets → Templates** (`cv-modern.svg`, `cv-classic.svg`, `cv-compact.svg`); `TemplatePicker` shows them, and a template entry may pass its own `src`.
- No filled or duotone icons, no emoji. The one exception is `star`, filled when a Rating is on.

## Voice

Direct, technical, calm. Sentence case, verb-first buttons ("Deploy to staging"), numbers over adjectives ("82% coverage", not "great coverage"). No exclamation marks.

## Theme switching

Every page carries one `ThemeToggle`: the icon button in the site header and the admin `Topbar`, or the segmented Light / Dark / System control on settings pages. It sets `data-theme` on `<html>`, remembers the choice in `localStorage` (`mh-theme`) and follows the OS until the user picks one. To avoid a flash of the wrong theme, put this in `<head>` before any CSS:

```html
<script>try{var t=localStorage.getItem("mh-theme");if(!t||t==="system")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}</script>
```

Every component preview here has the toggle in its corner, so you can check both themes.

## Using it in code

1. Load `tokens.css` (CSS custom properties per theme), then `components/bundle.css`.
2. Set `data-theme="dark"` or `"light"` on `<html>` or on any container; themes nest.
3. React: load React 18, then `components/bundle.js`, which exposes `window.MH` (`MH.Button`, `MH.Input`, …). Props are documented in `components/index.d.ts`.
4. Plain HTML: use the same classes (`mh-btn mh-btn--primary`, `mh-badge mh-badge--brand`, `mh-card`, `mh-input`).

## Components

- **Theme:** ThemeToggle, LanguageSwitch. (The logo and icons are Assets, not components: see Iconography.)
- **Actions:** Button, IconButton.
- **Display:** Badge, Chip, ChipList, Kbd, Avatar, AvatarGroup, StatCard, ProgressBar, Timeline.
- **Layout:** Card, Divider, Accordion.
- **Navigation:** Tabs, Pagination, Breadcrumb, Stepper, Navbar.
- **Forms:** Input, Textarea, Select, SearchInput, OtpInput, Checkbox, RadioGroup, Switch, SegmentedControl, Slider, RangeSlider, NumberInput, PasswordInput, PhoneInput, DateRangeField, Rating, SwatchPicker, RichTextEditor, TagInput, FileDrop, FormSection.
- **Feedback:** Alert, Toast, Banner, Modal, Drawer (right, left, bottom sheet), Tooltip, Spinner, Skeleton, EmptyState.
- **Data:** DataTable, DescriptionList, ActivityFeed, BarChart, Sparkline, CodeBlock.
- **Site (portfolio):** Hero, SectionHeading, ProjectCard, ServiceCard, Testimonial, Carousel, SkillMeter, SocialLinks, PostCard, CtaBand, Footer.
- **Admin:** AppShell, Sidebar, Topbar, Toolbar, BulkActionBar, DropdownMenu, CommandPalette.
- **CV builder:** PhotoUpload, SectionEditor, RepeatableList, CompletenessMeter, TemplatePicker, CvPreview.
- **Pages:** PortfolioPage, AdminDashboardPage, SignInPage, CvBuilderPage. Each is built only from the parts above; use them as reference layouts.

The CV paper (`CvPreview`) always prints in fixed colours (white page, near-black text, an accent that holds 4.5:1 on white), whatever the UI theme.
