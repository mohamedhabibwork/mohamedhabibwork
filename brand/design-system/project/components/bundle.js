/* @ds-bundle: {"format":4,"namespace":"MH","components":[{"name":"ThemeToggle"},{"name":"Button"},{"name":"IconButton"},{"name":"Badge"},{"name":"Avatar"},{"name":"AvatarGroup"},{"name":"Card"},{"name":"StatCard"},{"name":"ProgressBar"},{"name":"Stepper"},{"name":"Timeline"},{"name":"Tabs"},{"name":"Pagination"},{"name":"Breadcrumb"},{"name":"Navbar"},{"name":"Input"},{"name":"Textarea"},{"name":"Select"},{"name":"SearchInput"},{"name":"OtpInput"},{"name":"Checkbox"},{"name":"RadioGroup"},{"name":"Switch"},{"name":"Alert"},{"name":"Toast"},{"name":"Modal"},{"name":"Tooltip"},{"name":"Spinner"},{"name":"Skeleton"},{"name":"EmptyState"},{"name":"DataTable"},{"name":"CodeBlock"},{"name":"SegmentedControl"},{"name":"LanguageSwitch"},{"name":"Hero"},{"name":"SectionHeading"},{"name":"ProjectCard"},{"name":"ServiceCard"},{"name":"Testimonial"},{"name":"SkillMeter"},{"name":"Chip"},{"name":"ChipList"},{"name":"SocialLinks"},{"name":"CtaBand"},{"name":"Footer"},{"name":"PostCard"},{"name":"Divider"},{"name":"Kbd"},{"name":"Banner"},{"name":"AppShell"},{"name":"Sidebar"},{"name":"Topbar"},{"name":"DropdownMenu"},{"name":"Drawer"},{"name":"Accordion"},{"name":"Slider"},{"name":"FileDrop"},{"name":"TagInput"},{"name":"DescriptionList"},{"name":"ActivityFeed"},{"name":"BarChart"},{"name":"Sparkline"},{"name":"Toolbar"},{"name":"BulkActionBar"},{"name":"CommandPalette"},{"name":"RangeSlider"},{"name":"Carousel"},{"name":"FormSection"},{"name":"NumberInput"},{"name":"PasswordInput"},{"name":"PhoneInput"},{"name":"DateRangeField"},{"name":"Rating"},{"name":"SwatchPicker"},{"name":"RichTextEditor"},{"name":"PhotoUpload"},{"name":"SectionEditor"},{"name":"RepeatableList"},{"name":"CompletenessMeter"},{"name":"TemplatePicker"},{"name":"CvPreview"},{"name":"PortfolioPage"},{"name":"AdminDashboardPage"},{"name":"SignInPage"},{"name":"CvBuilderPage"}]} */
(function () {
  "use strict";
  var R = function () { return window.React; };
  function h() { var r = R(); return r.createElement.apply(r, arguments); }
  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) { if (arguments[i]) out.push(arguments[i]); }
    return out.join(" ");
  }
  function omit(props, keys) {
    var o = {};
    for (var k in props) { if (Object.prototype.hasOwnProperty.call(props, k) && keys.indexOf(k) < 0) o[k] = props[k]; }
    return o;
  }
  function useControlled(value, fallback) {
    var st = R().useState(fallback);
    var controlled = value !== undefined;
    return [controlled ? value : st[0], function (v) { if (!controlled) st[1](v); }];
  }
  var uid = 0;
  function useId(prefix) { var r = R().useRef(null); if (!r.current) r.current = (prefix || "mh") + "-" + (++uid); return r.current; }

  /* ── Icon: 24px stroke icons in the Lucide idiom ── */
  /** Icon names = files in Assets → Icons (<name>.svg). No artwork lives in code. */
  var ICON_NAMES = ["alert-triangle", "arrow-down-right", "arrow-down", "arrow-right", "arrow-up-right", "arrow-up", "award", "bar-chart", "bell", "bold", "book", "briefcase", "calendar", "check-circle", "check", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "clock", "code", "command", "copy", "download", "edit", "external-link", "eye-off", "eye", "file", "filter", "github", "globe", "grip", "home", "image", "inbox", "info", "italic", "layers", "layout", "link", "linkedin", "list", "log-out", "mail", "map-pin", "menu", "minus", "monitor", "moon", "more-horizontal", "phone", "plus", "printer", "search", "send", "server", "settings", "sparkles", "star", "sun", "trash", "upload", "user", "users", "x-circle", "x", "zap"];
  /* Asset overrides: MH.configure({ iconUrl: name => url, logoMarkUrl: url }) points Icon and Logo
     at your own SVG files (e.g. the Icons / Marks assets). They render as CSS masks, so they keep
     taking currentColor / logo-mark like the built-in vectors. */
  var CONFIG = {};
  function configure(opts) { Object.assign(CONFIG, opts || {}); notifyAssets(); return CONFIG; }

  /* ── Assets: icons, marks and other artwork live in the design system's Assets, not in code. ──
     MH.loadAssets(indexUrl) reads design-system.json and maps every asset to its stored file
     (/_blob/<id>), so replacing a file in Assets updates every component that uses it.
     Outside the system: MH.configure({ assetBase: "/brand/" }) → <base>icons/<name>.svg, <base>marks/mh-mark.svg.
     Until either is set (or if loading fails), components fall back to the built-in vector paths. */
  var ASSETS = { icons: {}, marks: {}, logos: {}, templates: {}, images: {}, loaded: false };
  var assetSubs = [];
  function notifyAssets() { assetSubs.slice().forEach(function (f) { f(); }); }
  function loadAssets(indexUrl) {
    return fetch(indexUrl || "design-system.json").then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status + " for " + indexUrl);
      return r.json();
    }).then(function (idx) {
      var groups = (idx && idx.assetGroups) || {};
      var pick = function (g) {
        var out = {}, files = (groups[g] && groups[g].files) || {};
        Object.keys(files).forEach(function (k) { var f = files[k]; if (f && f.blob) out[String(f.name).replace(/\.[a-z0-9]+$/i, "")] = "/_blob/" + f.blob; });
        return out;
      };
      ASSETS.icons = pick("Icons"); ASSETS.marks = pick("Marks"); ASSETS.logos = pick("Logos"); ASSETS.templates = pick("Templates"); ASSETS.images = pick("Images"); ASSETS.loaded = true;
      notifyAssets();
      return ASSETS;
    }).catch(function (e) {
      if (window.console) console.warn("[MH] assets not loaded, using built-in vectors:", e && e.message);
      return ASSETS;
    });
  }
  function useAssets() {
    var st = R().useState(0);
    R().useEffect(function () {
      var f = function () { st[1](function (v) { return v + 1; }); };
      assetSubs.push(f);
      return function () { assetSubs = assetSubs.filter(function (x) { return x !== f; }); };
    }, []);
    return ASSETS;
  }
  function iconAsset(name) {
    if (CONFIG.iconUrl) return CONFIG.iconUrl(name);
    if (CONFIG.assetBase) return CONFIG.assetBase + "icons/" + name + ".svg";
    return ASSETS.icons[name];
  }
  function templateAsset(name) {
    if (CONFIG.assetBase) return CONFIG.assetBase + "templates/cv-" + name + ".svg";
    return ASSETS.templates["cv-" + name];
  }
  /** A picture from Assets → Images by name (without extension). */
  function imageAsset(name) {
    if (!name) return undefined;
    if (CONFIG.images && CONFIG.images[name]) return CONFIG.images[name];
    return ASSETS.images[name];
  }
  function markAsset() {
    if (CONFIG.logoMarkUrl) return CONFIG.logoMarkUrl;
    if (CONFIG.assetBase) return CONFIG.assetBase + "marks/mh-mark.svg";
    return ASSETS.marks["mh-mark"];
  }
  function maskStyle(url, w, hgt, color) {
    var u = "url(\"" + String(url).replace(/"/g, "%22") + "\")";
    return { display: "inline-block", width: w, height: hgt, backgroundColor: color || "currentColor",
      WebkitMaskImage: u, maskImage: u, WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
      WebkitMaskPosition: "center", maskPosition: "center", WebkitMaskSize: "contain", maskSize: "contain" };
  }
  function Icon(p) {
    var size = p.size || 18;
    useAssets();
    var url = p.src || iconAsset(p.name);
    if (url) return h("span", { className: cx("mh-icon", p.className), style: maskStyle(url, size, size), role: p.label ? "img" : undefined, "aria-label": p.label, "aria-hidden": p.label ? undefined : true });
    return h("span", { className: cx("mh-icon", p.className), style: { display: "inline-block", width: size, height: size }, "aria-hidden": true });
  }
  Icon.names = ICON_NAMES;

  /* ── Logo: the MH mark, traced from the master artwork ── */
  function Logo(p) {
    var size = p.size || 40;
    useAssets();
    var markUrl = p.markSrc || markAsset();
    var mark = markUrl
      ? h("span", { className: "mh-logo__mark", "aria-hidden": true, style: maskStyle(markUrl, size * 442 / 348, size, p.tone === "mono" ? "var(--text)" : "var(--logo-mark)") })
      : h("span", { className: "mh-logo__mark", "aria-hidden": true, style: { display: "inline-block", width: size * 442 / 348, height: size } });
    var words = p.variant === "mark" ? null : h("span", null,
      h("span", { className: "mh-logo__name", style: { fontSize: size * 0.55 } }, p.name || "Mohamed Habib"),
      p.tagline === false ? null : h("span", { className: "mh-logo__tag", style: { fontSize: Math.max(8, size * 0.22) } }, p.tagline || "Tech Lead"));
    return h(p.href ? "a" : "span", {
      className: cx("mh-logo", p.tone === "mono" && "mh-logo--mono", p.className), href: p.href,
      "aria-label": (p.name || "Mohamed Habib") + ", " + (p.tagline || "Tech Lead")
    }, mark, words);
  }

  /* ── Actions ── */
  function Spinner(p) {
    return h("span", { className: cx("mh-spinner", p.size && p.size !== "md" && "mh-spinner--" + p.size, p.className), role: "status", "aria-label": p.label || "Loading" });
  }
  function Button(p) {
    var rest = omit(p, ["variant", "size", "loading", "block", "leadingIcon", "trailingIcon", "className", "children", "type"]);
    var busy = !!p.loading;
    return h("button", Object.assign({
      type: p.type || "button",
      className: cx("mh-btn", "mh-btn--" + (p.variant || "primary"), p.size && p.size !== "md" && "mh-btn--" + p.size, p.block && "mh-btn--block", p.className),
      "aria-busy": busy || undefined, disabled: p.disabled || busy
    }, rest),
      busy ? h("span", { className: "mh-spinner", "aria-hidden": true }) : p.leadingIcon ? h(Icon, { name: p.leadingIcon, size: p.size === "lg" ? 20 : 16 }) : null,
      p.children,
      p.trailingIcon && !busy ? h(Icon, { name: p.trailingIcon, size: p.size === "lg" ? 20 : 16 }) : null);
  }
  function IconButton(p) {
    var rest = omit(p, ["icon", "label", "variant", "size", "className"]);
    return h("button", Object.assign({
      type: "button", "aria-label": p.label, title: p.label,
      className: cx("mh-iconbtn", p.variant && p.variant !== "ghost" && "mh-iconbtn--" + p.variant, p.size === "sm" && "mh-iconbtn--sm", p.className)
    }, rest), h(Icon, { name: p.icon, size: p.size === "sm" ? 16 : 18 }));
  }

  /* ── Display ── */
  function Badge(p) {
    return h("span", { className: cx("mh-badge", p.variant && p.variant !== "neutral" && "mh-badge--" + p.variant, p.className) },
      p.dot ? h("span", { className: "mh-badge__dot", "aria-hidden": true }) : null, p.children);
  }
  function initials(name) {
    return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (s) { return s[0]; }).join("").toUpperCase();
  }
  function Avatar(p) {
    useAssets();
    var src = p.src || imageAsset(p.photoAsset);
    return h("span", { className: cx("mh-avatar", p.size && p.size !== "md" && "mh-avatar--" + p.size, p.className), role: "img", "aria-label": p.name },
      src ? h("img", { src: src, alt: "" }) : initials(p.name),
      p.status ? h("span", { className: "mh-avatar__status mh-avatar__status--" + p.status, "aria-hidden": true }) : null);
  }
  function AvatarGroup(p) {
    var max = p.max || 4, names = p.names || [];
    var shown = names.slice(0, max), more = names.length - shown.length;
    return h("span", { className: "mh-avatars", role: "group", "aria-label": names.length + " people" },
      shown.map(function (n) { return h(Avatar, { key: n, name: n, size: p.size }); }),
      more > 0 ? h("span", { className: cx("mh-avatar mh-avatars__more", p.size && p.size !== "md" && "mh-avatar--" + p.size) }, "+" + more) : null);
  }
  function Card(p) {
    return h(p.as || "article", { className: cx("mh-card", p.interactive && "mh-card--interactive", p.className), tabIndex: p.interactive ? 0 : undefined },
      p.eyebrow ? h("span", { className: "mh-card__eyebrow" }, p.eyebrow) : null,
      p.title ? h("h3", { className: "mh-card__title" }, p.title) : null,
      p.children ? h("div", { className: "mh-card__body" }, p.children) : null,
      p.footer ? h("div", { className: "mh-card__footer" }, p.footer) : null);
  }
  function StatCard(p) {
    var up = p.trend !== "down";
    return h("div", { className: cx("mh-stat", p.className) },
      h("div", { className: "mh-stat__label" }, p.label),
      h("div", { className: "mh-stat__value" }, p.value),
      p.delta ? h("span", { className: "mh-stat__delta mh-stat__delta--" + (up ? "up" : "down") },
        h(Icon, { name: up ? "arrow-up-right" : "arrow-down-right", size: 14 }), p.delta) : null);
  }
  function ProgressBar(p) {
    var v = Math.max(0, Math.min(100, p.value || 0));
    return h("div", { className: cx("mh-progress", p.className) },
      p.label || p.showValue ? h("div", { className: "mh-progress__head" }, h("span", null, p.label), p.showValue ? h("span", null, Math.round(v) + "%") : null) : null,
      h("div", { className: "mh-progress__track", role: "progressbar", "aria-valuenow": v, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": p.label },
        h("div", { className: "mh-progress__fill", style: { width: v + "%" } })));
  }
  function Stepper(p) {
    var cur = p.current || 0;
    return h("ol", { className: "mh-stepper" }, (p.steps || []).map(function (s, i) {
      var state = i < cur ? "done" : i === cur ? "current" : "todo";
      return h("li", { key: i, className: "mh-step mh-step--" + state, "aria-current": state === "current" ? "step" : undefined },
        h("span", { className: "mh-step__bar" }),
        h("span", { className: "mh-step__num" }, String(i + 1).padStart(2, "0")),
        h("span", null, s));
    }));
  }
  function Timeline(p) {
    return h("ol", { className: "mh-timeline" }, (p.items || []).map(function (it, i) {
      return h("li", { key: i, className: "mh-timeline__item" },
        h("span", { className: "mh-timeline__node", "aria-hidden": true }),
        h("div", null,
          it.meta ? h("div", { className: "mh-timeline__meta" }, it.meta) : null,
          h("div", { className: "mh-timeline__title" }, it.title),
          it.body ? h("div", { className: "mh-timeline__body" }, it.body) : null));
    }));
  }

  /* ── Navigation ── */
  function Tabs(p) {
    var items = p.items || [];
    var st = useControlled(p.value, p.defaultValue || (items[0] && items[0].id));
    return h("div", { className: "mh-tabs", role: "tablist", "aria-label": p.label },
      items.map(function (t) {
        var sel = t.id === st[0];
        return h("button", {
          key: t.id, role: "tab", type: "button", className: "mh-tab", "aria-selected": sel, tabIndex: sel ? 0 : -1,
          onClick: function () { st[1](t.id); if (p.onChange) p.onChange(t.id); }
        }, t.label, t.count != null ? h("span", { className: "mh-tab__count" }, t.count) : null);
      }));
  }
  function pageList(page, count) {
    if (count <= 7) return Array.from({ length: count }, function (_, i) { return i + 1; });
    var set = [1, count, page - 1, page, page + 1].filter(function (n) { return n >= 1 && n <= count; });
    set = Array.from(new Set(set)).sort(function (a, b) { return a - b; });
    var out = [];
    set.forEach(function (n, i) { if (i && n - set[i - 1] > 1) out.push("…" + n); out.push(n); });
    return out;
  }
  function Pagination(p) {
    var count = p.pageCount || 1;
    var st = useControlled(p.page, p.defaultPage || 1);
    var go = function (n) { st[1](n); if (p.onChange) p.onChange(n); };
    return h("nav", { className: "mh-pagination", "aria-label": "Pagination" },
      h("button", { className: "mh-page", type: "button", disabled: st[0] <= 1, "aria-label": "Previous page", onClick: function () { go(st[0] - 1); } }, h(Icon, { name: "chevron-left", size: 16 })),
      pageList(st[0], count).map(function (n) {
        return typeof n === "string" ? h("span", { key: n, className: "mh-page__gap" }, "…")
          : h("button", { key: n, className: "mh-page", type: "button", "aria-current": n === st[0] ? "page" : undefined, onClick: function () { go(n); } }, n);
      }),
      h("button", { className: "mh-page", type: "button", disabled: st[0] >= count, "aria-label": "Next page", onClick: function () { go(st[0] + 1); } }, h(Icon, { name: "chevron-right", size: 16 })));
  }
  function Breadcrumb(p) {
    var items = p.items || [];
    return h("nav", { "aria-label": "Breadcrumb" }, h("ol", { className: "mh-crumbs" }, items.map(function (it, i) {
      var last = i === items.length - 1;
      return [
        i ? h("li", { key: "s" + i, className: "mh-crumbs__sep", "aria-hidden": true }, "/") : null,
        h("li", { key: i }, last ? h("span", { "aria-current": "page" }, it.label) : h("a", { href: it.href || "#" }, it.label))
      ];
    })));
  }
  function Navbar(p) {
    return h("header", { className: cx("mh-nav", p.className) },
      h(Logo, { size: p.logoSize || 30, href: p.homeHref || "#", tagline: p.tagline }),
      h("nav", { className: "mh-nav__links", "aria-label": "Primary" }, (p.links || []).map(function (l) {
        return h("a", { key: l.label, className: "mh-nav__link", href: l.href || "#", "aria-current": l.label === p.active ? "page" : undefined }, l.label);
      })),
      p.action || null);
  }

  /* ── Forms ── */
  function Field(p, control) {
    return h("div", { className: cx("mh-field", p.className) },
      p.label ? h("label", { className: "mh-field__label", htmlFor: p.id }, p.label, p.required ? h("span", { className: "mh-field__req", "aria-hidden": true }, "*") : null) : null,
      control,
      p.error ? h("span", { className: "mh-field__error", id: p.id + "-err" }, h(Icon, { name: "x-circle", size: 14 }), p.error)
        : p.hint ? h("span", { className: "mh-field__hint", id: p.id + "-hint" }, p.hint) : null);
  }
  var FIELD_KEYS = ["label", "hint", "error", "className", "leadingIcon", "options", "shortcut"];
  function fieldProps(p, id, cls) {
    return Object.assign(omit(p, FIELD_KEYS), {
      id: id, className: cls, "aria-invalid": p.error ? true : undefined,
      "aria-describedby": p.error ? id + "-err" : p.hint ? id + "-hint" : undefined
    });
  }
  function Input(p) {
    var _auto = useId("in"); var id = p.id || _auto;
    var input = h("input", fieldProps(p, id, "mh-input"));
    return Field(Object.assign({}, p, { id: id }), p.leadingIcon ? h("div", { className: "mh-control" }, h(Icon, { name: p.leadingIcon, size: 16 }), input) : input);
  }
  function Textarea(p) {
    var _auto = useId("ta"); var id = p.id || _auto;
    return Field(Object.assign({}, p, { id: id }), h("textarea", fieldProps(p, id, "mh-textarea")));
  }
  function Select(p) {
    var _auto = useId("sel"); var id = p.id || _auto;
    return Field(Object.assign({}, p, { id: id }), h("select", fieldProps(p, id, "mh-select"),
      (p.options || []).map(function (o) { return h("option", { key: o.value, value: o.value }, o.label); })));
  }
  function SearchInput(p) {
    var _auto = useId("search"); var id = p.id || _auto;
    return h("div", { className: cx("mh-control", p.className), role: "search" },
      h(Icon, { name: "search", size: 16 }),
      h("input", Object.assign(omit(p, ["shortcut", "className", "label"]), { id: id, type: "search", className: "mh-input", "aria-label": p.label || p.placeholder || "Search" })),
      p.shortcut ? h("kbd", { className: "mh-kbd" }, p.shortcut) : null);
  }
  function OtpInput(p) {
    var len = p.length || 6;
    var st = useControlled(p.value, p.defaultValue || "");
    var refs = R().useRef([]);
    var set = function (i, ch) {
      var arr = st[0].padEnd(len, " ").split("");
      arr[i] = ch || " ";
      var next = arr.join("").replace(/\s+$/, "");
      st[1](next); if (p.onChange) p.onChange(next);
      if (ch && refs.current[i + 1]) refs.current[i + 1].focus();
    };
    return h("div", { className: "mh-otp", role: "group", "aria-label": p.label || "One-time code" },
      Array.from({ length: len }, function (_, i) {
        return h("input", {
          key: i, ref: function (el) { refs.current[i] = el; }, className: "mh-input", inputMode: "numeric", maxLength: 1,
          autoComplete: i === 0 ? "one-time-code" : "off", "aria-label": "Digit " + (i + 1),
          "aria-invalid": p.error ? true : undefined,
          value: (st[0][i] || "").trim(), onChange: function (e) { set(i, e.target.value.replace(/\D/g, "").slice(-1)); },
          onKeyDown: function (e) { if (e.key === "Backspace" && !e.target.value && refs.current[i - 1]) refs.current[i - 1].focus(); }
        });
      }));
  }
  function Checkbox(p) {
    var rest = omit(p, ["label", "description", "className"]);
    return h("label", { className: cx("mh-check", p.className) },
      h("input", Object.assign({ type: "checkbox" }, rest)),
      h("span", { className: "mh-check__box", "aria-hidden": true }, h(Icon, { name: "check", size: 13, strokeWidth: 3 })),
      h("span", null, p.label, p.description ? h("span", { className: "mh-check__desc" }, p.description) : null));
  }
  function RadioGroup(p) {
    var _auto = useId("radio"); var name = p.name || _auto;
    var st = useControlled(p.value, p.defaultValue);
    return h("fieldset", { className: cx("mh-radios", p.className) },
      p.label ? h("legend", null, p.label) : null,
      (p.options || []).map(function (o) {
        return h("label", { key: o.value, className: "mh-check" },
          h("input", { type: "radio", name: name, value: o.value, checked: st[0] === o.value, disabled: o.disabled, onChange: function () { st[1](o.value); if (p.onChange) p.onChange(o.value); } }),
          h("span", { className: "mh-check__box mh-check__box--radio", "aria-hidden": true }),
          h("span", null, o.label, o.description ? h("span", { className: "mh-check__desc" }, o.description) : null));
      }));
  }
  function Switch(p) {
    var rest = omit(p, ["label", "className"]);
    return h("label", { className: cx("mh-switch", p.className) },
      h("input", Object.assign({ type: "checkbox", role: "switch" }, rest)),
      h("span", { className: "mh-switch__track", "aria-hidden": true }),
      p.label);
  }

  /* ── Feedback ── */
  var TONE_ICON = { info: "info", success: "check-circle", warning: "alert-triangle", danger: "x-circle", brand: "bell" };
  function Alert(p) {
    var v = p.variant || "info";
    return h("div", { className: cx("mh-alert", "mh-alert--" + v, p.className), role: v === "danger" || v === "warning" ? "alert" : "status" },
      h(Icon, { name: TONE_ICON[v], size: 20 }),
      h("div", null, p.title ? h("div", { className: "mh-alert__title" }, p.title) : null, p.children ? h("div", { className: "mh-alert__body" }, p.children) : null),
      p.onDismiss ? h(IconButton, { icon: "x", label: "Dismiss", size: "sm", onClick: p.onDismiss }) : h("span"));
  }
  function Toast(p) {
    return h("div", { className: cx("mh-toast", p.variant === "danger" && "mh-toast--danger", p.className), role: "status", "aria-live": "polite" },
      h("span", { className: "mh-toast__bar", "aria-hidden": true }),
      h("div", null, h("div", { className: "mh-toast__title" }, p.title), p.description ? h("div", { className: "mh-toast__desc" }, p.description) : null),
      p.actionLabel ? h("button", { className: "mh-toast__action", type: "button", onClick: p.onAction }, p.actionLabel) : null);
  }
  function Modal(p) {
    var id = useId("dlg");
    if (p.open === false) return null;
    return h("div", { className: cx("mh-modal-scrim", p.inline && "mh-modal-scrim--inline"), onClick: function (e) { if (e.target === e.currentTarget && p.onClose) p.onClose(); } },
      h("div", { className: "mh-modal", role: "dialog", "aria-modal": !p.inline, "aria-labelledby": id + "-t" },
        h("div", { className: "mh-modal__head" },
          h("div", null, h("h2", { className: "mh-modal__title", id: id + "-t" }, p.title), p.description ? h("p", { className: "mh-modal__desc" }, p.description) : null),
          p.onClose ? h(IconButton, { icon: "x", label: "Close", size: "sm", onClick: p.onClose }) : null),
        p.children ? h("div", { className: "mh-modal__body" }, p.children) : null,
        p.footer ? h("div", { className: "mh-modal__foot" }, p.footer) : null));
  }
  function Tooltip(p) {
    var id = useId("tip");
    var child = R().isValidElement(p.children) ? R().cloneElement(p.children, { "aria-describedby": id }) : p.children;
    return h("span", { className: cx("mh-tip", p.open && "mh-tip--open") }, child, h("span", { className: "mh-tip__bubble", role: "tooltip", id: id }, p.content));
  }
  function Skeleton(p) {
    var lines = p.lines || 3;
    return h("div", { className: "mh-skeleton", "aria-busy": true, "aria-label": "Loading" },
      p.avatar ? h("span", { className: "mh-skel mh-skel--circle" }) : null,
      h("div", { className: "mh-skeleton__lines" }, Array.from({ length: lines }, function (_, i) {
        return h("span", { key: i, className: "mh-skel", style: { width: i === lines - 1 ? "60%" : "100%" } });
      })));
  }
  function EmptyState(p) {
    return h("div", { className: cx("mh-empty", p.className) },
      h("span", { className: "mh-empty__icon", "aria-hidden": true }, h(Icon, { name: p.icon || "inbox", size: 22 })),
      h("div", { className: "mh-empty__title" }, p.title),
      p.description ? h("div", { className: "mh-empty__desc" }, p.description) : null,
      p.action || null);
  }

  /* ── Data ── */
  function DataTable(p) {
    var cols = p.columns || [];
    return h("div", { className: "mh-table-wrap" }, h("table", { className: "mh-table" },
      p.caption ? h("caption", { className: "mh-sr" }, p.caption) : null,
      h("thead", null, h("tr", null, cols.map(function (c) { return h("th", { key: c.key, scope: "col", style: c.align === "end" ? { textAlign: "end" } : null }, c.label); }))),
      h("tbody", null, (p.rows || []).map(function (r, i) {
        return h("tr", { key: r.id || i }, cols.map(function (c) {
          var v = c.render ? c.render(r) : r[c.key];
          return h("td", { key: c.key, className: c.align === "end" ? "mh-num" : undefined }, v);
        }));
      }))));
  }
  function CodeBlock(p) {
    var lines = String(p.code || "").split("\n");
    return h("pre", { className: cx("mh-code", p.className) }, lines.map(function (l, i) {
      var isComment = /^\s*#/.test(l);
      return h("div", { key: i },
        p.prompt && !isComment && l ? h("span", { className: "mh-code__prompt" }, "$ ") : null,
        isComment ? h("span", { className: "mh-code__comment" }, l) : l);
    }));
  }


  /* ══════ Extra icons ══════ */

  /* ══════ Theme ══════ */
  var THEMES = ["light", "dark", "system"];
  function readStored(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function writeStored(key, v) { try { window.localStorage.setItem(key, v); } catch (e) { /* storage blocked: theme still applies for this page */ } }
  function systemTheme() { return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  /** Theme state applied to `target` as data-theme (light | dark), with a stored preference that may be "system". */
  function useTheme(opts) {
    opts = opts || {};
    var r = R();
    var key = opts.storageKey || "mh-theme";
    var persist = opts.persist !== false;
    var getTarget = function () { return opts.target || document.documentElement; };
    var st = r.useState(function () {
      var stored = persist ? readStored(key) : null;
      if (THEMES.indexOf(stored) >= 0) return stored;
      return opts.defaultValue || getTarget().getAttribute("data-theme") || "system";
    });
    var pref = st[0], setPref = st[1];
    var resolved = pref === "system" ? systemTheme() : pref;
    r.useEffect(function () {
      var t = getTarget();
      if (t.getAttribute("data-theme") !== resolved) t.setAttribute("data-theme", resolved);
      t.style.colorScheme = resolved;
      if (persist) writeStored(key, pref);
    }, [pref, resolved]);
    r.useEffect(function () {
      if (pref !== "system" || !window.matchMedia) return undefined;
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var on = function () { setPref("system"); getTarget().setAttribute("data-theme", systemTheme()); };
      mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
      return function () { mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on); };
    }, [pref]);
    r.useEffect(function () {
      // Stay in sync when something else (a host page's own switch) changes the attribute.
      if (!window.MutationObserver) return undefined;
      var t = getTarget();
      var mo = new MutationObserver(function () {
        var v = t.getAttribute("data-theme");
        if ((v === "light" || v === "dark") && v !== (pref === "system" ? systemTheme() : pref)) setPref(v);
      });
      mo.observe(t, { attributes: true, attributeFilter: ["data-theme"] });
      return function () { mo.disconnect(); };
    }, [pref]);
    return { theme: resolved, preference: pref, setTheme: setPref, toggle: function () { setPref(resolved === "dark" ? "light" : "dark"); } };
  }
  function ThemeToggle(p) {
    var t = useTheme(p);
    if (p.variant === "segmented") {
      var opts = p.withSystem === false ? ["light", "dark"] : THEMES;
      var icons = { light: "sun", dark: "moon", system: "monitor" };
      var labels = { light: "Light", dark: "Dark", system: "System" };
      return h("div", { className: cx("mh-segmented", p.className), role: "radiogroup", "aria-label": p.label || "Colour theme" },
        opts.map(function (o) {
          return h("button", { key: o, type: "button", role: "radio", "aria-checked": t.preference === o, onClick: function () { t.setTheme(o); } },
            h(Icon, { name: icons[o], size: 15 }), p.iconOnly ? h("span", { className: "mh-sr" }, labels[o]) : labels[o]);
        }));
    }
    var next = t.theme === "dark" ? "light" : "dark";
    return h("button", { type: "button", className: cx("mh-themetoggle", p.className), onClick: t.toggle, "aria-label": "Switch to " + next + " theme", title: "Switch to " + next + " theme" },
      h(Icon, { name: t.theme === "dark" ? "sun" : "moon", size: 17 }));
  }
  function SegmentedControl(p) {
    var st = useControlled(p.value, p.defaultValue || (p.options && p.options[0] && p.options[0].value));
    return h("div", { className: cx("mh-segmented", p.className), role: "radiogroup", "aria-label": p.label },
      (p.options || []).map(function (o) {
        return h("button", { key: o.value, type: "button", role: "radio", "aria-checked": st[0] === o.value, onClick: function () { st[1](o.value); if (p.onChange) p.onChange(o.value); } },
          o.icon ? h(Icon, { name: o.icon, size: 15 }) : null, o.label);
      }));
  }
  function LanguageSwitch(p) {
    return h(SegmentedControl, {
      label: "Language", value: p.value, defaultValue: p.defaultValue || "en",
      options: [{ value: "en", label: "EN" }, { value: "ar", label: "عربي" }],
      onChange: function (v) {
        if (p.applyToDocument !== false) { document.documentElement.lang = v; document.documentElement.dir = v === "ar" ? "rtl" : "ltr"; }
        if (p.onChange) p.onChange(v);
      }
    });
  }

  /* ══════ Site / portfolio ══════ */
  /** The mark as decorative artwork, drawn from Assets → Marks (mask, so `fill` = a token colour). */
  function MarkArt(p) {
    useAssets();
    var url = p.src || markAsset();
    if (url) return h("span", { className: p.className, "aria-hidden": true, style: Object.assign(maskStyle(url, "100%", "100%", p.fill), { display: "block", WebkitMaskPosition: p.position || "center", maskPosition: p.position || "center" }) });
    return h("span", { className: p.className, "aria-hidden": true, style: { display: "block" } });
  }
  function Hero(p) {
    return h("section", { className: cx("mh-hero", p.className) },
      p.art === false ? null : h(MarkArt, { className: "mh-hero__art", fill: "var(--accent-soft)", position: "right" }),
      p.eyebrow ? h("span", { className: "mh-hero__eyebrow" }, p.eyebrow) : null,
      h("h1", { className: "mh-hero__title" }, p.title, p.highlight ? [" ", h("em", { key: "e" }, p.highlight)] : null),
      p.lead ? h("p", { className: "mh-hero__lead" }, p.lead) : null,
      p.actions ? h("div", { className: "mh-hero__actions" }, p.actions) : null,
      p.children);
  }
  function SectionHeading(p) {
    return h("header", { className: cx("mh-section-head", p.action && "mh-section-head--row", p.className) },
      h("div", { style: { display: "grid", gap: 8 } },
        p.eyebrow ? h("span", { className: "mh-section-head__eyebrow" }, p.eyebrow) : null,
        h(p.as || "h2", { className: "mh-section-head__title" }, p.title),
        p.description ? h("p", { className: "mh-section-head__desc" }, p.description) : null),
      p.action || null);
  }
  function Chip(p) {
    var cls = cx("mh-chip", p.active && "mh-chip--active", p.className);
    if (p.onClick) return h("button", { type: "button", className: cls, onClick: p.onClick, "aria-pressed": !!p.active }, p.children);
    return h("span", { className: cls }, p.children,
      p.onRemove ? h("button", { type: "button", onClick: p.onRemove, "aria-label": "Remove " + p.children }, h(Icon, { name: "x", size: 12 })) : null);
  }
  function ChipList(p) {
    return h("ul", { className: cx("mh-chips", p.className), "aria-label": p.label }, (p.items || []).map(function (t) { return h("li", { key: t }, h(Chip, null, t)); }));
  }
  function ProjectCard(p) {
    useAssets();
    var image = p.image || imageAsset(p.imageAsset);
    return h("a", { className: cx("mh-project", p.className), href: p.href || "#" },
      h("div", { className: "mh-project__media" },
        image ? h("img", { src: image, alt: "", loading: "lazy" })
          : h("div", { className: "mh-project__ph" }, h(MarkArt, { className: "mh-project__mark", fill: "var(--accent-line)" }))),
      h("div", { className: "mh-project__body" },
        h("div", { className: "mh-project__meta" }, h("span", null, p.category), h("span", null, p.year)),
        h("h3", { className: "mh-project__title" }, p.title, h(Icon, { name: "arrow-up-right", size: 16 })),
        p.description ? h("p", { className: "mh-project__desc" }, p.description) : null,
        p.tags ? h(ChipList, { items: p.tags, label: "Stack" }) : null));
  }
  function ServiceCard(p) {
    return h("article", { className: cx("mh-service", p.className) },
      h("span", { className: "mh-service__icon", "aria-hidden": true }, h(Icon, { name: p.icon || "zap", size: 20 })),
      h("h3", { className: "mh-service__title" }, p.title),
      p.description ? h("p", { className: "mh-service__desc" }, p.description) : null,
      p.points ? h("ul", null, p.points.map(function (x) { return h("li", { key: x }, h(Icon, { name: "check", size: 14 }), x); })) : null);
  }
  function Testimonial(p) {
    return h("figure", { className: cx("mh-quote", p.className) },
      h("span", { className: "mh-quote__mark", "aria-hidden": true }, "“"),
      h("blockquote", null, p.quote),
      h("figcaption", null, h(Avatar, { name: p.name, src: p.avatar, photoAsset: p.avatarAsset }),
        h("span", null, h("span", { className: "mh-quote__who" }, p.name), h("span", { className: "mh-quote__role", style: { display: "block" } }, p.role))));
  }
  function SkillMeter(p) {
    return h("div", { className: cx("mh-skills", p.className) }, (p.skills || []).map(function (s) {
      return h("div", { key: s.name, className: "mh-skill" },
        h("span", null, s.name),
        h("span", { className: "mh-skill__bar", role: "meter", "aria-valuenow": s.level, "aria-valuemin": 0, "aria-valuemax": 5, "aria-label": s.name + " level" },
          [1, 2, 3, 4, 5].map(function (n) { return h("span", { key: n, className: cx("mh-skill__seg", n <= s.level && "mh-skill__seg--on") }); })),
        h("span", { className: "mh-skill__lvl" }, s.level + "/5"));
    }));
  }
  function SocialLinks(p) {
    return h("ul", { className: cx("mh-social", p.className) }, (p.links || []).map(function (l) {
      return h("li", { key: l.label }, h("a", { href: l.href || "#", className: cx("mh-iconbtn", p.variant === "outline" && "mh-iconbtn--outline"), "aria-label": l.label, title: l.label, target: l.external ? "_blank" : undefined, rel: l.external ? "noopener noreferrer" : undefined }, h(Icon, { name: l.icon, size: 18 })));
    }));
  }
  function CtaBand(p) {
    return h("section", { className: cx("mh-cta", p.className) },
      h("div", null, h("h2", { className: "mh-cta__title" }, p.title), p.description ? h("p", { className: "mh-cta__desc" }, p.description) : null),
      p.action || null);
  }
  function Footer(p) {
    return h("footer", { className: cx("mh-footer", p.className) },
      h("div", { className: "mh-footer__top" },
        h("div", { className: "mh-footer__col" }, h(Logo, { size: 28 }), p.blurb ? h("p", { style: { margin: "8px 0 0", maxWidth: "34ch" } }, p.blurb) : null),
        (p.columns || []).map(function (c) {
          return h("nav", { key: c.title, className: "mh-footer__col", "aria-label": c.title },
            h("span", { className: "mh-footer__head" }, c.title),
            c.links.map(function (l) { return h("a", { key: l.label, href: l.href || "#" }, l.label); }));
        })),
      h("div", { className: "mh-footer__bottom" }, h("span", null, p.legal || "© " + new Date().getFullYear() + " Mohamed Habib"), p.end || null));
  }
  function PostCard(p) {
    return h("a", { className: cx("mh-post", p.className), href: p.href || "#" },
      h("span", { className: "mh-post__meta" }, h("time", null, p.date), p.readTime ? h("span", null, p.readTime) : null, p.tag ? h("span", { style: { color: "var(--accent-text)" } }, p.tag) : null),
      h("h3", { className: "mh-post__title" }, p.title),
      p.excerpt ? h("p", { className: "mh-post__excerpt" }, p.excerpt) : null);
  }
  function Divider(p) {
    return p.label ? h("div", { className: "mh-divider mh-divider--label", role: "separator" }, p.label) : h("hr", { className: "mh-divider" });
  }
  function Kbd(p) { return h("kbd", { className: "mh-kbd-inline" }, p.children); }
  function Banner(p) {
    return h("div", { className: cx("mh-banner", p.variant === "neutral" && "mh-banner--neutral", p.className), role: "region", "aria-label": "Announcement" },
      h("span", null, p.children), p.linkLabel ? h("a", { href: p.href || "#" }, p.linkLabel, " →") : null,
      p.onDismiss ? h(IconButton, { icon: "x", label: "Dismiss", size: "sm", onClick: p.onDismiss }) : null);
  }

  /* ══════ Admin ══════ */
  function Sidebar(p) {
    return h("aside", { className: cx("mh-sidebar", p.className) },
      h("div", { className: "mh-sidebar__brand" }, p.brand || h(Logo, { size: 24, tagline: p.tagline || "Admin" })),
      (p.groups || []).map(function (g) {
        return h("nav", { key: g.label || "main", className: "mh-sidebar__group", "aria-label": g.label || "Main" },
          g.label ? h("span", { className: "mh-sidebar__label" }, g.label) : null,
          g.items.map(function (it) {
            return h("a", { key: it.label, className: "mh-sidebar__item", href: it.href || "#", "aria-current": it.label === p.active ? "page" : undefined },
              h(Icon, { name: it.icon || "layout", size: 17 }), it.label,
              it.count != null ? h("span", { className: "mh-sidebar__count" }, it.count) : null);
          }));
      }),
      p.user ? h("div", { className: "mh-sidebar__foot" }, h(Avatar, { name: p.user.name, size: "sm", status: "online", src: p.user.avatar, photoAsset: p.user.avatarAsset }),
        h("span", { style: { minWidth: 0, flex: 1 } }, p.user.name, h("small", null, p.user.role)),
        h(IconButton, { icon: "log-out", label: "Sign out", size: "sm" })) : null);
  }
  function Topbar(p) {
    return h("header", { className: cx("mh-topbar", p.className) },
      p.leading || null,
      h("div", { className: "mh-topbar__title" }, p.title),
      p.search === false ? null : h(SearchInput, { placeholder: p.searchPlaceholder || "Search", shortcut: "⌘K" }),
      p.actions || null,
      p.themeToggle === false ? null : h(ThemeToggle, { persist: p.persistTheme }));
  }
  function AppShell(p) {
    return h("div", { className: cx("mh-shell", p.className) },
      p.sidebar,
      h("div", { className: "mh-shell__main" }, p.topbar, h("main", { className: "mh-shell__content" }, p.children)));
  }
  function DropdownMenu(p) {
    var r = R();
    var st = useControlled(p.open, !!p.defaultOpen);
    var ref = r.useRef(null);
    r.useEffect(function () {
      if (!st[0]) return undefined;
      var onDoc = function (e) { if (ref.current && !ref.current.contains(e.target)) st[1](false); };
      var onKey = function (e) { if (e.key === "Escape") st[1](false); };
      document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
      return function () { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
    }, [st[0]]);
    var id = useId("menu");
    var trigger = p.trigger || h(IconButton, { icon: "more-horizontal", label: p.label || "More actions", variant: "outline" });
    return h("div", { className: "mh-menu-wrap", ref: ref },
      r.cloneElement(trigger, { "aria-haspopup": "menu", "aria-expanded": st[0], "aria-controls": id, onClick: function () { st[1](!st[0]); } }),
      st[0] ? h("div", { className: "mh-menu", role: "menu", id: id, style: p.align === "start" ? { left: 0, right: "auto" } : null },
        (p.items || []).map(function (it, i) {
          if (it === "-") return h("div", { key: i, className: "mh-menu__sep", role: "separator" });
          if (it.heading) return h("div", { key: i, className: "mh-menu__label" }, it.heading);
          return h("button", { key: i, type: "button", role: "menuitem", className: cx("mh-menu__item", it.danger && "mh-menu__item--danger"), onClick: function () { st[1](false); if (it.onSelect) it.onSelect(); } },
            it.icon ? h(Icon, { name: it.icon, size: 16 }) : null, it.label, it.shortcut ? h(Kbd, null, it.shortcut) : null);
        })) : null);
  }
  function Drawer(p) {
    var id = useId("drawer");
    if (p.open === false) return null;
    var side = p.side || "right";
    return h("div", { className: cx("mh-drawer-scrim", "mh-drawer-scrim--" + side, p.inline && "mh-drawer-scrim--inline"), onClick: function (e) { if (e.target === e.currentTarget && p.onClose) p.onClose(); } },
      h("div", { className: cx("mh-drawer", "mh-drawer--" + side), role: "dialog", "aria-modal": !p.inline, "aria-labelledby": id },
        side === "bottom" ? h("span", { className: "mh-drawer__handle", "aria-hidden": true }) : null,
        h("div", { className: "mh-drawer__head" }, h("h2", { className: "mh-drawer__title", id: id }, p.title), p.onClose ? h(IconButton, { icon: "x", label: "Close", size: "sm", onClick: p.onClose }) : null),
        h("div", { className: "mh-drawer__body" }, p.children),
        p.footer ? h("div", { className: "mh-drawer__foot" }, p.footer) : null));
  }
  function Accordion(p) {
    var st = R().useState(p.defaultOpen || []);
    var base = useId("acc");
    var toggle = function (i) {
      st[1](function (open) {
        if (open.indexOf(i) >= 0) return open.filter(function (x) { return x !== i; });
        return p.multiple ? open.concat([i]) : [i];
      });
    };
    return h("div", { className: cx("mh-accordion", p.className) }, (p.items || []).map(function (it, i) {
      var open = st[0].indexOf(i) >= 0;
      return h("div", { key: i, className: "mh-accordion__item" },
        h("h3", null, h("button", { type: "button", className: "mh-accordion__trigger", "aria-expanded": open, "aria-controls": base + "-" + i, id: base + "-t" + i, onClick: function () { toggle(i); } },
          it.title, h(Icon, { name: "chevron-down", size: 18 }))),
        open ? h("div", { className: "mh-accordion__panel", id: base + "-" + i, role: "region", "aria-labelledby": base + "-t" + i }, it.content) : null);
    }));
  }
  function Slider(p) {
    var min = p.min == null ? 0 : p.min, max = p.max == null ? 100 : p.max;
    var st = useControlled(p.value, p.defaultValue == null ? min : p.defaultValue);
    var id = useId("slider");
    var pct = ((st[0] - min) / (max - min)) * 100;
    return h("div", { className: cx("mh-slider", p.className) },
      h("div", { className: "mh-slider__head" }, h("label", { htmlFor: id }, p.label), h("output", { htmlFor: id }, (p.format ? p.format(st[0]) : st[0]))),
      h("input", { id: id, type: "range", min: min, max: max, step: p.step || 1, value: st[0], style: { "--mh-fill": pct + "%" },
        onChange: function (e) { var v = Number(e.target.value); st[1](v); if (p.onChange) p.onChange(v); } }));
  }
  function formatBytes(n) { return n < 1024 ? n + " B" : n < 1048576 ? (n / 1024).toFixed(0) + " KB" : (n / 1048576).toFixed(1) + " MB"; }
  function FileDrop(p) {
    var r = R();
    var over = r.useState(false);
    var files = useControlled(p.files, p.defaultFiles || []);
    var id = useId("drop");
    var add = function (list) {
      var next = files[0].concat(Array.prototype.map.call(list, function (f) { return { name: f.name, size: f.size }; }));
      files[1](next); if (p.onChange) p.onChange(next, list);
    };
    return h("div", { className: p.className },
      h("label", { htmlFor: id, className: cx("mh-filedrop", over[0] && "mh-filedrop--over"),
        onDragOver: function (e) { e.preventDefault(); over[1](true); }, onDragLeave: function () { over[1](false); },
        onDrop: function (e) { e.preventDefault(); over[1](false); add(e.dataTransfer.files); } },
        h("input", { id: id, type: "file", multiple: p.multiple !== false, accept: p.accept, onChange: function (e) { add(e.target.files); } }),
        h("span", { className: "mh-filedrop__icon", "aria-hidden": true }, h(Icon, { name: "upload", size: 18 })),
        h("span", null, h("strong", null, "Click to upload"), " or drag and drop"),
        p.hint ? h("span", { style: { fontSize: 12, color: "var(--text-subtle)" } }, p.hint) : null),
      files[0].length ? h("ul", { className: "mh-files" }, files[0].map(function (f, i) {
        return h("li", { key: f.name + i }, h(Icon, { name: "file", size: 16 }), h("span", { className: "mh-files__name" }, f.name), h("small", null, formatBytes(f.size)),
          h(IconButton, { icon: "x", label: "Remove " + f.name, size: "sm", onClick: function () { var next = files[0].filter(function (_, j) { return j !== i; }); files[1](next); if (p.onChange) p.onChange(next); } }));
      })) : null);
  }
  function TagInput(p) {
    var tags = useControlled(p.value, p.defaultValue || []);
    var draft = R().useState("");
    var id = useId("tags");
    var commit = function () {
      var v = draft[0].trim();
      if (v && tags[0].indexOf(v) < 0) { var next = tags[0].concat([v]); tags[1](next); if (p.onChange) p.onChange(next); }
      draft[1]("");
    };
    var remove = function (t) { var next = tags[0].filter(function (x) { return x !== t; }); tags[1](next); if (p.onChange) p.onChange(next); };
    return Field(Object.assign({}, p, { id: id }), h("div", { className: "mh-taginput" },
      tags[0].map(function (t) { return h(Chip, { key: t, onRemove: function () { remove(t); } }, t); }),
      h("input", { id: id, value: draft[0], placeholder: tags[0].length ? "" : p.placeholder,
        onChange: function (e) { draft[1](e.target.value); },
        onKeyDown: function (e) {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
          else if (e.key === "Backspace" && !draft[0] && tags[0].length) remove(tags[0][tags[0].length - 1]);
        }, onBlur: commit })));
  }
  function DescriptionList(p) {
    return h("dl", { className: cx("mh-dl", p.className) }, (p.items || []).map(function (it) {
      return [h("dt", { key: it.term + "t" }, it.term), h("dd", { key: it.term + "d" }, it.value)];
    }));
  }
  function ActivityFeed(p) {
    return h("ul", { className: cx("mh-feed", p.className) }, (p.items || []).map(function (it, i) {
      return h("li", { key: i, className: cx("mh-feed__item", it.unread && "mh-feed__item--unread") },
        h(Avatar, { name: it.actor, size: "sm" }),
        h("span", { className: "mh-feed__text" }, h("b", null, it.actor), " ", it.action, it.target ? [" ", h("b", { key: "t" }, it.target)] : null),
        h("time", { className: "mh-feed__time" }, it.time));
    }));
  }
  function niceMax(v) { var p = Math.pow(10, Math.floor(Math.log10(v || 1))); return Math.ceil(v / p) * p; }
  function BarChart(p) {
    var series = p.series || [], labels = p.labels || [];
    var W = 560, H = p.height || 200, pad = { l: 36, r: 8, t: 8, b: 24 };
    var all = []; series.forEach(function (s) { all = all.concat(s.data); });
    var max = niceMax(Math.max.apply(null, all.concat([1])));
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    var gw = iw / Math.max(labels.length, 1), bw = Math.min(28, (gw * 0.7) / Math.max(series.length, 1));
    var ticks = [0, 0.25, 0.5, 0.75, 1];
    return h("figure", { className: cx("mh-chart", p.className), style: { margin: 0 } },
      series.length > 1 || p.legend ? h("div", { className: "mh-chart__legend" }, series.map(function (s, i) {
        return h("span", { key: s.name }, h("i", { style: { background: "var(--chart-" + (i + 1) + ")" } }), s.name);
      })) : null,
      h("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": p.label || "Bar chart" },
        ticks.map(function (t) {
          var y = pad.t + ih - t * ih;
          return h("g", { key: t }, h("line", { className: "mh-chart__grid", x1: pad.l, x2: W - pad.r, y1: y, y2: y }),
            h("text", { className: "mh-chart__axis", x: pad.l - 8, y: y + 4, textAnchor: "end" }, p.format ? p.format(max * t) : Math.round(max * t)));
        }),
        labels.map(function (lab, gi) {
          var gx = pad.l + gi * gw + (gw - bw * series.length) / 2;
          return h("g", { key: lab },
            series.map(function (s, si) {
              var v = s.data[gi] || 0, bh = (v / max) * ih;
              return h("rect", { key: si, x: gx + si * bw, y: pad.t + ih - bh, width: bw - 3, height: bh, rx: 1, style: { fill: "var(--chart-" + (si + 1) + ")" } }, h("title", null, s.name + " " + lab + ": " + v));
            }),
            h("text", { className: "mh-chart__axis", x: pad.l + gi * gw + gw / 2, y: H - 6, textAnchor: "middle" }, lab));
        })));
  }
  function Sparkline(p) {
    var d = p.data || [], W = p.width || 120, H = p.height || 32;
    var mn = Math.min.apply(null, d), mx = Math.max.apply(null, d), rg = mx - mn || 1;
    var pts = d.map(function (v, i) { return [(i / Math.max(d.length - 1, 1)) * W, H - 2 - ((v - mn) / rg) * (H - 4)]; });
    var line = pts.map(function (q, i) { return (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }).join("");
    return h("svg", { className: cx("mh-spark", p.className), width: W, height: H, viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": p.label || "Trend" },
      h("path", { className: "mh-spark__area", d: line + "L" + W + " " + H + "L0 " + H + "Z" }), h("path", { className: "mh-spark__line", d: line }));
  }
  function Toolbar(p) {
    return h("div", { className: cx("mh-toolbar", p.className), role: "toolbar", "aria-label": p.label || "Filters" },
      p.search === false ? null : h(SearchInput, { placeholder: p.searchPlaceholder || "Search…" }),
      (p.filters || []).map(function (f) { return h(Chip, { key: f.label, active: f.active, onClick: f.onClick || function () {} }, f.label); }),
      p.actions || null);
  }
  function BulkActionBar(p) {
    if (!p.count) return null;
    return h("div", { className: cx("mh-bulkbar", p.className), role: "region", "aria-label": "Bulk actions" },
      h("span", null, h("b", null, p.count), " selected"),
      h("div", { className: "mh-bulkbar__actions" }, p.actions, p.onClear ? h(IconButton, { icon: "x", label: "Clear selection", size: "sm", onClick: p.onClear }) : null));
  }
  function CommandPalette(p) {
    var r = R();
    var q = r.useState("");
    var active = r.useState(0);
    var items = (p.items || []).filter(function (it) { return it.label.toLowerCase().indexOf(q[0].toLowerCase()) >= 0; });
    var groups = [];
    items.forEach(function (it) { var g = it.group || ""; if (groups.indexOf(g) < 0) groups.push(g); });
    var listId = useId("cmd");
    var idx = 0;
    var run = function (it) { if (it && it.onSelect) it.onSelect(); if (p.onSelect) p.onSelect(it); };
    return h("div", { className: cx("mh-cmd", p.className), role: "dialog", "aria-label": "Command palette" },
      h("div", { className: "mh-cmd__input" }, h(Icon, { name: "search", size: 18 }),
        h("input", { autoFocus: p.autoFocus, value: q[0], placeholder: p.placeholder || "Type a command or search…", role: "combobox", "aria-expanded": true, "aria-controls": listId,
          "aria-activedescendant": items.length ? listId + "-" + Math.min(active[0], items.length - 1) : undefined,
          onChange: function (e) { q[1](e.target.value); active[1](0); },
          onKeyDown: function (e) {
            if (e.key === "ArrowDown") { e.preventDefault(); active[1](Math.min(active[0] + 1, items.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); active[1](Math.max(active[0] - 1, 0)); }
            else if (e.key === "Enter") run(items[active[0]]);
            else if (e.key === "Escape" && p.onClose) p.onClose();
          } }), h(Kbd, null, "esc")),
      items.length ? h("ul", { className: "mh-cmd__list", role: "listbox", id: listId }, groups.map(function (g) {
        return [g ? h("li", { key: "g" + g, className: "mh-cmd__group", role: "presentation" }, g) : null].concat(items.filter(function (it) { return (it.group || "") === g; }).map(function (it) {
          var i = idx++;
          return h("li", { key: it.label, id: listId + "-" + i, role: "option", className: "mh-cmd__item", "aria-selected": i === active[0], onMouseEnter: function () { active[1](i); }, onClick: function () { run(it); } },
            h(Icon, { name: it.icon || "arrow-right", size: 16 }), it.label, it.shortcut ? h(Kbd, null, it.shortcut) : null);
        }));
      })) : h("div", { className: "mh-cmd__empty" }, "No results for “" + q[0] + "”"),
      h("div", { className: "mh-cmd__foot" }, h("span", null, h(Kbd, null, "↑↓"), " navigate"), h("span", null, h(Kbd, null, "↵"), " open")));
  }

  /* ══════ Page compositions ══════ */
  var DEMO_LINKS = [{ label: "Work" }, { label: "Services" }, { label: "Writing" }, { label: "About" }];
  function PortfolioPage(p) {
    return h("div", { className: "mh-page-site" },
      h(Navbar, { logoSize: 28, links: DEMO_LINKS, active: "Work", action: h("div", { className: "mh-row", style: { gap: 8 } }, h(ThemeToggle, { persist: p.persistTheme }), h(Button, { size: "sm" }, "Let's talk")) }),
      h(Hero, { eyebrow: "Tech Lead · Cairo / Remote", title: "I build platforms that", highlight: "ship.", lead: "Twelve years turning product ideas into reliable systems: clean architecture, one mutation pipeline, web and mobile from one API.",
        actions: [h(Button, { key: 1, size: "lg", trailingIcon: "arrow-right" }, "See my work"), h(Button, { key: 2, size: "lg", variant: "outline", leadingIcon: "download" }, "Résumé")] }),
      h("div", { className: "mh-grid-4" }, h(StatCard, { label: "Years shipping", value: "12" }), h(StatCard, { label: "Products launched", value: "30+" }), h(StatCard, { label: "Test coverage", value: "82%", delta: "+4 pts", trend: "up" }), h(StatCard, { label: "Team led", value: "14" })),
      h("section", null, h(SectionHeading, { eyebrow: "Selected work", title: "Case studies", action: h(Button, { variant: "ghost", trailingIcon: "arrow-right" }, "All projects") }),
        h("div", { className: "mh-grid-3" },
          h(ProjectCard, { category: "EdTech", year: "2026", title: "LEAP platform", imageAsset: "project-leap", description: "LMS and professional network in English and Arabic.", tags: ["Bun", "Elysia", "Flutter"] }),
          h(ProjectCard, { category: "Fintech", year: "2024", title: "Ledger core", imageAsset: "project-ledger", description: "Double-entry ledger with audit trails and idempotent writes.", tags: ["Postgres", "Go"] }),
          h(ProjectCard, { category: "SaaS", year: "2023", title: "Ops console", imageAsset: "project-console", description: "Admin and analytics for a multi-tenant B2B product.", tags: ["React", "Laravel"] }))),
      h("section", null, h(SectionHeading, { eyebrow: "Services", title: "How I can help" }),
        h("div", { className: "mh-grid-3" },
          h(ServiceCard, { icon: "layers", title: "Architecture", description: "Systems that survive the second year.", points: ["Domain modelling", "Clean layers", "ADRs"] }),
          h(ServiceCard, { icon: "users", title: "Technical leadership", description: "Teams that ship calmly.", points: ["Hiring loops", "Code review culture", "Roadmaps"] }),
          h(ServiceCard, { icon: "zap", title: "MVP builds", description: "From idea to production in weeks.", points: ["Web + mobile", "CI/CD", "Observability"] }))),
      h("div", { className: "mh-grid-2" },
        h("section", null, h(SectionHeading, { eyebrow: "Experience", title: "Career" }), h(Timeline, { items: [{ meta: "2024 — now", title: "Tech Lead, LEAP" }, { meta: "2020 — 2024", title: "Senior Full-Stack Developer" }, { meta: "2014 — 2020", title: "Full-Stack Developer" }] })),
        h("section", null, h(SectionHeading, { eyebrow: "Skills", title: "Toolbox" }), h(SkillMeter, { skills: [{ name: "TypeScript", level: 5 }, { name: "PHP / Laravel", level: 5 }, { name: "Postgres", level: 4 }, { name: "Flutter", level: 4 }, { name: "DevOps", level: 4 }] }))),
      h(Testimonial, { quote: "Mohamed turned a tangle of services into a platform the whole team understands. We ship twice as often with half the incidents.", name: "Sara Ali", role: "CTO, LEAP" }),
      h(CtaBand, { title: "Have a project in mind?", description: "I reply within a day.", action: h(Button, { size: "lg", trailingIcon: "send" }, "Get in touch") }),
      h(Footer, { blurb: "Tech lead building reliable platforms for web and mobile.", columns: [{ title: "Site", links: DEMO_LINKS }, { title: "Elsewhere", links: [{ label: "GitHub" }, { label: "LinkedIn" }] }, { title: "Contact", links: [{ label: "Email" }, { label: "Book a call" }] }],
        end: h(SocialLinks, { links: [{ label: "GitHub", icon: "github" }, { label: "LinkedIn", icon: "linkedin" }, { label: "Email", icon: "mail" }] }) }));
  }
  var ADMIN_NAV = [
    { items: [{ label: "Dashboard", icon: "home" }, { label: "Projects", icon: "briefcase", count: 3 }, { label: "Posts", icon: "edit" }, { label: "Messages", icon: "mail", count: 12 }] },
    { label: "Manage", items: [{ label: "Users", icon: "users" }, { label: "Analytics", icon: "bar-chart" }, { label: "Settings", icon: "settings" }] }
  ];
  function AdminDashboardPage(p) {
    var sel = R().useState(2);
    return h(AppShell, {
      sidebar: h(Sidebar, { groups: ADMIN_NAV, active: "Dashboard", user: { name: "Mohamed Habib", role: "Owner", avatarAsset: "profile" } }),
      topbar: h(Topbar, { title: "Dashboard", persistTheme: p.persistTheme, actions: h(IconButton, { icon: "bell", label: "Notifications", variant: "outline" }) })
    },
      h("div", { className: "mh-grid-4" },
        h(StatCard, { label: "Visitors (30d)", value: "18.2k", delta: "+12%", trend: "up" }),
        h(StatCard, { label: "Leads", value: "64", delta: "+9", trend: "up" }),
        h(StatCard, { label: "Bounce rate", value: "38%", delta: "-3 pts", trend: "up" }),
        h(StatCard, { label: "Uptime", value: "99.98%" })),
      h("div", { className: "mh-grid-2", style: { gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr)" } },
        h(Card, { title: "Traffic by channel" }, h(BarChart, { labels: ["Jun", "Jul", "Aug", "Sep", "Oct"], series: [{ name: "Organic", data: [420, 510, 610, 580, 720] }, { name: "Referral", data: [210, 260, 240, 330, 390] }, { name: "Social", data: [120, 180, 150, 210, 260] }], legend: true })),
        h(Card, { title: "Recent activity" }, h(ActivityFeed, { items: [{ actor: "Sara Ali", action: "sent a message about", target: "MVP build", time: "2m", unread: true }, { actor: "Omar K", action: "commented on", target: "Ledger core", time: "1h" }, { actor: "Lee C", action: "booked a call", time: "3h" }] }))),
      h("div", { className: "mh-stack", style: { gap: 12 } },
        h(Toolbar, { searchPlaceholder: "Search projects", filters: [{ label: "All", active: true }, { label: "Published" }, { label: "Drafts" }], actions: h(Button, { size: "sm", leadingIcon: "plus" }, "New project") }),
        h(BulkActionBar, { count: sel[0], onClear: function () { sel[1](0); }, actions: [h(Button, { key: 1, size: "sm", variant: "outline" }, "Publish"), h(Button, { key: 2, size: "sm", variant: "danger" }, "Delete")] }),
        h(DataTable, { caption: "Projects", columns: [{ key: "t", label: "Project" }, { key: "s", label: "Status", render: function (r) { return h(Badge, { variant: r.s === "Live" ? "success" : "neutral", dot: r.s === "Live" }, r.s); } }, { key: "v", label: "Views", align: "end" }, { key: "trend", label: "Trend", render: function (r) { return h(Sparkline, { data: r.trend, width: 80, height: 24 }); } }],
          rows: [{ t: "LEAP platform", s: "Live", v: "8,214", trend: [3, 5, 4, 6, 8, 7, 9] }, { t: "Ledger core", s: "Live", v: "3,102", trend: [4, 4, 5, 3, 5, 6, 6] }, { t: "Ops console", s: "Draft", v: "—", trend: [1, 2, 2, 3, 2, 3, 4] }] }),
        h(Pagination, { pageCount: 8, defaultPage: 1 })));
  }
  var MARK_SVG = function (cls) { return h(MarkArt, { className: cls, fill: "var(--lime-500)" }); };
  function SignInPage(p) {
    return h("div", { className: "mh-auth" },
      h("div", { className: "mh-auth__art" }, h(Logo, { size: 30 }), h("p", { className: "mh-auth__quote" }, "Build calm systems. Ship often."), MARK_SVG("mh-auth__shape")),
      h("form", { className: "mh-auth__form", onSubmit: function (e) { e.preventDefault(); } },
        h("div", { className: "mh-row mh-row--between" }, h("h1", { className: "mh-auth__title" }, "Sign in"), h(ThemeToggle, { persist: p.persistTheme })),
        h("p", { className: "mh-auth__sub" }, "Admin console for habib.dev"),
        h(Input, { label: "Email", type: "email", leadingIcon: "mail", placeholder: "you@company.com", autoComplete: "email" }),
        h(Input, { label: "Password", type: "password", placeholder: "••••••••", autoComplete: "current-password" }),
        h("div", { className: "mh-row mh-row--between" }, h(Checkbox, { label: "Remember me" }), h("a", { className: "mh-link", href: "#", style: { fontSize: 14 } }, "Forgot password?")),
        h(Button, { type: "submit", block: true, size: "lg" }, "Sign in"),
        h(Divider, { label: "or" }),
        h(Button, { variant: "outline", block: true, leadingIcon: "github" }, "Continue with GitHub")));
  }

  /* ══════ More icons (forms, CV) ══════ */

  /* ══════ Sliders ══════ */
  function RangeSlider(p) {
    var min = p.min == null ? 0 : p.min, max = p.max == null ? 100 : p.max, step = p.step || 1;
    var st = useControlled(p.value, p.defaultValue || [min, max]);
    var id = useId("range");
    var lo = st[0][0], hi = st[0][1];
    var pct = function (v) { return ((v - min) / (max - min)) * 100; };
    var set = function (i, v) {
      var next = i === 0 ? [Math.min(v, hi - step), hi] : [lo, Math.max(v, lo + step)];
      st[1](next); if (p.onChange) p.onChange(next);
    };
    var fmt = p.format || function (v) { return v; };
    return h("div", { className: cx("mh-slider mh-range", p.className), role: "group", "aria-labelledby": id },
      h("div", { className: "mh-slider__head" }, h("span", { id: id }, p.label), h("output", null, fmt(lo) + " – " + fmt(hi))),
      h("div", { className: "mh-range__track", style: { "--mh-lo": pct(lo) + "%", "--mh-hi": pct(hi) + "%" } },
        [lo, hi].map(function (v, i) {
          return h("input", { key: i, type: "range", min: min, max: max, step: step, value: v, "aria-label": (i ? "Maximum " : "Minimum ") + (p.label || ""),
            onChange: function (e) { set(i, Number(e.target.value)); } });
        })));
  }
  function Carousel(p) {
    var r = R();
    var slides = p.slides || [];
    var st = useControlled(p.index, p.defaultIndex || 0);
    var touch = r.useRef(null);
    var perView0 = p.perView || 1;
    var stops = Math.max(1, slides.length - perView0 + 1);
    var go = function (i) { var n = (i + stops) % stops; st[1](n); if (p.onChange) p.onChange(n); };
    r.useEffect(function () {
      if (!p.autoPlay || slides.length < 2) return undefined;
      var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return undefined;
      var t = setInterval(function () { go(st[0] + 1); }, p.interval || 5000);
      return function () { clearInterval(t); };
    }, [st[0], p.autoPlay]);
    var perView = p.perView || 1;
    return h("section", { className: cx("mh-carousel", p.className), "aria-roledescription": "carousel", "aria-label": p.label || "Slides",
      onKeyDown: function (e) { if (e.key === "ArrowRight") go(st[0] + 1); if (e.key === "ArrowLeft") go(st[0] - 1); } },
      h("div", { className: "mh-carousel__viewport",
        onTouchStart: function (e) { touch.current = e.touches[0].clientX; },
        onTouchEnd: function (e) { if (touch.current == null) return; var dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(st[0] + (dx < 0 ? 1 : -1)); touch.current = null; } },
        h("div", { className: "mh-carousel__track", style: { transform: "translateX(" + (-st[0] * 100 / perView) + "%)" } },
          slides.map(function (s, i) {
            return h("div", { key: i, className: "mh-carousel__slide", style: { flexBasis: 100 / perView + "%" }, role: "group", "aria-roledescription": "slide", "aria-label": (i + 1) + " of " + slides.length, "aria-hidden": i < st[0] || i >= st[0] + perView }, s);
          }))),
      slides.length > perView ? h("div", { className: "mh-carousel__controls" },
        h(IconButton, { icon: "chevron-left", label: "Previous slide", variant: "outline", size: "sm", onClick: function () { go(st[0] - 1); } }),
        h("div", { className: "mh-carousel__dots" }, Array.from({ length: stops }, function (_, i) {
          return h("button", { key: i, type: "button", className: "mh-carousel__dot", "aria-label": "Go to slide " + (i + 1), "aria-current": i === st[0] ? "true" : undefined, onClick: function () { go(i); } });
        })),
        h(IconButton, { icon: "chevron-right", label: "Next slide", variant: "outline", size: "sm", onClick: function () { go(st[0] + 1); } })) : null);
  }

  /* ══════ Form building blocks ══════ */
  function FormSection(p) {
    return h("section", { className: cx("mh-formsec", p.className) },
      h("div", { className: "mh-formsec__head" }, h("h3", { className: "mh-formsec__title" }, p.title), p.description ? h("p", { className: "mh-formsec__desc" }, p.description) : null),
      h("div", { className: cx("mh-formsec__body", p.columns === 2 && "mh-formsec__body--2") }, p.children),
      p.footer ? h("div", { className: "mh-formsec__foot" }, p.footer) : null);
  }
  function NumberInput(p) {
    var min = p.min == null ? -Infinity : p.min, max = p.max == null ? Infinity : p.max, step = p.step || 1;
    var st = useControlled(p.value, p.defaultValue == null ? 0 : p.defaultValue);
    var _auto = useId("num"); var id = p.id || _auto;
    var set = function (v) { var n = Math.min(max, Math.max(min, v)); st[1](n); if (p.onChange) p.onChange(n); };
    return Field(Object.assign({}, p, { id: id }), h("div", { className: "mh-number" },
      h("button", { type: "button", className: "mh-number__btn", "aria-label": "Decrease", disabled: st[0] <= min, onClick: function () { set(st[0] - step); } }, h(Icon, { name: "minus", size: 14 })),
      h("input", { id: id, className: "mh-input", inputMode: "decimal", value: st[0], "aria-invalid": p.error ? true : undefined,
        onChange: function (e) { var v = Number(e.target.value); if (!isNaN(v)) set(v); } }),
      p.unit ? h("span", { className: "mh-number__unit" }, p.unit) : null,
      h("button", { type: "button", className: "mh-number__btn", "aria-label": "Increase", disabled: st[0] >= max, onClick: function () { set(st[0] + step); } }, h(Icon, { name: "plus", size: 14 }))));
  }
  function passwordScore(v) {
    var s = 0; if (v.length >= 8) s++; if (v.length >= 12) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(4, s);
  }
  function PasswordInput(p) {
    var show = R().useState(false);
    var st = useControlled(p.value, p.defaultValue || "");
    var _auto = useId("pw"); var id = p.id || _auto;
    var score = passwordScore(st[0]);
    var words = ["Too short", "Weak", "Fair", "Good", "Strong"];
    return Field(Object.assign({}, p, { id: id }), h("div", { className: "mh-stack", style: { gap: 8 } },
      h("div", { className: "mh-control" },
        h("input", { id: id, className: "mh-input", type: show[0] ? "text" : "password", value: st[0], autoComplete: p.autoComplete || "new-password", placeholder: p.placeholder,
          "aria-invalid": p.error ? true : undefined, style: { paddingInlineEnd: 44 }, onChange: function (e) { st[1](e.target.value); if (p.onChange) p.onChange(e.target.value); } }),
        h("button", { type: "button", className: "mh-control__end", "aria-label": show[0] ? "Hide password" : "Show password", "aria-pressed": show[0], onClick: function () { show[1](!show[0]); } }, h(Icon, { name: show[0] ? "eye-off" : "eye", size: 16 }))),
      p.meter === false ? null : h("div", { className: "mh-strength", "data-score": score, "aria-live": "polite" },
        h("span", { className: "mh-strength__bars", "aria-hidden": true }, [1, 2, 3, 4].map(function (n) { return h("i", { key: n, className: n <= score ? "on" : "" }); })),
        h("span", null, st[0] ? words[score] : "Use 12+ characters with a mix of types"))));
  }
  var COUNTRY_CODES = [{ value: "+20", label: "EG +20" }, { value: "+966", label: "SA +966" }, { value: "+971", label: "AE +971" }, { value: "+965", label: "KW +965" }, { value: "+974", label: "QA +974" }, { value: "+44", label: "UK +44" }, { value: "+1", label: "US +1" }, { value: "+49", label: "DE +49" }];
  function PhoneInput(p) {
    var _auto = useId("tel"); var id = p.id || _auto;
    return Field(Object.assign({}, p, { id: id }), h("div", { className: "mh-phone" },
      h("select", { className: "mh-select", "aria-label": "Country code", defaultValue: p.defaultCode || "+20", onChange: p.onCodeChange && function (e) { p.onCodeChange(e.target.value); } },
        (p.codes || COUNTRY_CODES).map(function (c) { return h("option", { key: c.value, value: c.value }, c.label); })),
      h("input", { id: id, className: "mh-input", type: "tel", inputMode: "tel", autoComplete: "tel-national", placeholder: p.placeholder || "10 1234 5678", defaultValue: p.defaultValue, value: p.value, onChange: p.onChange, "aria-invalid": p.error ? true : undefined })));
  }
  function DateRangeField(p) {
    var st = useControlled(p.value, p.defaultValue || { start: "", end: "", current: false });
    var base = useId("dates");
    var upd = function (k, v) { var next = Object.assign({}, st[0]); next[k] = v; st[1](next); if (p.onChange) p.onChange(next); };
    return h("fieldset", { className: cx("mh-daterange", p.className) },
      p.label ? h("legend", { className: "mh-field__label" }, p.label) : null,
      h("div", { className: "mh-daterange__row" },
        h(Input, { id: base + "-s", label: "Start", type: "month", value: st[0].start, onChange: function (e) { upd("start", e.target.value); } }),
        h(Input, { id: base + "-e", label: "End", type: "month", value: st[0].current ? "" : st[0].end, disabled: st[0].current, onChange: function (e) { upd("end", e.target.value); } })),
      p.allowCurrent === false ? null : h(Checkbox, { label: p.currentLabel || "I currently work here", checked: !!st[0].current, onChange: function (e) { upd("current", e.target.checked); } }));
  }
  function Rating(p) {
    var max = p.max || 5;
    var st = useControlled(p.value, p.defaultValue || 0);
    var hover = R().useState(0);
    var name = useId("rating");
    var shown = hover[0] || st[0];
    return h("fieldset", { className: cx("mh-rating", p.className), onMouseLeave: function () { hover[1](0); } },
      h("legend", { className: p.label ? "mh-field__label" : "mh-sr" }, p.label || "Rating"),
      h("div", { className: "mh-rating__stars" }, Array.from({ length: max }, function (_, i) {
        var n = i + 1;
        return h("label", { key: n, className: cx("mh-rating__star", n <= shown && "mh-rating__star--on"), onMouseEnter: p.readOnly ? undefined : function () { hover[1](n); } },
          h("input", { type: "radio", name: name, value: n, checked: st[0] === n, disabled: p.readOnly, onChange: function () { st[1](n); if (p.onChange) p.onChange(n); } }),
          h(Icon, { name: "star", size: p.size || 20 }), h("span", { className: "mh-sr" }, n + (n === 1 ? " star" : " stars")));
      })));
  }
  function SwatchPicker(p) {
    var st = useControlled(p.value, p.defaultValue || (p.swatches && p.swatches[0] && p.swatches[0].value));
    return h("div", { className: cx("mh-swatches", p.className), role: "radiogroup", "aria-label": p.label || "Colour" },
      (p.swatches || []).map(function (s) {
        return h("button", { key: s.value, type: "button", role: "radio", "aria-checked": st[0] === s.value, "aria-label": s.label, title: s.label, className: "mh-swatch", style: { "--mh-swatch": s.value },
          onClick: function () { st[1](s.value); if (p.onChange) p.onChange(s.value); } }, st[0] === s.value ? h(Icon, { name: "check", size: 14, strokeWidth: 3 }) : null);
      }));
  }
  function RichTextEditor(p) {
    var r = R();
    var ref = r.useRef(null);
    var cmd = function (c) { document.execCommand(c, false); if (ref.current) ref.current.focus(); };
    var _auto = useId("rte");
    var tools = [["bold", "bold", "Bold"], ["italic", "italic", "Italic"], ["insertUnorderedList", "list", "Bulleted list"]];
    return h("div", { className: cx("mh-field", p.className) },
      p.label ? h("span", { className: "mh-field__label", id: _auto + "-l" }, p.label) : null,
      h("div", { className: "mh-rte" },
        h("div", { className: "mh-rte__toolbar", role: "toolbar", "aria-label": "Formatting" },
          tools.map(function (t) { return h("button", { key: t[0], type: "button", "aria-label": t[2], title: t[2], onMouseDown: function (e) { e.preventDefault(); cmd(t[0]); } }, h(Icon, { name: t[1], size: 16 })); }),
          p.onAssist ? h("button", { type: "button", className: "mh-rte__assist", onClick: p.onAssist }, h(Icon, { name: "sparkles", size: 15 }), p.assistLabel || "Improve") : null),
        h("div", { ref: ref, className: "mh-rte__area", contentEditable: !p.readOnly, suppressContentEditableWarning: true, role: "textbox", "aria-multiline": true,
          "aria-labelledby": p.label ? _auto + "-l" : undefined, "data-placeholder": p.placeholder || "",
          dangerouslySetInnerHTML: p.defaultHtml ? { __html: p.defaultHtml } : undefined,
          onInput: p.onChange ? function (e) { p.onChange(e.currentTarget.innerHTML); } : undefined })),
      p.hint ? h("span", { className: "mh-field__hint" }, p.hint) : null);
  }

  /* ══════ CV builder ══════ */
  function PhotoUpload(p) {
    useAssets();
    var st = useControlled(p.src, p.defaultSrc || imageAsset(p.defaultAsset) || "");
    var id = useId("photo");
    return h("div", { className: cx("mh-photo", p.className) },
      h("span", { className: "mh-photo__frame" }, st[0] ? h("img", { src: st[0], alt: "" }) : h(Avatar, { name: p.name || "?", size: "lg" })),
      h("div", { className: "mh-stack", style: { gap: 6 } },
        h("span", { className: "mh-field__label" }, p.label || "Photo"),
        h("div", { className: "mh-row", style: { gap: 8 } },
          h("label", { htmlFor: id, className: "mh-btn mh-btn--outline mh-btn--sm" }, h(Icon, { name: "upload", size: 14 }), st[0] ? "Replace" : "Upload"),
          st[0] ? h(Button, { variant: "ghost", size: "sm", onClick: function () { st[1](""); if (p.onChange) p.onChange(""); } }, "Remove") : null),
        h("input", { id: id, type: "file", accept: "image/*", className: "mh-sr", onChange: function (e) {
          var f = e.target.files && e.target.files[0]; if (!f) return;
          var url = URL.createObjectURL(f); st[1](url); if (p.onChange) p.onChange(url, f);
        } }),
        h("span", { className: "mh-field__hint" }, p.hint || "Square, at least 400px. JPG or PNG.")));
  }
  function SectionEditor(p) {
    var open = useControlled(p.open, p.defaultOpen !== false);
    var id = useId("sec");
    return h("section", { className: cx("mh-seced", !open[0] && "mh-seced--closed", p.className) },
      h("header", { className: "mh-seced__head" },
        p.draggable === false ? null : h("span", { className: "mh-seced__grip", "aria-hidden": true }, h(Icon, { name: "grip", size: 16 })),
        h("span", { className: "mh-seced__icon", "aria-hidden": true }, h(Icon, { name: p.icon || "file", size: 16 })),
        h("h3", { className: "mh-seced__title" }, h("button", { type: "button", "aria-expanded": open[0], "aria-controls": id, onClick: function () { open[1](!open[0]); if (p.onToggle) p.onToggle(!open[0]); } },
          p.title, p.count != null ? h("span", { className: "mh-tab__count" }, p.count) : null, h(Icon, { name: "chevron-down", size: 16 }))),
        p.onMoveUp ? h(IconButton, { icon: "arrow-up", label: "Move " + p.title + " up", size: "sm", onClick: p.onMoveUp }) : null,
        p.onMoveDown ? h(IconButton, { icon: "arrow-down", label: "Move " + p.title + " down", size: "sm", onClick: p.onMoveDown }) : null,
        p.menu || null),
      open[0] ? h("div", { className: "mh-seced__body", id: id }, p.children) : null);
  }
  function RepeatableList(p) {
    var items = useControlled(p.items, p.defaultItems || []);
    var open = R().useState(p.defaultOpenIndex == null ? 0 : p.defaultOpenIndex);
    var set = function (next) { items[1](next); if (p.onChange) p.onChange(next); };
    var move = function (i, d) { var n = items[0].slice(); var t = n[i]; n[i] = n[i + d]; n[i + d] = t; set(n); open[1](i + d); };
    return h("div", { className: cx("mh-repeat", p.className) },
      items[0].map(function (it, i) {
        var isOpen = open[0] === i;
        return h("div", { key: it.id || i, className: cx("mh-repeat__item", isOpen && "mh-repeat__item--open") },
          h("div", { className: "mh-repeat__head" },
            h("button", { type: "button", className: "mh-repeat__toggle", "aria-expanded": isOpen, onClick: function () { open[1](isOpen ? -1 : i); } },
              h("span", { className: "mh-repeat__title" }, p.titleOf ? p.titleOf(it) : it.title || "Untitled"),
              p.subtitleOf ? h("span", { className: "mh-repeat__sub" }, p.subtitleOf(it)) : null),
            h(IconButton, { icon: "arrow-up", label: "Move up", size: "sm", disabled: i === 0, onClick: function () { move(i, -1); } }),
            h(IconButton, { icon: "arrow-down", label: "Move down", size: "sm", disabled: i === items[0].length - 1, onClick: function () { move(i, 1); } }),
            h(IconButton, { icon: "trash", label: "Remove", size: "sm", onClick: function () { set(items[0].filter(function (_, j) { return j !== i; })); } })),
          isOpen && p.renderItem ? h("div", { className: "mh-repeat__body" }, p.renderItem(it, i, function (patch) {
            set(items[0].map(function (x, j) { return j === i ? Object.assign({}, x, patch) : x; }));
          })) : null);
      }),
      h(Button, { variant: "outline", leadingIcon: "plus", block: true, onClick: function () {
        var blank = p.newItem ? p.newItem() : { title: "" };
        set(items[0].concat([Object.assign({ id: "n" + Date.now() }, blank)])); open[1](items[0].length);
      } }, p.addLabel || "Add item"));
  }
  function CompletenessMeter(p) {
    var steps = p.steps || [];
    var done = steps.filter(function (s) { return s.done; }).length;
    var pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
    return h("div", { className: cx("mh-complete", p.className) },
      h("div", { className: "mh-complete__head" }, h("span", null, p.label || "CV strength"), h("strong", null, pct + "%")),
      h("div", { className: "mh-progress__track", role: "progressbar", "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": p.label || "CV strength" },
        h("div", { className: "mh-progress__fill", style: { width: pct + "%" } })),
      h("ul", { className: "mh-complete__list" }, steps.map(function (s) {
        return h("li", { key: s.label, className: s.done ? "is-done" : "" },
          h("span", { className: "mh-complete__tick", "aria-hidden": true }, s.done ? h(Icon, { name: "check", size: 12, strokeWidth: 3 }) : null),
          h("span", null, s.label, h("span", { className: "mh-sr" }, s.done ? " (done)" : " (to do)")),
          !s.done && s.hint ? h("span", { className: "mh-complete__hint" }, s.hint) : null);
      })));
  }
  var CV_TEMPLATES = [{ value: "modern", label: "Modern" }, { value: "classic", label: "Classic" }, { value: "compact", label: "Compact" }];
  function TemplatePicker(p) {
    useAssets();
    var st = useControlled(p.value, p.defaultValue || "modern");
    return h("div", { className: cx("mh-templates", p.className), role: "radiogroup", "aria-label": p.label || "CV template" },
      (p.templates || CV_TEMPLATES).map(function (t) {
        return h("button", { key: t.value, type: "button", role: "radio", "aria-checked": st[0] === t.value, className: "mh-template", onClick: function () { st[1](t.value); if (p.onChange) p.onChange(t.value); } },
          h("span", { className: "mh-template__thumb", "aria-hidden": true }, (t.src || templateAsset(t.value)) ? h("img", { src: t.src || templateAsset(t.value), alt: "" }) : null),
          h("span", { className: "mh-template__label" }, t.label));
      }));
  }
  var SAMPLE_CV = {
    name: "Mohamed Habib", title: "Tech Lead", photoAsset: "profile", email: "hello@habib.dev", phone: "+20 10 0000 0000", location: "Cairo, Egypt", website: "habib.dev",
    summary: "Tech lead with 12 years building reliable platforms for web and mobile. I design clean architectures, lead calm teams and ship bilingual products.",
    experience: [
      { role: "Tech Lead", company: "LEAP PM Services", start: "2024", end: "Present", bullets: ["Architected an LMS + professional network on Bun, Elysia and Flutter.", "Raised test coverage to 82% and cut p95 latency by 38ms."] },
      { role: "Senior Full-Stack Developer", company: "Freelance", start: "2020", end: "2024", bullets: ["Delivered 15+ Laravel and React products for Gulf clients."] }
    ],
    education: [{ degree: "B.Sc. Computer Science", school: "Cairo University", start: "2010", end: "2014" }],
    skills: [{ name: "TypeScript", level: 5 }, { name: "PHP / Laravel", level: 5 }, { name: "Postgres", level: 4 }, { name: "Flutter", level: 4 }, { name: "DevOps", level: 4 }],
    languages: [{ name: "Arabic", level: "Native" }, { name: "English", level: "Professional" }]
  };
  function CvPreview(p) {
    useAssets();
    var cv = p.cv || SAMPLE_CV;
    var photo = cv.photo || imageAsset(cv.photoAsset);
    var tpl = p.template || "modern";
    var contact = [cv.email, cv.phone, cv.location, cv.website].filter(Boolean);
    var sec = function (title, body) { return h("section", { className: "mh-cv__sec" }, h("h3", { className: "mh-cv__h" }, title), body); };
    var exp = sec("Experience", (cv.experience || []).map(function (x, i) {
      return h("div", { key: i, className: "mh-cv__item" },
        h("div", { className: "mh-cv__itemhead" }, h("strong", null, x.role), h("span", null, x.start + " — " + (x.current ? "Present" : x.end))),
        h("div", { className: "mh-cv__org" }, x.company),
        x.bullets && x.bullets.length ? h("ul", null, x.bullets.map(function (b, j) { return h("li", { key: j }, b); })) : null);
    }));
    var edu = sec("Education", (cv.education || []).map(function (x, i) {
      return h("div", { key: i, className: "mh-cv__item" }, h("div", { className: "mh-cv__itemhead" }, h("strong", null, x.degree), h("span", null, x.start + " — " + x.end)), h("div", { className: "mh-cv__org" }, x.school));
    }));
    var skills = sec("Skills", h("ul", { className: "mh-cv__skills" }, (cv.skills || []).map(function (s) {
      return h("li", { key: s.name }, h("span", null, s.name), h("span", { className: "mh-cv__dots", "aria-label": s.level + " of 5" }, [1, 2, 3, 4, 5].map(function (n) { return h("i", { key: n, className: n <= s.level ? "on" : "" }); })));
    })));
    var langs = sec("Languages", h("ul", { className: "mh-cv__plain" }, (cv.languages || []).map(function (l) { return h("li", { key: l.name }, h("span", null, l.name), h("span", null, l.level)); })));
    var head = h("header", { className: "mh-cv__header" },
      h("div", null, h("h2", { className: "mh-cv__name" }, cv.name), h("div", { className: "mh-cv__title" }, cv.title)),
      tpl === "modern" ? null : h("ul", { className: "mh-cv__contact" }, contact.map(function (c) { return h("li", { key: c }, c); })));
    var paper = tpl === "modern"
      ? h("div", { className: "mh-cv__cols" },
          h("aside", { className: "mh-cv__side" },
            photo ? h("img", { className: "mh-cv__photo", src: photo, alt: "" }) : h("span", { className: "mh-cv__mono", "aria-hidden": true }, initials(cv.name)),
            sec("Contact", h("ul", { className: "mh-cv__plain mh-cv__plain--stack" }, contact.map(function (c) { return h("li", { key: c }, c); }))), skills, langs),
          h("div", { className: "mh-cv__main" }, head, cv.summary ? sec("Profile", h("p", null, cv.summary)) : null, exp, edu))
      : h("div", { className: "mh-cv__single" }, head, cv.summary ? sec("Profile", h("p", null, cv.summary)) : null, exp, edu,
          h("div", { className: "mh-cv__split" }, skills, langs));
    return h("article", { className: cx("mh-cv", "mh-cv--" + tpl, p.className), style: { "--cv-accent": p.accent || "#3d5806" }, "aria-label": "CV preview" }, paper);
  }
  var CV_SWATCHES = [{ value: "#3d5806", label: "Olive (brand)" }, { value: "#0b0d0a", label: "Carbon" }, { value: "#2366a8", label: "Blue" }, { value: "#8f5400", label: "Amber" }, { value: "#7a5fc9", label: "Violet" }];
  function CvBuilderPage(p) {
    var r = R();
    var tpl = r.useState("modern");
    var accent = r.useState("#3d5806");
    var cv = r.useState(SAMPLE_CV);
    var upd = function (patch) { cv[1](Object.assign({}, cv[0], patch)); };
    var steps = [{ label: "Contact details", done: !!cv[0].email }, { label: "Profile summary", done: !!cv[0].summary }, { label: "2+ experience entries", done: cv[0].experience.length >= 2 },
      { label: "Education", done: cv[0].education.length > 0 }, { label: "5+ skills", done: cv[0].skills.length >= 5 }, { label: "Photo", done: !!(cv[0].photo || cv[0].photoAsset), hint: "+10%" }];
    return h("div", { className: "mh-cvb" },
      h("header", { className: "mh-cvb__bar" },
        h(Logo, { variant: "mark", size: 22 }), h("span", { className: "mh-cvb__doc" }, "CV — ", cv[0].name),
        h(Badge, { variant: "success", dot: true }, "Saved"),
        h("span", { style: { flex: 1 } }),
        h(ThemeToggle, { persist: p.persistTheme }),
        h(Button, { variant: "outline", size: "sm", leadingIcon: "eye" }, "Preview"),
        h(Button, { size: "sm", leadingIcon: "download" }, "Download PDF")),
      h("div", { className: "mh-cvb__grid" },
        h("div", { className: "mh-cvb__editor" },
          h(CompletenessMeter, { steps: steps }),
          h(SectionEditor, { title: "Personal details", icon: "user" },
            h(PhotoUpload, { name: cv[0].name, defaultAsset: "profile" }),
            h("div", { className: "mh-formsec__body mh-formsec__body--2" },
              h(Input, { label: "Full name", value: cv[0].name, onChange: function (e) { upd({ name: e.target.value }); } }),
              h(Input, { label: "Headline", value: cv[0].title, onChange: function (e) { upd({ title: e.target.value }); } }),
              h(Input, { label: "Email", type: "email", value: cv[0].email, onChange: function (e) { upd({ email: e.target.value }); } }),
              h(PhoneInput, { label: "Phone" }))),
          h(SectionEditor, { title: "Profile summary", icon: "edit" },
            h(Textarea, { label: "Summary", value: cv[0].summary, rows: 4, hint: cv[0].summary.length + " / 400 characters", onChange: function (e) { upd({ summary: e.target.value.slice(0, 400) }); } })),
          h(SectionEditor, { title: "Experience", icon: "briefcase", count: cv[0].experience.length },
            h(RepeatableList, { items: cv[0].experience, onChange: function (x) { upd({ experience: x }); }, addLabel: "Add experience",
              titleOf: function (x) { return (x.role || "New role") + (x.company ? " · " + x.company : ""); }, subtitleOf: function (x) { return (x.start || "?") + " — " + (x.current ? "Present" : x.end || "?"); },
              newItem: function () { return { role: "", company: "", start: "", end: "", bullets: [] }; },
              renderItem: function (x, i, patch) {
                return h("div", { className: "mh-formsec__body mh-formsec__body--2" },
                  h(Input, { label: "Role", value: x.role, onChange: function (e) { patch({ role: e.target.value }); } }),
                  h(Input, { label: "Company", value: x.company, onChange: function (e) { patch({ company: e.target.value }); } }),
                  h("div", { style: { gridColumn: "1 / -1" } }, h(Textarea, { label: "Highlights", hint: "One per line.", value: (x.bullets || []).join("\n"), onChange: function (e) { patch({ bullets: e.target.value.split("\n") }); } })));
              } })),
          h(SectionEditor, { title: "Skills", icon: "zap", count: cv[0].skills.length },
            h(TagInput, { label: "Skills", value: cv[0].skills.map(function (s) { return s.name; }), onChange: function (names) {
              upd({ skills: names.map(function (n) { var old = cv[0].skills.filter(function (s) { return s.name === n; })[0]; return old || { name: n, level: 3 }; }) });
            } })),
          h(SectionEditor, { title: "Education", icon: "book", defaultOpen: false }, h(Input, { label: "Degree", defaultValue: "B.Sc. Computer Science" })),
          h(SectionEditor, { title: "Languages", icon: "globe", defaultOpen: false }, h(Input, { label: "Language", defaultValue: "Arabic" }))),
        h("div", { className: "mh-cvb__preview" },
          h("div", { className: "mh-cvb__controls" }, h(TemplatePicker, { value: tpl[0], onChange: tpl[1] }), h(SwatchPicker, { label: "Accent colour", swatches: CV_SWATCHES, value: accent[0], onChange: accent[1] })),
          h("div", { className: "mh-cvb__paperwrap" }, h(CvPreview, { cv: cv[0], template: tpl[0], accent: accent[0] })))));
  }

  window.MH = {
    Logo: Logo, Icon: Icon, Button: Button, IconButton: IconButton, Badge: Badge, Avatar: Avatar, AvatarGroup: AvatarGroup,
    Card: Card, StatCard: StatCard, ProgressBar: ProgressBar, Stepper: Stepper, Timeline: Timeline,
    Tabs: Tabs, Pagination: Pagination, Breadcrumb: Breadcrumb, Navbar: Navbar,
    Input: Input, Textarea: Textarea, Select: Select, SearchInput: SearchInput, OtpInput: OtpInput,
    Checkbox: Checkbox, RadioGroup: RadioGroup, Switch: Switch,
    Alert: Alert, Toast: Toast, Modal: Modal, Tooltip: Tooltip, Spinner: Spinner, Skeleton: Skeleton, EmptyState: EmptyState,
    DataTable: DataTable, CodeBlock: CodeBlock, cx: cx, imageAsset: imageAsset, useTheme: useTheme, configure: configure, loadAssets: loadAssets, assets: ASSETS, MarkArt: MarkArt, RangeSlider: RangeSlider, Carousel: Carousel, FormSection: FormSection, NumberInput: NumberInput, PasswordInput: PasswordInput, PhoneInput: PhoneInput, DateRangeField: DateRangeField, Rating: Rating, SwatchPicker: SwatchPicker, RichTextEditor: RichTextEditor, PhotoUpload: PhotoUpload, SectionEditor: SectionEditor, RepeatableList: RepeatableList, CompletenessMeter: CompletenessMeter, TemplatePicker: TemplatePicker, CvPreview: CvPreview, CvBuilderPage: CvBuilderPage,
    ThemeToggle: ThemeToggle, SegmentedControl: SegmentedControl, LanguageSwitch: LanguageSwitch, Hero: Hero, SectionHeading: SectionHeading, ProjectCard: ProjectCard, ServiceCard: ServiceCard, Testimonial: Testimonial, SkillMeter: SkillMeter, Chip: Chip, ChipList: ChipList, SocialLinks: SocialLinks, CtaBand: CtaBand, Footer: Footer, PostCard: PostCard, Divider: Divider, Kbd: Kbd, Banner: Banner, AppShell: AppShell, Sidebar: Sidebar, Topbar: Topbar, DropdownMenu: DropdownMenu, Drawer: Drawer, Accordion: Accordion, Slider: Slider, FileDrop: FileDrop, TagInput: TagInput, DescriptionList: DescriptionList, ActivityFeed: ActivityFeed, BarChart: BarChart, Sparkline: Sparkline, Toolbar: Toolbar, BulkActionBar: BulkActionBar, CommandPalette: CommandPalette, PortfolioPage: PortfolioPage, AdminDashboardPage: AdminDashboardPage, SignInPage: SignInPage
  };
})();
