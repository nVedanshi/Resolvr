import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp, closeDatabase } from '../src/app.js';
import { prisma } from '../src/db/prisma.js';

const app = createApp();

const HOUR = 60 * 60 * 1000;

/** Deterministic fixtures: every test starts from a known set of rows. */
function buildFixtures() {
  const now = Date.now();

  return [
    {
      title: 'Checkout returns 500 for guest orders',
      description: 'Guest checkout fails on submit.',
      customerEmail: 'orders@harborline-supply.com',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date(now - 2 * HOUR),
    },
    {
      title: 'Invoice PDF missing tax ID',
      description: 'VAT number not printed on the invoice.',
      customerEmail: 'finance@calderwood-retail.ie',
      priority: 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date(now - 5 * HOUR),
    },
    {
      title: 'Password reset email delayed',
      description: 'Reset mail arrives after 20 minutes.',
      customerEmail: 'support@cranmore-services.co.uk',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdAt: new Date(now - 26 * HOUR),
    },
    {
      title: 'Address autocomplete wrong suggestion',
      description: 'Demolished unit still suggested.',
      customerEmail: 'admin@harlow-provisions.com',
      priority: 'LOW',
      status: 'RESOLVED',
      createdAt: new Date(now - 50 * HOUR),
    },
    {
      title: 'Duplicate order created by double click',
      description: 'Same order submitted twice.',
      customerEmail: 'orders@harborline-supply.com',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      createdAt: new Date(now - 74 * HOUR),
    },
  ];
}

beforeEach(async () => {
  await prisma.ticket.deleteMany();
  await prisma.ticket.createMany({ data: buildFixtures() });
});

afterAll(async () => {
  await closeDatabase();
});

describe('POST /api/tickets', () => {
  it('rejects an invalid ticket with 400 and per-field messages', async () => {
    const response = await request(app).post('/api/tickets').send({
      title: '',
      description: '',
      customerEmail: 'not-an-email',
      priority: 'URGENT',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toBe('Invalid ticket data');
    expect(response.body.error.fields).toMatchObject({
      title: expect.any(String),
      description: expect.any(String),
      customerEmail: expect.any(String),
      priority: expect.any(String),
    });

    const count = await prisma.ticket.count();
    expect(count).toBe(buildFixtures().length);
  });

  it('creates a ticket and defaults status to OPEN', async () => {
    const response = await request(app).post('/api/tickets').send({
      title: 'Shipping label omits HS code',
      description: 'EU parcels are held at customs.',
      customerEmail: 'logistics@brightmoor-goods.com',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.ticket).toMatchObject({
      title: 'Shipping label omits HS code',
      status: 'OPEN',
      priority: 'MEDIUM',
    });
    expect(response.body.data.ticket.id).toBeTypeOf('number');
  });
});

describe('GET /api/tickets', () => {
  it('combines search, filters, sorting and pagination on the server', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ search: 'harborline', status: 'OPEN', sort: 'oldest', page: 1 });

    expect(response.status).toBe(200);

    const { tickets, pagination } = response.body.data;

    expect(pagination).toEqual({ page: 1, pageSize: 10, total: 1, totalPages: 1 });
    expect(tickets).toHaveLength(1);
    expect(tickets[0].title).toBe('Checkout returns 500 for guest orders');
  });

  it('paginates at ten rows per page and sorts newest first by default', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ sort: 'newest', page: 1 })
      .expect(200);

    expect(response.body.data.pagination.pageSize).toBe(10);

    // 12 additional rows push the fixture set past a single page.
    await prisma.ticket.createMany({
      data: Array.from({ length: 12 }, (_, index) => ({
        title: `Filler ticket ${index + 1}`,
        description: 'Created to force a second page.',
        customerEmail: `filler${index + 1}@example.com`,
        status: 'OPEN',
        priority: 'LOW',
        createdAt: new Date(Date.now() - (index + 1) * HOUR),
      })),
    });

    const firstPage = await request(app).get('/api/tickets').query({ page: 1 }).expect(200);
    const secondPage = await request(app).get('/api/tickets').query({ page: 2 }).expect(200);

    expect(firstPage.body.data.tickets).toHaveLength(10);
    expect(firstPage.body.data.pagination.total).toBe(17);
    expect(firstPage.body.data.pagination.totalPages).toBe(2);
    expect(secondPage.body.data.tickets).toHaveLength(7);

    const timestamps = firstPage.body.data.tickets.map((ticket) => new Date(ticket.createdAt));
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });

  it('rejects an unknown status filter with 400', async () => {
    const response = await request(app).get('/api/tickets').query({ status: 'CLOSED' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.fields.status).toMatch(/Status must be one of/);
  });
});

