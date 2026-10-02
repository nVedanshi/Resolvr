import { z } from 'zod';

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

// Mirrors the server schema so the user gets immediate feedback; the API
// revalidates every request regardless.
export const ticketFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be 120 characters or fewer'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(4000, 'Description must be 4000 characters or fewer'),
  customerEmail: z
    .string()
    .trim()
    .min(1, 'Customer email is required')
    .email('Enter a valid email address'),
  priority: z.enum(PRIORITIES),
  status: z.enum(STATUSES),
});

// Flattens a ZodError into the `{ field: message }` shape the form renders.
export function toFieldErrors(error) {
  const fields = {};

  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!fields[key]) fields[key] = issue.message;
  }

  return fields;
}