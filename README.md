# RESOLVR

An internal support desk for a small team: create, search, filter, sort, triage,
update and resolve customer tickets. It replaces the spreadsheet that was doing
this job, and exists to answer one question quickly — **what needs attention
right now, and what do I pick up next?**

All search, filtering, sorting, pagination, analytics and triage counting happens
in PostgreSQL. The frontend never filters, sorts, slices or aggregates locally.

---

## Overview

A support team receives tickets by email and tracks them in a shared spreadsheet.
That works until someone needs to answer "how many unresolved tickets do we have,
and which ones have been sitting longest?" — at which point the spreadsheet needs
filtering, manual counting, and a second copy to avoid two people editing at once.

RESOLVR is a single-ticket-type internal tool that covers that workflow end to
end:

- **A queue you can trust.** Every count comes from the database, so the overview
  tiles always describe the whole dataset rather than the rows currently on screen.
- **A triage order that matches how the work is actually done.** One sort puts
  high-priority open work first, in-progress work next, and oldest first within
  each group, with resolved tickets excluded entirely.
- **Analysis separate from operations.** Reporting lives on its own screen so the
  working queue is never buried under charts.

---

## Features

| Feature | Notes |
| --- | --- |
| **Create tickets** | Title, description, customer email, priority, status. Status defaults to `OPEN`, priority to `MEDIUM`. |
| **Search** | Case-insensitive substring match on title **or** customer email, served by trigram indexes. |
| **Filter** | By status and by priority, combinable with search and sort. |
| **Sort** | `newest`, `oldest`, and the workflow-oriented `triage`. |
| **Pagination** | Fixed at 10 per page, calculated by `COUNT(*)` in SQL. |
| **Update status / priority** | From the case file, with a save confirmation. |
| **Dataset-wide summary** | Total / open / in progress / resolved tiles that ignore active filters. |
| **Attention overview** | Unresolved work as a priority × status matrix. |
| **Analytics** | Status distribution, priority distribution, and a 14-day created-versus-resolved chart. |
| **Triage workflow** | Triage-ordered list with *Continue triage* paging forward to the next unresolved ticket. |
| **Responsive UI** | Six-column table on desktop; a stacked card per ticket below `md`, with no horizontal scrolling. |
| **Light and dark themes** | System preference by default, remembered in `localStorage`. |
| **Keyboard shortcuts** | Full set; ignored while typing in a field. |

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| **Frontend** | React 18, Vite 7, React Router 7, Tailwind CSS 4. No UI framework, no state library, no charting library. |
| **Backend** | Node.js (ESM), Express 4, REST. |
| **Database** | PostgreSQL via Prisma 6. |
| **Validation** | Zod 3 on both sides. |
| **Testing** | Vitest 5 + Supertest 7 against a real Express app and a real PostgreSQL database. |

Runtime dependencies are deliberately few:

- **Server** — `@prisma/client`, `dotenv`, `express`, `zod`
- **Client** — `react`, `react-dom`, `react-router-dom`, `zod`

---

## Architecture

```
Client → REST API → Services → Prisma → PostgreSQL
```

```
Browser
  │  fetch('/api/tickets?...')          one origin, proxied by Vite in dev
  ▼
Express
  routes/       URL → controller            no queries, no shape decisions
  ▼
controllers/   Zod parse → call service → envelope
  ▼
services/      all business logic, all SQL
  ▼
Prisma Client
  ▼
PostgreSQL
```

**Why this structure:**

- **Controllers contain no queries. Services contain no HTTP concepts.** Every
  query lives in one file (`services/ticketService.js`), so "how is triage
  ordered?" has exactly one answer, and it is a pure data concern that can be read
  without thinking about `req` or `res`.
- **A single error handler** converts Zod errors, `ApiError`s, Prisma errors
  (`P2025`), malformed JSON and anything unexpected into one response envelope.
  Clients never have to guess the error shape.
- **`asyncHandler`** wraps every async route so a rejected promise reaches that
  handler instead of hanging the request — the alternative is a `.catch` in every
  controller.
