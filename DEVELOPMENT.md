# habib.dev: portfolio, dashboard, CV builder

TanStack Start (React 19, SSR on Cloudflare Workers) · Postgres via Drizzle · MH design system.

## Run it locally

```bash
bun install
cp .env.example .env.local        # then set DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH
bun run hash-password '<12+ char password>'   # paste the output into ADMIN_PASSWORD_HASH
bun run db:migrate
bun run db:seed                    # your real portfolio content + a public "mohamed-habib" CV
bun run dev                        # http://localhost:3000, dashboard at /admin
```

Vite 8 needs **Node 22.19+** (Node 18 fails with `styleText` errors). Use `nvm use 22` or Homebrew's `node`.

## What's where

| Path | |
|---|---|
| `/` | Public portfolio: hero, stats, projects, experience, skills, contact form |
| `/login`, `/admin/*` | Owner dashboard: overview, messages, profile, projects, experience, skills, CVs |
| `/admin/cvs/:id` | CV builder: content editor, live preview, template/accent, public link, ATS check |
| `GET /api/cv/:slug/pdf` | **PDF build endpoint.** Builds the latest saved CV on every request. Public CVs: anyone; private: owner only (404 otherwise). Query: `?template=modern\|classic\|compact`, `&accent=2366a8`, `&download=1` |
| `src/server/pdf.ts` | PDF renderer (pdf-lib, embedded Poppins/Barlow). Single column, real text, standard headings: ATS-readable |
| `src/server/ats.ts` | ATS checker: keyword coverage vs. job description, sections, contact, quantified bullets, action verbs, length, readability → score + suggestions |
| `src/server/fn/*` | Server functions (zod-validated; every dashboard write calls `requireOwner()`) |
| `src/db/schema.ts` | profile, experiences, projects, skills, messages, cvs, ats_reports, sessions |
| `src/design-system/` | MH components (`ui.tsx`) + generated `tokens.css` / `components.css` |
| `public/brand/` | Icons, marks, images, CV template thumbnails, fonts (from the design system) |

## Design system

Sources live in `brand/` (logo kit, fonts, design-system project). After changing them:

```bash
bun run ds:sync    # regenerates src/design-system/tokens.css + components.css and public/brand/*
```

## Auth

One owner account from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` = `pbkdf2:<iterations>:<salt>:<hash>`).
Sessions are random 256-bit ids in the `sessions` table, sent as an HttpOnly, SameSite=Lax cookie (Secure in production), 14-day expiry.
The hash uses `:` separators on purpose: env loaders expand `$`.

## Deploy (Cloudflare Workers)

```bash
wrangler secret put DATABASE_URL
wrangler secret put ADMIN_EMAIL
wrangler secret put ADMIN_PASSWORD_HASH
bun run deploy
```

The Worker connects to Postgres over TCP, so the database must be reachable from Cloudflare.
Use a hosted Postgres (Neon, Supabase, RDS…), ideally behind **Cloudflare Hyperdrive** for pooling.
Run `bun run db:migrate` and `bun run db:seed` against it once.

## Publishing to Cloudflare Workers

One-time setup (requires `bunx wrangler login`):

1. Point `DATABASE_URL` in `.env.local` at the production Postgres, then migrate and seed:
   `bun run db:migrate && bun run db:seed`
2. Create the Hyperdrive config and paste its id into `wrangler.jsonc` (`hyperdrive[0].id`):
   `bunx wrangler hyperdrive create habib-portfolio-db --connection-string="$DATABASE_URL"`
3. Set secrets (or sync them from `.env.local`: `node scripts/env-value.mjs MCP_TOKEN | bunx wrangler secret put MCP_TOKEN`):
   - `bun run hash-password '<12+ char password>'` → `bunx wrangler secret put ADMIN_PASSWORD_HASH`
   - `openssl rand -hex 32` → `bunx wrangler secret put MCP_TOKEN`
4. Set `SITE_URL`/`VITE_SITE_URL` to your real domain, then deploy: `bun run deploy`.

## SEO

Follows Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
Generated at request time from the database (nothing static to keep in sync):

- **Crawling** — `/robots.txt` (blocks `/admin`, `/login`, `/mcp`, `/api/`) and `/sitemap.xml` (pages, projects, services, image entries, `lastmod`).
- **One URL per page** — other domains and `www` 301 to `https://mohamedhabib.work`; trailing slashes 301 to the bare path
  (`src/server-entry.ts`); every page has a self-referencing canonical; `*.workers.dev` previews send `X-Robots-Tag: noindex`.
- **Titles & snippets** — `seo()` / `pageTitle()` in `src/lib/seo.ts` keep titles ≤ 60 chars and cut descriptions at a word boundary ≤ 160.
- **Structured data** — `Person` (+ `WebSite`, `ProfilePage`) on `/`, `CreativeWork` per project, `Service`/`OfferCatalog`, `ItemList`,
  and `BreadcrumbList` on listing and detail pages; all reference the same Person `@id`.
- **Social previews** — Open Graph/Twitter tags with `public/og-default.png` (1200×630). Rebuild it with `python3 brand/build_og.py`.
  Projects with a raster `imageUrl` use their own image; generated covers are SVG at `/og/projects/<slug>.svg` (shown on-site and in the image sitemap).
- **Headings & images** — one `<h1>` per page, descriptive `alt` text, explicit image dimensions.
- **Not found** — unknown URLs return HTTP 404 with a `noindex` page; private routes (`/login`, `/admin`) are `noindex`.

