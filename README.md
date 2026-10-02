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

[Setup](#setup) ·
[Testing](#testing) ·
[Technical Decisions](#technical-decisions) ·
[Assumptions](#assumptions) ·
[Limitations](#known-limitations)

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
---
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
---
The dashboard displays counts across the **entire dataset**, independent of active filters:

- Total tickets
- Open tickets
- In Progress tickets
- Resolved tickets

The Attention Overview then breaks down unresolved workload by priority and status.

![RESOLVR Queue Overview](./docs/queue-overview.png)

---
### Analytics
---
Analytics provides a dataset-wide view of:

- Ticket status distribution
- Ticket priority distribution
- Ticket creation/resolution activity

![RESOLVR Analytics](./docs/analytics.png)

---
### Triage
---
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
---
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
