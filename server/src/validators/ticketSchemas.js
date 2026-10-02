import { z } from 'zod';

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

// 'triage' orders the queue the way a support engineer works it; see ticketService.
export const SORTS = ['newest', 'oldest', 'triage'];

const title = z
  .string({ required_error: 'Title is required' })
  .trim()
  .min(1, 'Title is required')
  .max(120, 'Title must be 120 characters or fewer');

const description = z
  .string({ required_error: 'Description is required' })
  .trim()
  .min(1, 'Description is required')
  .max(4000, 'Description must be 4000 characters or fewer');

const customerEmail = z
  .string({ required_error: 'Customer email is required' })
  .trim()
  .min(1, 'Customer email is required')
  .email('Enter a valid email address');

const priority = z.enum(PRIORITIES, {
  errorMap: () => ({ message: `Priority must be one of: ${PRIORITIES.join(', ')}` }),
});

const status = z.enum(STATUSES, {
  errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}` }),
});

export const createTicketSchema = z.object({
  title,
  description,
  customerEmail,
  priority: priority.default('MEDIUM'),
  status: status.default('OPEN'),
});

/**
 * Query string values always arrive as strings, so numeric params are coerced.
 * pageSize is intentionally not exposed: the product spec fixes pages at 10.
 */
export const listTicketsQuerySchema = z.object({
  search: z.string().trim().max(120, 'Search term is too long').optional(),
  status: status.optional(),
  priority: priority.optional(),
  sort: z.enum(SORTS).default('newest'),
  page: z.coerce.number({ invalid_type_error: 'Page must be a number' }).int().min(1).default(1),
});

export const updateTicketSchema = z
  .object({
    status: status.optional(),
    priority: priority.optional(),
  })
  .refine((value) => value.status !== undefined || value.priority !== undefined, {
    message: 'Provide at least status or priority to update',
  });

export const ticketIdParamSchema = z.object({
  id: z.coerce.number({ invalid_type_error: 'Ticket id must be a number' }).int().positive(),
});