- **The dashboard keeps its state in the URL**, not in React state. `search`,
  `status`, `priority`, `sort` and `page` live in query parameters, so any view is
  bookmarkable, shareable, and back/forward works for free.

Every success response is `{ "success": true, "data": ... }`.

---

## Project Structure

```
resolvr/
├── package.json               npm workspaces root; all run scripts
├── .env.example               API configuration
├── .env.test.example          test database configuration
├── prisma/
│   ├── schema.prisma          Ticket model, two enums, three indexes
│   ├── migrations/
│   │   ├── 20261001192713_init/                     table, enums, indexes
│   │   └── 20261001192735_search_trigram_indexes/   pg_trgm + GIN indexes
│   └── seed.js                35 realistic seed tickets
├── server/
│   ├── package.json
│   ├── vitest.config.js
│   ├── src/
│   │   ├── app.js             createApp() — testable app factory, no listen()
│   │   ├── server.js          HTTP listener + graceful shutdown
│   │   ├── config/env.js      loads and validates environment variables
│   │   ├── db/prisma.js       Prisma client singleton
│   │   ├── routes/ticketRoutes.js
│   │   ├── controllers/ticketController.js
│   │   ├── services/ticketService.js      all queries and business rules
│   │   ├── validators/ticketSchemas.js    Zod schemas, one per input shape
│   │   ├── middleware/        asyncHandler, notFound, errorHandler
│   │   └── lib/               ApiError, sendSuccess
│   └── tests/
│       ├── prepareTestDb.js   applies migrations before Vitest starts
│       ├── setup.js
│       └── tickets.test.js    13 integration tests
└── client/
    ├── package.json
    ├── vite.config.js         Tailwind plugin + /api dev proxy
    └── src/
        ├── main.jsx
        ├── App.jsx            three routes + shell
        ├── index.css          theme tokens, component classes, responsive rules
        ├── pages/             DashboardPage, AnalyticsPage, TicketDetailPage
        ├── components/
        │   ├── AppShell.jsx       header, shortcuts, new-ticket dialog
        │   ├── TopNav.jsx         wordmark, theme toggle, menu button
        │   ├── CommandMenu.jsx    menu, theme action, shortcut reference
        │   ├── SummaryMetrics.jsx  queue overview + tiles + analytics link
        │   ├── AttentionOverview.jsx priority × status matrix
        │   ├── TicketToolbar.jsx  search, filters, sort, clear, new ticket
        │   ├── TicketList.jsx     six-column table / stacked cards
        │   ├── ListFooter.jsx     pagination + continue triage
        │   ├── NewTicketDialog.jsx
        │   ├── TicketDetailPage   → pages/
        │   ├── Badges.jsx, Icons.jsx, Skeletons.jsx, States.jsx
        │   └── analytics/         StatusBreakdown, PriorityBreakdown, ActivityChart
        ├── context/           ThemeContext, WorkspaceContext, CommandContext
        ├── hooks/             useTickets, useKeyboardShortcuts
        └── lib/               api.js (fetch wrapper), format.js, ticketSchema.js
```

---

## Prerequisites

- **Node.js 20 or newer** (`engines` in the root `package.json` declares `>=20`).
- **npm 10+** — required for workspaces, which come with Node 20.
- **PostgreSQL 13 or newer** running locally. The `pg_trgm` extension is used by
  one migration; it ships with PostgreSQL and is enabled by that migration.

No Docker, no global CLI installs beyond PostgreSQL itself. The Prisma CLI is
invoked through `node_modules` rather than `npx`, so nothing needs to be on `PATH`.

---

## Environment Variables

Only these are read by the application.

### Server — `.env` (repository root)

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string. The server throws on boot if missing. Also used by the Prisma CLI. |
| `PORT` | No | `4000` | Port the Express API listens on. Must be numeric. |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Loaded into `env.clientOrigin` but **currently unused** — no CORS middleware is mounted. Kept because the Vite dev proxy keeps the browser on one origin, so CORS is not needed in development. |

### Tests — `.env.test` (repository root)

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Yes** | — | Points at the throwaway test database. |
| `PORT` | No | `4000` | Present for shape parity; tests never listen on a port. |
| `CLIENT_ORIGIN` | No | — | Unused, as above. |

