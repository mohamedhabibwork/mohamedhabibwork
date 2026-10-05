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
3. Set secrets:
   - `bun run hash-password '<12+ char password>'` → `bunx wrangler secret put ADMIN_PASSWORD_HASH`
   - `openssl rand -hex 32` → `bunx wrangler secret put MCP_TOKEN`
4. Set `SITE_URL`/`VITE_SITE_URL` to your real domain, then deploy: `bun run deploy`.

## SEO

Generated at request time from the database (nothing static to keep in sync):
`/sitemap.xml`, `/robots.txt`, `/site.webmanifest`, per-project pages at `/projects/<slug>`
with canonical/Open Graph/Twitter tags and JSON-LD, and project covers at `/og/projects/<slug>.svg`.

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
