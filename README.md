# RESOLVR

> A full-stack support ticket dashboard designed to help support teams see what needs attention, understand the current queue, and move through unresolved tickets efficiently.

**Live Demo:** `YOUR_DEPLOYED_APP_URL`  
**GitHub:** `YOUR_PUBLIC_GITHUB_REPO_URL`

![RESOLVR Dashboard](./docs/dashboard.png)

---

## Overview

RESOLVR is a full-stack support ticket management application built around a simple question:

**What needs attention right now, and what should I pick up next?**

The application provides a persistent support queue where users can create, search, filter, sort, update, and triage tickets. The dashboard separates day-to-day ticket operations from higher-level queue analysis.

### Quick Links

[Features](#features) ·
[Tech Stack](#tech-stack) ·
[Architecture](#architecture) ·
[Setup](#setup) ·
[Testing](#testing) ·
[API](#api) ·
[Technical Decisions](#technical-decisions) ·
[Assumptions](#assumptions) ·
[Known Limitations](#known-limitations) ·
[AI Assistance](#ai-assistance)

---

## Why RESOLVR?

Support queues can quickly become difficult to manage when tickets are treated as rows in a spreadsheet.

RESOLVR focuses on three separate questions:

1. **What is the current state of the queue?**
2. **Which tickets need attention?**
3. **What should I work on next?**

The dashboard provides the queue overview, Analytics provides a broader view of the data, and Triage provides a focused workflow for working through unresolved tickets.

## Features

### Ticket Management

- Create new support tickets
- Required title and description validation
- Customer email validation
- Low / Medium / High priority
- Open / In Progress / Resolved status
- Automatic `createdAt` and `updatedAt` timestamps
- Persistent PostgreSQL storage

### Ticket Queue

- Search by ticket title or customer email
- Filter by status
- Filter by priority
- Sort by newest or oldest
- Server-side pagination with 10 tickets per page
- Responsive desktop table and mobile ticket cards
- Loading, empty, and error states

![RESOLVR Ticket Queue](./docs/ticket-queue.png)

---
### Queue Overview

The dashboard displays counts across the **entire dataset**, independent of active filters:

- Total tickets
- Open tickets
- In Progress tickets
- Resolved tickets

The Attention Overview then breaks down unresolved workload by priority and status.

![RESOLVR Queue Overview](./docs/queue-overview.png)

---
### Analytics

Analytics provides a dataset-wide view of:

- Ticket status distribution
- Ticket priority distribution
- Ticket creation/resolution activity

![RESOLVR Analytics](./docs/analytics.png)

---
### Triage

The Triage workflow provides an ordered way to work through unresolved tickets.

Tickets are considered in this order:

1. High priority — Open
2. High priority — In Progress
3. Medium priority — Open
4. Medium priority — In Progress
5. Low priority — Open
6. Low priority — In Progress

Within each group, older unresolved tickets are shown first. Triage does not introduce a separate database field or duplicate ticket state. It uses the existing ticket priority, status, and creation data.

![RESOLVR Triage](./docs/triage.png)

---
### UI & Accessibility

- Responsive layout
- Light and dark themes
- Keyboard shortcuts
- Escape-to-close modal/menu behavior
- Clear status and priority indicators
- Empty and error states
- Compact navigation menu
---
### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `/` | Focus search |
| `N` | Create new ticket |
| `D` | Dashboard |
| `A` | Analytics |
| `T` | Triage |
| `F` | Focus filters |
| `R` | Refresh |
| `Esc` | Close / go back |
| `?` | Show shortcuts |

Shortcuts are ignored while typing in form fields.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Routing | React Router |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Testing | Vitest, Supertest |
| Language | JavaScript |
| API | REST |

---

## Architecture

RESOLVR follows a simple layered architecture:

```text
┌─────────────────────────┐
│      React Frontend     │
│                         │
│ Dashboard / Analytics   │
│ Tickets / Triage / UI   │
└────────────┬────────────┘
             │ REST API
             ▼
┌─────────────────────────┐
│     Express Server      │
│                         │
│ Routes                  │
│ Controllers             │
│ Services                │
│ Validation              │
└────────────┬────────────┘
             │ Prisma
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
│                         │
│        Tickets          │
└─────────────────────────┘
```
--- 

## Setup

### Requirements

- Node.js 20+
- npm 10+
- PostgreSQL 13+

### Install
```bash
git clone YOUR_PUBLIC_GITHUB_REPO_URL
cd resolvr
npm install
```

### Database

Create separate development and test databases:
```bash
createdb support_tickets
createdb support_tickets_test
```

The test database is only required for running the test suite.

### Environment Variables

Create the environment files:
```bash
cp .env.example .env
cp .env.test.example .env.test
```

`.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/support_tickets"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

`.env.test` should point to the separate `support_tickets_test` database.

Optional frontend variable:
```env
VITE_API_BASE_URL="http://localhost:4000"
```

### Migrate & Seed
```bash
npm run db:migrate
npm run db:seed
```

The seed script creates 35 varied tickets for demonstrating the queue, analytics, pagination, and triage workflow.

### Run

Start the backend and frontend in separate terminals:
```bash
npm run dev:server
```

```bash
npm run dev:client
```

Open `http://localhost:5173`.

API: `http://localhost:4000`

---

## Testing

Tests run against the separate PostgreSQL database configured through `.env.test`.
```bash
npm test
```

The suite currently contains **13 integration tests** covering validation, ticket creation and listing, filtering, pagination, updates, summaries, analytics, triage ordering, and error cases.

---

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/tickets` | Create ticket |
| `GET` | `/api/tickets` | List, search, filter, and sort tickets |
| `GET` | `/api/tickets/:id` | Get ticket |
| `PATCH` | `/api/tickets/:id` | Update ticket |
| `GET` | `/api/tickets/summary` | Queue summary |
| `GET` | `/api/tickets/analytics` | Analytics data |
| `GET` | `/api/tickets/triage` | Triage queue |

Requests are validated with Zod and return consistent API errors with appropriate HTTP status codes.

---

## Technical Decisions

- **PostgreSQL + Prisma:** Persistent relational storage with version-controlled migrations and straightforward filtering, sorting, and aggregation.
- **Server-side querying:** Search, filtering, sorting, pagination, summaries, analytics, and triage ordering remain backend responsibilities.
- **Zod:** Explicit validation for API requests and query parameters.
- **React + hooks:** The application has limited shared state, so a dedicated state-management library was unnecessary.
- **Vitest + Supertest:** Tests run against the real Express application and PostgreSQL database rather than mocked database calls.

---

## Assumptions

- Authentication and authorization are outside the assignment scope.
- `OPEN` and `IN_PROGRESS` tickets are considered unresolved.
- Pagination is fixed at 10 tickets per page.
- Queue summaries and analytics represent the complete dataset, independent of active filters.
- Triage uses existing ticket priority, status, and creation data rather than introducing another database state.

---

## Known Limitations

- No authentication or role management
- No ticket assignment, comments, or attachments
- No ticket history or audit trail
- No real-time updates
- No frontend component tests
- Triage does not persist a user's position between sessions
- Analytics currently use a bounded 14-day activity window

---

## AI Assistance

AI tools were used selectively during frontend development for UI ideation, design iteration, and implementation assistance.

The backend API, database schema, Prisma setup, migrations, seed data, validation, and core application logic were implemented manually. The final implementation was reviewed, tested, and modified as needed.

---

## Time Spent

**Approximately [5 hours].**