When `NODE_ENV=test`, `config/env.js` loads `.env` and then overrides it with
`.env.test`, so either entry point boots with the same code path.

### Client — optional

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | No | `/api` | Only needed if the API is hosted on a different origin than the app. Leave unset in development and let Vite proxy `/api`. |

---

## Setup & Installation

**1. Clone**

```bash
git clone <repository-url> resolvr
cd resolvr
```

**2. Install dependencies**

```bash
npm install
```

This installs all workspaces (`client`, `server`) plus Prisma from the root.

**3. Create the databases**

```bash
createdb support_tickets
createdb support_tickets_test   # only needed to run the tests
```

**4. Configure the environment**

```bash
cp .env.example .env
cp .env.test.example .env.test   # only needed to run the tests
```

Edit `DATABASE_URL` in both if your PostgreSQL user or password differs. The two
files must point at **different** databases — the test suite wipes its own.

**5. Run migrations**

```bash
npm run db:migrate
```

Creates the `tickets` table, the two enums, the indexes, and enables `pg_trgm`.

**6. Seed the database**

```bash
npm run db:seed
```

Inserts 35 realistic tickets with varied priorities, statuses and ages so the
queue, triage order and charts have something to show immediately.

**7. Start the app**

```bash
npm run dev:server   # Express API  → http://localhost:4000
npm run dev:client   # Vite dev app → http://localhost:5173
```

---

## Running the Application

Two terminals. Exact commands from the `package.json` files.

| Command | Runs | Result |
| --- | --- | --- |
| `npm run dev:server` | `npm run dev --workspace server` → `node --watch src/server.js` | API on `http://localhost:4000` |
| `npm run dev:client` | `npm run dev --workspace client` → `vite` | App on `http://localhost:5173` |
| `npm run build --workspace client` | `vite build` | Production bundle in `client/dist` |
| `npm test` | `npm run test --workspace server` → `node tests/prepareTestDb.js && vitest run` | 13 tests |
| `npm run test:watch --workspace server` | `node tests/prepareTestDb.js && vitest` | Watch mode |
| `npm run db:migrate` | `prisma migrate dev` | Create and apply a migration |
| `npm run db:deploy` | `prisma migrate deploy` | Apply existing migrations only |
| `npm run db:seed` | `node prisma/seed.js` | Load seed tickets |
| `npm run db:reset` | `prisma migrate reset --force` | Drop, re-migrate, re-seed |
| `npm run db:studio` | `prisma studio` | Browse the data in a GUI |

The Vite dev server proxies `/api` to `http://localhost:4000` (`vite.config.js`),
so the browser stays on one origin and no CORS setup is needed.

Health check:

```bash
curl http://localhost:4000/api/health
# {"success":true,"data":{"status":"ok"}}
```

---

## Database

### Schema

One table, `tickets` (`prisma/schema.prisma`):

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key. |
| `title` | `VARCHAR(120)` | Length enforced by the database as well as by Zod. |
| `description` | `TEXT` | |
| `customerEmail` | `TEXT` | Searchable. |
| `priority` | `Priority` enum | `LOW`, `MEDIUM`, `HIGH`. Default `MEDIUM`. |
| `status` | `TicketStatus` enum | `OPEN`, `IN_PROGRESS`, `RESOLVED`. Default `OPEN`. |
| `createdAt` | `TIMESTAMP(3)` | Default `CURRENT_TIMESTAMP`. |
| `updatedAt` | `TIMESTAMP(3)` | Maintained by Prisma; changes on every update. |

Enum values are stored as plain text in declaration order. Triage sorting leans on
that order (`priority DESC`, `status ASC`) rather than hardcoding a `CASE`
expression.

### Indexes

| Index | Migration | Serves |
| --- | --- | --- |
| `tickets_createdAt_idx` | init | Default `newest` sort |
| `tickets_status_createdAt_idx` | init | Status filter + sort |
| `tickets_priority_status_idx` | init | Priority filter, unresolved matrix aggregation |
| `tickets_title_trgm_idx` | trigram | Substring search on title |
| `tickets_customerEmail_trgm_idx` | trigram | Substring search on email |

