# AI Positioning Matrix

An interactive web app that helps people explore their perspective on AI along two
independent dimensions, then hands them reflection questions instead of a verdict. A
visitor answers a 12-question assessment and is positioned on a 2D matrix showing their
stance on **AI development pace** (Accelerationist ↔ Decelerationist) and **AI's nature**
(Mechanomorphic ↔ Anthropomorphic).

No accounts, no tracking, and **no AI at runtime** — all feedback is pre-written.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FLXD-Integral%2Fai-positioning-matrix&env=KV_REST_API_URL,KV_REST_API_TOKEN&envDescription=Redis%2FKV%20credentials%20for%20shared%20dots%20(see%20README))

> Code is licensed **MIT**; the assessment content is licensed **CC BY-SA 4.0**. See
> [License](#license).

## Features

- **12-question assessment** — 6 questions per axis (3 positive-framed, 3 negative-framed),
  presented in randomized order. Slider input by default, with a radio-button toggle for
  accessibility. Answered on an 11-point −5…+5 scale.
- **2D matrix visualization** — SVG-based, scalable, with labeled axes and four named
  quadrants (Pragmatic Innovator, Visionary Innovator, Pragmatic Guardian, Visionary
  Guardian).
- **Shared multi-user dots** — other recent participants' positions appear on the matrix
  (desktop only), stored in a shared backend. A 3-state rendering system distinguishes the
  current user, recent participants, and older ones.
- **13-state "Your Stance" model** — 4 quadrants + 8 axis-aligned states
  (Tending/Predominantly × 4 poles) + 1 centre state ("Balanced or Deferred Judgement").
- **Personalized reflection report** — position-based feedback across three dimensions
  (overall perspective, preferred AI future, view of AI's nature), 9 open reflection
  questions total. All content is pre-written; **no AI is required at runtime.**
- **Export** — native browser **print** for a clean single-column report, and an anonymized
  **CSV dataset download** (`Timestamp, X-coordinate, Y-coordinate` only).
- **Accessibility** — WCAG 2.1 AA target, keyboard navigation, semantic structure and ARIA
  labels, slider/radio input toggle.

## Technology stack

- **Frontend:** Next.js 15 (App Router) · React 19 · TypeScript
- **Styling:** Tailwind CSS v4 + custom CSS
- **Storage:** Vercel KV / Upstash Redis for shared dots; `localStorage` as a CSV fallback
- **Analytics:** Vercel Analytics (`@vercel/analytics`)
- **Export:** native browser printing (`@media print` styles) + client-side CSV generation
- **Deployment:** Vercel

## Try it locally

### 1. Install

```bash
npm install
```

### 2. Provide a KV (Redis) store

The shared-dots feature needs a Redis-compatible KV store. The easiest path is
[Upstash](https://upstash.com) (free tier) or Vercel's Marketplace integration. Create a
database, then copy the REST URL and token into a local env file:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
KV_REST_API_URL=https://your-store.upstash.io
KV_REST_API_TOKEN=your_token_here
```

The app reads these automatically via `@vercel/kv`. **Without them the app still runs** —
the assessment, matrix, and personal results all work; only the *shared* dots from other
participants won't load.

### 3. Run

```bash
npm run dev          # http://localhost:3000
```

## Deploy your own

1. Click **Deploy with Vercel** above (or import your fork at
   [vercel.com/new](https://vercel.com/new)).
2. Add a KV store — Vercel's **Marketplace → Upstash** integration wires the
   `KV_REST_API_URL` / `KV_REST_API_TOKEN` variables in for you, or set them manually from
   any Upstash database.
3. Deploy. Every push to your default branch redeploys automatically.

**Notes for self-hosters:**

- **`vercel.json` defines a cron job** (`/api/keepalive`, every 2 days) that pings the KV
  store to keep free-tier Upstash databases from being archived for inactivity. Scheduled
  cron jobs require a Vercel plan that supports them; if yours doesn't, the app still works —
  just remove the `crons` block from `vercel.json`.
- **`GET /api/migrate`** is a dev-only, one-time maintenance route from the original
  deployment's data migration. A fresh install has nothing to migrate; you can ignore or
  delete it.

## Commands

```bash
npm run dev          # development server (port 3000)
npm run build        # production build
npm run type-check   # TypeScript validation (tsc --noEmit)
npm run lint         # ESLint

# Exercise the feedback/stance logic across key coordinate scenarios (13 states + boundaries):
node --experimental-strip-types scripts/test-feedback.ts
```

## How scoring works

- **Y-axis (Accelerationist ↔ Decelerationist):** mean of 6 questions (3 positive-framed,
  3 negative-framed and inverted) → Y coordinate (−5…+5).
- **X-axis (Mechanomorphic ↔ Anthropomorphic):** mean of 6 questions (3 mechanomorphic-
  framed and inverted, 3 anthropomorphic-framed) → X coordinate (−5…+5).
- **Distance bands:** `close` (|score| ≤ 1), `moderate` (≤ 3), `far` (> 3) — these drive
  both the stance label (Balanced / Tending / Predominantly) and the tiered feedback copy.

## Architecture at a glance

- **Hybrid static/dynamic.** Pages are largely static; the dynamic API routes are:
  - `GET /api/dots` — poll the shared dots shown on the matrix (bounded 90-day visibility
    window; polled every 2 minutes on the results page)
  - `POST /api/dots` — store a dot when the results page loads
  - `GET /api/dots/export` — the anonymized full archive used to build the CSV
  - `GET /api/keepalive` — the cron-driven KV keepalive ping
- **Stateless by design.** Each request is self-contained (no global in-memory state), and
  reads are batched with `kv.mget()`.
- **Retention vs. visibility.** Dots are stored **permanently** (indexed in a `dots_by_time`
  sorted set) and the CSV export reads the full archive, but the matrix only renders a
  bounded **90-day visibility window** so per-poll cost stays flat as the archive grows.

### Privacy boundary (hard rule)

Internal storage may hold a superset of fields, but the outbound network surface is a strict
whitelist — *write-superset, read-whitelist*:

- `GET /api/dots` returns only `id`, `color`, `position`, `timestamp`.
- `GET /api/dots/export` (and therefore the CSV) exposes only `timestamp`, `x`, `y`.

Display names and raw response arrays are **never** sent over the wire. Widening the outbound
surface should be treated as a privacy regression until justified.

## Project structure

```
scripts/
└── test-feedback.ts          # feedback/stance logic test harness
src/
├── app/
│   ├── page.tsx              # quiz page (onboarding + 12 questions)
│   ├── results/page.tsx      # results page (matrix + feedback + export)
│   └── api/
│       ├── dots/route.ts        # GET/POST shared dot storage
│       ├── dots/export/route.ts # anonymized full archive for CSV
│       ├── keepalive/route.ts   # KV keepalive (cron)
│       └── migrate/route.ts     # dev-only one-time data migration
├── components/
│   ├── MatrixVisualization.tsx
│   ├── QuestionSlider.tsx
│   └── ColorPicker.tsx
├── lib/
│   ├── feedback.ts           # 13-state stance model + reflection content
│   ├── questions.ts          # 12 assessment questions
│   ├── clientStorage.ts      # CSV export (fetches all dots; localStorage fallback)
│   ├── kv.ts                 # Vercel KV operations (permanent storage, 90-day visibility)
│   └── analytics.ts          # analytics event tracking
└── types/index.ts            # TypeScript definitions
```

## Contributing

Issues and pull requests are welcome. For anything substantial, please open an issue first
to discuss the direction. Keep the [privacy boundary](#privacy-boundary-hard-rule) intact —
PRs that widen the outbound data surface need a clear justification.

## License

- **Code** (source, config, build tooling): [MIT](LICENSE).
- **Assessment content** (the wording of the questions, stance labels, and reflection/feedback
  text — primarily `src/lib/questions.ts` and `src/lib/feedback.ts`):
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Built by [LXD Integral](https://lxdintegral.com). Contact: dan@lxdintegral.com