describe('PATCH /api/tickets/:id', () => {
  it('persists a status change in the database', async () => {
    const target = await prisma.ticket.findFirst({ where: { status: 'OPEN' } });

    const response = await request(app)
      .patch(`/api/tickets/${target.id}`)
      .send({ status: 'RESOLVED', priority: 'LOW' })
      .expect(200);

    expect(response.body.data.ticket.status).toBe('RESOLVED');
    expect(response.body.data.ticket.priority).toBe('LOW');

    // Read back through the API so the assertion covers the whole round trip.
    const reread = await request(app).get(`/api/tickets/${target.id}`).expect(200);
    expect(reread.body.data.ticket.status).toBe('RESOLVED');
    expect(new Date(reread.body.data.ticket.updatedAt).getTime()).toBeGreaterThan(
      new Date(target.createdAt).getTime(),
    );
  });

  it('returns 404 when the ticket does not exist', async () => {
    const response = await request(app).patch('/api/tickets/999999').send({ status: 'RESOLVED' });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('rejects an empty update payload with 400', async () => {
    const response = await request(app).patch('/api/tickets/1').send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/tickets/summary', () => {
  it('counts the whole dataset regardless of active filters', async () => {
    const response = await request(app)
      .get('/api/tickets/summary')
      .query({ search: 'harborline', status: 'OPEN', priority: 'HIGH', page: 1 })
      .expect(200);

    expect(response.body.data.total).toBe(5);
    expect(response.body.data.byStatus).toEqual({
      OPEN: 2,
      IN_PROGRESS: 1,
      RESOLVED: 2,
    });
    expect(response.body.data.attention.highPriorityOpen).toBe(1);
  });
});

describe('GET /api/tickets with sort=triage', () => {
  it('orders unresolved work high priority first, open before in progress, then oldest', async () => {
    // Two more HIGH+OPEN tickets prove the oldest-first tiebreaker inside a group.
    await prisma.ticket.createMany({
      data: [
        {
          title: 'Younger high priority ticket',
          description: 'Newer member of the HIGH+OPEN group.',
          customerEmail: 'ops@example.com',
          status: 'OPEN',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 1 * HOUR),
        },
        {
          title: 'Older high priority ticket',
          description: 'Older member of the HIGH+OPEN group.',
          customerEmail: 'ops@example.com',
          status: 'OPEN',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 40 * HOUR),
        },
      ],
    });

    const response = await request(app).get('/api/tickets').query({ sort: 'triage' }).expect(200);

    // HIGH+OPEN oldest first, then HIGH+IN_PROGRESS, then MEDIUM+OPEN. Resolved
    // tickets are excluded because triage is a workflow over open work.
    expect(response.body.data.tickets.map((ticket) => ticket.title)).toEqual([
      'Older high priority ticket',
      'Checkout returns 500 for guest orders',
      'Younger high priority ticket',
      'Password reset email delayed',
      'Invoice PDF missing tax ID',
    ]);
    expect(response.body.data.pagination.total).toBe(5);
  });

  it('still honours an explicit status alongside the triage order', async () => {
    const response = await request(app)
      .get('/api/tickets')
      .query({ sort: 'triage', status: 'RESOLVED' })
      .expect(200);

    expect(response.body.data.pagination.total).toBe(2);
  });

  it('rejects an unknown sort value', async () => {
    const response = await request(app).get('/api/tickets').query({ sort: 'random' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/tickets/analytics', () => {
  it('returns dataset-wide distributions and triage figures', async () => {
    const response = await request(app).get('/api/tickets/analytics').expect(200);

    const { totals, status, priority, activity, triage, unresolved } = response.body.data;

    expect(totals).toEqual({ total: 5, resolved: 2, unresolved: 3 });
    expect(status).toEqual([
      { status: 'OPEN', count: 2 },
      { status: 'IN_PROGRESS', count: 1 },
      { status: 'RESOLVED', count: 2 },
    ]);
    expect(priority).toEqual([
      { priority: 'HIGH', count: 2 },
      { priority: 'MEDIUM', count: 2 },
      { priority: 'LOW', count: 1 },
    ]);

    // Unresolved work only, ordered by priority then status, empty combinations omitted.
    expect(unresolved).toEqual({
      total: 3,
      breakdown: [
        { priority: 'HIGH', status: 'OPEN', count: 1 },
        { priority: 'HIGH', status: 'IN_PROGRESS', count: 1 },
        { priority: 'MEDIUM', status: 'OPEN', count: 1 },
      ],
    });

    expect(triage).toEqual({
      total: 2,
      highPriorityOpen: 1,
      highPriorityInProgress: 1,
      unresolvedOverdue: 1,
    });

    // Every fixture falls inside the 14 day window.
    expect(activity).toHaveLength(14);
    expect(activity.reduce((sum, day) => sum + day.created, 0)).toBe(5);
    expect(activity.reduce((sum, day) => sum + day.resolved, 0)).toBe(2);
  });
});