The two trigram indexes are `GIN` with `gin_trgm_ops` and require the `pg_trgm`
extension, which the migration enables. They are what stop
`ILIKE '%term%'` from degrading into a sequential scan as the table grows.

### Migrations

Two committed migrations, both applied by `npm run db:migrate`:

1. `20261001192713_init` — enums, table, three B-tree indexes.
2. `20261001192735_search_trigram_indexes` — `pg_trgm` and the two GIN indexes.

The triage workflow needed **no** schema change: the ordering is an `ORDER BY`
over columns that already existed.

### Seed

`prisma/seed.js` inserts 35 tickets across realistic support scenarios (payment
failures, login problems, duplicate orders, invoice bugs) with a spread of
priorities, statuses and creation times so triage order and the 14-day activity
chart both have meaningful data. Running the seed does **not** delete existing
rows; use `npm run db:reset` for a clean slate.

---

## API

Base URL `http://localhost:4000/api`. Every success response is
`{ "success": true, "data": ... }`.

| Method | Endpoint | Purpose | Success |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Liveness check | `200` |
| `POST` | `/api/tickets` | Create a ticket | `201` |
| `GET` | `/api/tickets` | List with search, filter, sort, pagination | `200` |
| `GET` | `/api/tickets/:id` | Fetch one ticket | `200` |
| `PATCH` | `/api/tickets/:id` | Update `status` and/or `priority` | `200` |
| `GET` | `/api/tickets/summary` | Dataset-wide counts | `200` |
| `GET` | `/api/tickets/analytics` | Aggregates for analytics and the attention overview | `200` |

`/summary` and `/analytics` are registered before `/:id` so they are not parsed as
ticket ids.

### `GET /api/tickets` query parameters

| Parameter | Values | Default | Notes |
| --- | --- | --- | --- |
| `search` | ≤ 120 chars | — | Case-insensitive substring on `title` **or** `customerEmail`. |
| `status` | `OPEN`, `IN_PROGRESS`, `RESOLVED` | all | |
| `priority` | `LOW`, `MEDIUM`, `HIGH` | all | |
| `sort` | `newest`, `oldest`, `triage` | `newest` | |
| `page` | integer ≥ 1 | `1` | 10 rows per page, fixed and not configurable. |

```bash
curl "http://localhost:4000/api/tickets?search=harborline&status=OPEN&sort=triage&page=1"
```

```json
{
  "success": true,
  "data": {
    "tickets": [ /* ... */ ],
    "pagination": { "page": 1, "pageSize": 10, "total": 24, "totalPages": 3 }
  }
}
```

**Triage ordering.** `sort=triage` orders by `priority DESC, status ASC,
createdAt ASC, id DESC` — high priority first, open before in progress, oldest
first within each group. It additionally excludes `RESOLVED` tickets, because
otherwise resolved rows sort between the in-progress groups and interleave the
work. An explicit `status` filter overrides that exclusion, so
`?sort=triage&status=RESOLVED` is still a valid query.

### `POST /api/tickets`

Body: `title` and `description` (required), `customerEmail` (required, must be a
valid address), `priority` (optional), `status` (optional).

```json
{ "title": "…", "description": "…", "customerEmail": "…", "priority": "HIGH" }
```

Returns `201` with `{ "success": true, "data": { "ticket": { … } } }`.

### `PATCH /api/tickets/:id`

Body accepts `status`, `priority`, or both. An empty object is rejected.

### `GET /api/tickets/summary`

Ignores every query parameter on purpose — the overview tiles always describe the
whole database, not the current view.

```json
{
  "success": true,
  "data": {
    "total": 35,
    "byStatus": { "OPEN": 10, "IN_PROGRESS": 4, "RESOLVED": 21 },
    "attention": { "highPriorityOpen": 3 }
  }
}
```

### `GET /api/tickets/analytics`

Also dataset-wide and read-only. Powers the analytics screen and the attention
overview. Every count is produced by PostgreSQL; JavaScript only fills gaps so a
quiet day still appears on the chart.