**Analytics** — Google Analytics 4 (`VITE_GA_MEASUREMENT_ID` in `.env.production`, loaded from the root route's `head()`).
It is omitted when the variable is unset, so `bun run dev` sends nothing.

**Contact & paid services** — `src/lib/contact.ts` feeds both the page and JSON-LD, so Google sees what visitors see:
`Person.telephone` + `contactPoint` (sales: phone, email, English/Arabic), call (`tel:`) and WhatsApp links,
and an `Offer` (price, currency, `UnitPriceSpecification` per hour) for any service whose *Starting at* field holds a price
such as `$100 / hour`. Services priced in USD/EUR/GBP get an on-page **Book & pay** section (PayPal, below).

**Conversions (GA4)** — the root head reports `click_call`, `click_whatsapp`, `click_email`, `begin_checkout` (booking link)
and `generate_lead` (contact form sent). In GA → Admin → Events, mark them as **Key events**.

**Google Business Profile** — the "Call" / "Website" buttons in Google Search and Maps come from a Business Profile, not from
the site. Create one at https://business.google.com as a *service-area business* (no public address), use the same name,
phone (+20 115 197 8927), website and the "Technical consultation — $100/hour" service, so it matches the site's structured data.

After deploying (one-time, in [Search Console](https://search.google.com/search-console)):

1. Add a **Domain** property for `mohamedhabib.work` and verify with the DNS TXT record in Cloudflare
   (or set `VITE_GOOGLE_SITE_VERIFICATION` and add a URL-prefix property instead). Bing: `VITE_BING_SITE_VERIFICATION`, or import from Search Console.
2. Submit `https://mohamedhabib.work/sitemap.xml` under **Sitemaps**.
3. Use **URL Inspection** on `/` and a project page to confirm Google renders them as users see them, then **Request indexing**.
4. Check **Rich results test** (https://search.google.com/test/rich-results) for the home and a project page.
5. Link the site from LinkedIn, GitHub and your CV — Google discovers sites mainly through links.

## PayPal checkout

Standard Checkout ([docs](https://developer.paypal.com/studio/checkout/standard/integrate)) on priced service pages
(`src/components/PayPalCheckout.tsx`). The browser never sends a price: the server reads it from the service's *Starting at* field.

- `POST /api/paypal/orders` `{ service, notes? }` — creates the order and a `payments` row (`CREATED`).
- `POST /api/paypal/orders/<id>/capture` — captures after the buyer approves; stores payer, capture id and status, and emails the owner.
- `POST /api/paypal/webhook` — verified with PayPal (`verify-webhook-signature`) before anything is stored. Handles
  `CHECKOUT.ORDER.APPROVED` (captures if the buyer closed the page early) and `PAYMENT.CAPTURE.*` (completed, pending,
  denied, refunded, reversed). Statuses never move backwards, so a late event can't undo a refund.
- Dashboard → **Payments** lists them, with links to the transaction in PayPal.

**Switching live ↔ sandbox** — one variable, `PAYPAL_ENV` (`live` or `sandbox`), picks the PayPal app at runtime; each app has
its own `PAYPAL_{LIVE,SANDBOX}_CLIENT_ID`, `…_CLIENT_SECRET` and `…_WEBHOOK_ID`. The browser gets the active client id from the
server, so switching needs no rebuild. Sandbox mode shows a "Test mode" notice at checkout, and every payment records its
`environment` (sandbox ones are tagged "Test" in the dashboard).

- Local: `.env.local` (defaults to `PAYPAL_ENV=sandbox` — pay with a sandbox buyer account from developer.paypal.com).
- Production: `PAYPAL_ENV` and the ids are `wrangler.jsonc` vars; secrets via
  `bunx wrangler secret put PAYPAL_LIVE_CLIENT_SECRET` and `… PAYPAL_SANDBOX_CLIENT_SECRET`.
  To test on the live site: set `"PAYPAL_ENV": "sandbox"`, `bun run deploy`, then switch back.

| App | Client id | Webhook id (→ `https://mohamedhabib.work/api/paypal/webhook`, all events) |
|---|---|---|
| Mohamed Habib Work Live | `BAAP005Tq…PVI58dZxk` | `6GH01514843583038` |
| Mohamed Habib Work Sandbox | `BAAYHrDQ9…7BgTHUvsihQQ` | `0J8973698L545935Y` |

## MCP

`POST /mcp` (JSON-RPC). Public tools: `get_profile`, `list_projects`, `get_project`, `list_experience`,
`list_skills`. With `Authorization: Bearer $MCP_TOKEN` also: `list_messages`, `upsert_project`, `update_profile`.

## Contact email

New contact-form messages are emailed from `no-reply@mohamedhabib.work` to `CONTACT_TO`
via the Cloudflare Email Service `EMAIL` binding (Reply-To is the visitor). One-time setup:
`bunx wrangler email sending enable mohamedhabib.work` (adds SPF/DKIM DNS records — the domain must be on Cloudflare).
Local dev only simulates sending; the email is written under `.wrangler/tmp/email/`.

## Turnstile (bot protection)

The contact form (`contact` action) and dashboard login (`login` action) require a Cloudflare Turnstile token,
verified server-side in `src/server/turnstile.ts` (fails closed; checks action and hostname).
- `VITE_TURNSTILE_SITEKEY` — public sitekey, baked in at build time (`.env.local`)
- `TURNSTILE_SECRET` — `wrangler secret put TURNSTILE_SECRET`
- `TURNSTILE_HOSTNAMES` — accepted frontend hostnames (`mohamedhabib.work` in `wrangler.jsonc`)
- Local dev uses Cloudflare's public always-pass test keys with `TURNSTILE_ALLOW_TEST_KEYS=1` (never set in production).
