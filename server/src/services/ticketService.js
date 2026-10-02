import { prisma } from '../db/prisma.js';
import { ApiError } from '../lib/ApiError.js';

export const PAGE_SIZE = 10;

// Number of days shown by the analytics activity chart.
const ACTIVITY_DAYS = 14;

// An unresolved ticket older than this counts as overdue for triage purposes.
const OVERDUE_HOURS = 24;

// Display order for the attention overview matrix, most urgent first.
const PRIORITY_ORDER = ['HIGH', 'MEDIUM', 'LOW'];
const STATUS_ORDER = ['OPEN', 'IN_PROGRESS'];

/**
 * Returns the ORDER BY for a sort mode. Triage leans on the order the enums
 * were declared in: priority DESC puts HIGH first, status ASC puts OPEN before
 * IN_PROGRESS before RESOLVED, then the oldest ticket leads.
 */
function buildOrderBy(sort) {
  if (sort === 'oldest') return [{ createdAt: 'asc' }, { id: 'desc' }];

  if (sort === 'triage') {
    return [{ priority: 'desc' }, { status: 'asc' }, { createdAt: 'asc' }, { id: 'desc' }];
  }

  return [{ createdAt: 'desc' }, { id: 'desc' }];
}

/**
 * Triage is a workflow over unresolved work, so resolved tickets are excluded
 * unless the caller asks for a specific status. Without this the six triage
 * groups would be interleaved by resolved tickets sitting in between.
 */
function applyTriageScope({ status, sort }) {
  return sort === 'triage' && !status ? { status: { not: 'RESOLVED' } } : null;
}

// Returns one page of tickets matching the given search, filters and sort order.
export async function listTickets({ search, status, priority, sort, page }) {
  const where = {
    AND: [
      applyTriageScope({ status, sort }),
      status ? { status } : null,
      priority ? { priority } : null,
      search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { customerEmail: { contains: search, mode: 'insensitive' } },
            ],
          }
        : null,
    ].filter(Boolean),
  };
  const skip = (page - 1) * PAGE_SIZE;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: buildOrderBy(sort),
      take: PAGE_SIZE,
      skip,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    },
  };
}

// Loads a single ticket by id, raising a 404 when it does not exist.
export async function getTicketById(id) {
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) {
    throw ApiError.notFound();
  }

  return ticket;
}

// Inserts a new ticket and returns the stored row.
export async function createTicket(data) {
  return prisma.ticket.create({ data });
}

// Saves status and priority changes for an existing ticket.
export async function updateTicket(id, data) {
  // Prisma throws P2025 when the row is gone; the error handler maps that to 404.
  return prisma.ticket.update({ where: { id }, data });
}

/**
 * Dataset-wide counts. Deliberately ignores every list query parameter so the
 * summary always describes the whole database, not the current view.
 */
export async function getSummary() {
  const [total, grouped, highPriorityOpen] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.ticket.count({ where: { priority: 'HIGH', status: 'OPEN' } }),
  ]);

  const byStatus = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };

  for (const group of grouped) {
    byStatus[group.status] = group._count._all;
  }

  return {
    total,
    byStatus,
    attention: { highPriorityOpen },
  };
}

// Formats a timestamp as a local calendar day key used to bucket activity rows.
function toDayKey(value) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

// Counts matching rows into a map keyed by calendar day.
function countIntoDayCounts(rows, dateKey, counts) {
  for (const row of rows) {
    const key = toDayKey(row[dateKey]);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
}

/**
 * Aggregated, dataset-wide figures for the analytics view and the triage queue.
 * Every count is produced by PostgreSQL; JavaScript only fills gaps so a quiet
 * day still appears on the chart.
 */
export async function getAnalytics() {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const windowStart = new Date(dayStart);
  windowStart.setDate(windowStart.getDate() - (ACTIVITY_DAYS - 1));

  const overdueCutoff = new Date(now.getTime() - OVERDUE_HOURS * 60 * 60 * 1000);

  const unresolved = { status: { not: 'RESOLVED' } };
  const overdue = { createdAt: { lte: overdueCutoff } };
  const highPriorityOpen = { priority: 'HIGH', status: 'OPEN' };
  const highPriorityInProgress = { priority: 'HIGH', status: 'IN_PROGRESS' };

  const [
    total,
    groupedStatuses,
    groupedPriorities,
    unresolvedGroups,
    createdRows,
    resolvedRows,
    triageTotal,
    highPriorityOpenCount,
    highPriorityInProgressCount,
    unresolvedOverdue,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.ticket.groupBy({ by: ['priority'], _count: { _all: true } }),
    prisma.ticket.groupBy({ by: ['priority', 'status'], where: unresolved, _count: { _all: true } }),
    prisma.ticket.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { createdAt: true },
    }),
    prisma.ticket.findMany({
      where: { status: 'RESOLVED', updatedAt: { gte: windowStart } },
      select: { updatedAt: true },
    }),
    // The union keeps the headline number free of double counting across groups.
    prisma.ticket.count({
      where: { AND: [unresolved, { OR: [highPriorityOpen, highPriorityInProgress, overdue] }] },
    }),
    prisma.ticket.count({ where: highPriorityOpen }),
    prisma.ticket.count({ where: highPriorityInProgress }),
    prisma.ticket.count({ where: { AND: [unresolved, overdue] } }),
  ]);

  const createdCounts = new Map();
  const resolvedCounts = new Map();
  countIntoDayCounts(createdRows, 'createdAt', createdCounts);
  countIntoDayCounts(resolvedRows, 'updatedAt', resolvedCounts);

  const activity = [];

  for (let offset = 0; offset < ACTIVITY_DAYS; offset += 1) {
    const day = new Date(windowStart);
    day.setDate(day.getDate() + offset);
    const key = toDayKey(day);

    activity.push({
      date: key,
      created: createdCounts.get(key) ?? 0,
      resolved: resolvedCounts.get(key) ?? 0,
    });
  }

  const statusDistribution = ['OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => ({
    status,
    count: groupedStatuses.find((group) => group.status === status)?._count._all ?? 0,
  }));

  const priorityDistribution = ['HIGH', 'MEDIUM', 'LOW'].map((priority) => ({
    priority,
    count: groupedPriorities.find((group) => group.priority === priority)?._count._all ?? 0,
  }));

  const resolved = statusDistribution.find((row) => row.status === 'RESOLVED')?.count ?? 0;
  const unresolvedTotal = total - resolved;

  // Only combinations that actually contain tickets are reported.
  const unresolvedBreakdown = unresolvedGroups
    .map((group) => ({
      priority: group.priority,
      status: group.status,
      count: group._count._all,
    }))
    .filter((row) => row.count > 0)
    .sort(
      (a, b) =>
        PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority) ||
        STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
    );

  return {
    totals: { total, resolved, unresolved: unresolvedTotal },
    status: statusDistribution,
    priority: priorityDistribution,
    activity,
    // Drives the attention overview: unresolved work grouped by priority and status.
    unresolved: { total: unresolvedTotal, breakdown: unresolvedBreakdown },
    triage: {
      total: triageTotal,
      highPriorityOpen: highPriorityOpenCount,
      highPriorityInProgress: highPriorityInProgressCount,
      unresolvedOverdue,
    },
  };
}