```json
{
  "success": true,
  "data": {
    "totals": { "total": 35, "resolved": 21, "unresolved": 14 },
    "status":   [{ "status": "OPEN", "count": 10 }],
    "priority": [{ "priority": "HIGH", "count": 8 }],
    "activity": [{ "date": "2026-09-19", "created": 1, "resolved": 2 }],
    "unresolved": {
      "total": 14,
      "breakdown": [
        { "priority": "HIGH", "status": "OPEN", "count": 4 },
        { "priority": "HIGH", "status": "IN_PROGRESS", "count": 2 }
      ]
    },
    "triage": {
      "total": 11,
      "highPriorityOpen": 3,
      "highPriorityInProgress": 2,
      "unresolvedOverdue": 7
    }
  }
}
```

- `unresolved.breakdown` contains only combinations that actually have tickets,
  ordered high→low priority then open→in progress. The client renders one column
  per non-empty priority.
- `triage.total` is the de-duplicated union of the three triage groups, so a
  ticket matching two reasons is still counted once.
- Resolved activity is dated by `updatedAt`, because the model has no separate
  resolution timestamp.

---

## Validation & Error Handling

### Validation

Zod schemas in `server/src/validators/ticketSchemas.js` are the single source of
truth for what the API accepts. `title`, `description` and `customerEmail` are
shared field schemas reused across create and update.

| Input | Rules |
| --- | --- |
| `title` | Required, trimmed, 1–120 chars. |
| `description` | Required, trimmed, 1–4000 chars. |
| `customerEmail` | Required, trimmed, valid email. |
| `priority` | One of `LOW`, `MEDIUM`, `HIGH`. Defaults to `MEDIUM`. |
| `status` | One of `OPEN`, `IN_PROGRESS`, `RESOLVED`. Defaults to `OPEN`. |
| `id` (path) | Coerced to a positive integer. |
| `page` (query) | Coerced to an integer ≥ 1. |
| `sort` (query) | One of `newest`, `oldest`, `triage`. |
| `PATCH` body | At least one of `status` or `priority`. |

**Frontend.** `client/src/lib/ticketSchema.js` mirrors the server rules so the
form can validate before a request is sent; the API revalidates regardless, so
the client is a convenience, never the guarantee. Zod issues are flattened into a
`{ field: message }` map and rendered under each input, with `aria-invalid` and
`aria-describedby` wired up. Server-side field errors are rendered the same way,
so an inline message looks identical whether it came from the browser or the API.

### Status codes

| Code | When |
| --- | --- |
| `200` | Successful read or update. |
| `201` | Ticket created. |
| `400` | Zod validation failed, or the body was not valid JSON. |
| `404` | Ticket does not exist, or no route matched. |
| `500` | Unexpected server error. Full detail is logged, not returned. |

### Error envelope

Every error — Zod, `ApiError`, Prisma, malformed JSON, unexpected — is converted
by `server/src/middleware/errorHandler.js` into one shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid ticket data",
    "fields": { "customerEmail": "Enter a valid email address" }
  }
}
```

`fields` is always present, and holds the first message per field. Error codes:
`VALIDATION_ERROR`, `INVALID_JSON`, `NOT_FOUND`, `ROUTE_NOT_FOUND`,
`INTERNAL_ERROR`.

The client mirrors this in `ApiRequestError` and adds two codes of its own for
failures that never reached the API: `NETWORK_ERROR` (server unreachable) and
`UNEXPECTED_RESPONSE` (a non-JSON body, e.g. a Vite proxy error page).

---

## Testing

```bash
npm test
```

This runs `node tests/prepareTestDb.js && vitest run`. The prepare step applies
pending migrations to the database in `.env.test` before the runner starts; each
test file then truncates and re-seeds the `tickets` table in `beforeEach`, so every
test starts from five known fixtures and no test can depend on another's writes.

All 13 tests are integration tests: they drive the real Express app through
Supertest against a real PostgreSQL database, so assertions cover routing,
validation, SQL, and the response envelope together. There are no mocked units.

| Area | What is asserted |
| --- | --- |
| Validation | Blank title, blank description, malformed email and an unknown priority return `400` with the `VALIDATION_ERROR` envelope, per-field messages, **and nothing written to the database**. |
| Create defaults | `201`; a ticket created without `status`/`priority` gets `OPEN` / `MEDIUM`; the id is numeric. |
| Combined listing | `search` + `status` + `sort` + `page` returns exactly the expected row and a correct `pagination` block. |
| Pagination | Adding 12 rows forces a second page: page 1 has 10, page 2 has 7, `totalPages` is 2, and timestamps are strictly descending. |
| Invalid filter | `status=CLOSED` returns `400` with a status field message. |
| Update persistence | `PATCH` status/priority, then re-read through `GET /:id` to prove the change survived the round trip and `updatedAt` advanced. |
| Update errors | Unknown id returns `404`; an empty payload returns `400`. |
| Summary | Counts stay global even when the request carries `search`, `status`, `priority` and `page`. |
| Triage order | Exact expected title order across HIGH+OPEN (oldest first), HIGH+IN_PROGRESS, MEDIUM+OPEN; resolved tickets excluded; `pagination.total` reflects the exclusion. |
| Triage + explicit status | `?sort=triage&status=RESOLVED` still returns the resolved rows. |
| Invalid sort | `sort=random` returns `400`. |
| Analytics | Totals, status distribution, priority distribution, the full 14-day activity window (length and sums), the triage counts, and the `unresolved` matrix with empty combinations omitted. |

To run against an already-configured database in watch mode:

```bash
npm run test:watch --workspace server
```

---

## Technical Decisions

| Choice | Why |
| --- | --- |
| **PostgreSQL** | The product is filtering, sorting, paginating and aggregating over one relational table. That is exactly what a relational engine is for, and `ILIKE` + trigram indexes + `COUNT(*)` is a few lines rather than a pipeline. |
| **Prisma** | Type-safe queries with no separate query-builder layer to learn. Prisma's `where` objects read as a direct expression of the filter, and `groupBy` produces the distributions without raw SQL. Migrations are committed so the schema is reproducible. |
| **Express 4** | Small, boring and universally understood for a REST API of this size. `asyncHandler` bridges rejected promises to the error handler in three lines. |
| **React + hooks, no state library** | Each screen holds a handful of values. Three contexts (`Theme`, `Workspace`, `Command`) cover the genuinely shared state; a reducer or store library would be more code than it saves. |
| **React Router** | Needed for three routes and, more importantly, for URL-driven dashboard state. Included for the router, not for data fetching — fetching is a ~40-line hook. |
| **Zod** | One schema definition supplies validation *and* defaults *and* the type coercion for query strings. `issues` map directly onto form fields, which removes a manual error-mapping layer on both sides. |
| **Tailwind v4 + CSS custom properties** | Utilities keep styling in the markup, while theme colours live as CSS variables in `@theme`. Dark mode is one set of token overrides instead of a `dark:` variant in every component — which is why `Badges.jsx` has no theme awareness at all. |
| **Hand-rolled SVG charts** | Three small charts with no interaction beyond a hover title. A charting library would add more weight than the ~120 lines it replaces, and the charts inherit theme tokens for free. |
| **Vitest + Supertest against a real DB** | The interesting logic here *is* the SQL — triage ordering, the unresolved matrix, trigram search. Mocking Prisma would test the mocks. Running against real PostgreSQL means a broken index or a wrong `ORDER BY` fails the build. |
| **Native `<dialog>`** | Focus trapping, `Escape` handling and backdrop dismissal come from the platform, so the modal needs no library and no focus-management code. |

---

## Assumptions

Only assumptions that actually affect the implementation:

- **No authentication or authorization.** Explicitly out of scope. The API is
  assumed to run on a trusted internal network.
- "Unresolved" means any status other than `RESOLVED`.
- "Unresolved > 24h" is measured from `createdAt`, since there is no
  first-response timestamp.
- `updatedAt` is maintained by Prisma and advances on every successful write, so
  it stands in for "when was this resolved".
- Page size is fixed at 10 and is not configurable through the API, per the spec.
- Sort is stable (`createdAt`, then `id`) so pagination cannot repeat or skip rows.
- Summary and analytics figures ignore filters — the overview describes the
  dataset, not the view.
- Activity is bucketed into local calendar days in JavaScript over a bounded
  14-day window.

---

## Known Limitations

Intentionally not implemented, or simplified because of scope:

- **Search scale.** Trigram indexes make `ILIKE '%term%'` fast, but past roughly
  10⁵ rows a dedicated search engine would be needed.
- **No ticket history or audit trail.** Status and priority are overwritten in
  place; nothing records who changed what, or when. A resolved ticket's only
  trace is `updatedAt`.
- **No ticket deletion**, soft or hard — deliberately, since an untraceable delete
  is worse than no delete on a support record.
- **Triage cannot resume mid-queue.** The list is an offset-paginated snapshot,
  not a cursor. If the underlying data changes while an agent works through pages,
  their position can shift.
- **Analytics is capped at 14 days**, and day-bucketing happens in JavaScript
  after one bounded query. A longer or configurable range would move the
  bucketing into SQL (`generate_series` + `date_trunc`).
- **One ticket type.** No comments, attachments, assignees, tags, or customer
  entity — the schema is a single flat table.
- **No frontend tests.** The suite is backend integration only. The frontend is
  thin and mostly declarative, but that is a coverage gap, not a deliberate
  trade-off.
- **No production serving pipeline.** `vite build` produces `client/dist`, but
  nothing is wired to serve it or to run the API as a managed service.
- **`npm audit` reports 3 high-severity findings** from `deepmerge-ts`, a
  transitive dependency of `@prisma/config` (the Prisma CLI's own config parser).
  It is a development-time tool that the running API never loads. The offered fix
  downgrades Prisma across a major version, which was not a worthwhile trade.

---

## AI Assistance

This project was built with AI coding assistance, driven by a written
specification. The tool was used for scaffolding, implementation, refactoring and
review across the whole stack — for example, restructuring the dashboard into a
linear queue-to-triage flow and adding the server-side triage scoping.

What that means in practice: the architecture, schema, validation rules and API
contract follow the specification, but the code should be read as a starting
point for review rather than as pre-vetted production software.

Verification performed:

- Prisma migrations applied to a real PostgreSQL database, 35 seed rows loaded.
- `npm test` passing 13/13 against a real database.
- `npm run build --workspace client` completing clean.
- API exercised directly for triage ordering and the analytics payload.

Interactive UI behaviour (menu open/close, shortcuts while typing, theme
switching, mobile layout) was verified by code review and build, **not** by
automated browser tests or recorded screenshots — see the next section.

---

## Screenshots / Demo

**None included.** There are no screenshots or demo video in this repository, and
no browser-automation test suite was run. To see the app, follow
[Setup](#setup--installation) and open `http://localhost:5173`.

---

## Assignment Tradeoffs

**Prioritised:**

- **Correctness of the server-side data path.** Search, filtering, sorting,
  pagination and aggregation all happen in PostgreSQL and are covered by tests
  against a real database. This is the part of the brief most likely to be
  scrutinised, so it is the part with the most evidence behind it.
- **One coherent workflow over many features.** The dashboard reads top to bottom
  — overview, attention, filters, list, pagination — and the keyboard shortcut set
  covers the actions a support agent repeats all day. Depth in one path beat
  breadth across screens.
- **A single error envelope and a single source of truth per concern.** All
  filtering in one service file, all queries in one place, all errors through one
  middleware, all theme colours as tokens.
- **Restraint in dependencies.** No UI kit, no state library, no chart library.
  Everything visual is hand-built from tokens, which also made the dark theme a
  single override block rather than a parallel stylesheet.

**Intentionally left out:**

- **Authentication and multi-user concerns.** Out of scope; adding a half-version
  would have been worse than none.
- **Comments, attachments, assignment, and audit history.** Natural next features
  for a support tool, but each needs a schema change, and the brief did not call
  for them.
- **Frontend automated tests.** Time went to the backend suite and to the
  production build instead. This is the most significant gap.
- **Production deployment configuration** (static serving, process management,
  migrations on boot).
- **Full-text search.** Trigram indexes are proportionate to the data size and
  simpler to reason about than an Elasticsearch dependency.