import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema,
} from '../validators/ticketSchemas.js';
import * as ticketService from '../services/ticketService.js';
import { sendSuccess } from '../lib/httpResponse.js';

// Controllers stay thin: validate the request, call the service, shape the response.

// Creates a ticket from a validated request body.
export async function createTicket(req, res) {
  const payload = createTicketSchema.parse(req.body);
  const ticket = await ticketService.createTicket(payload);

  return sendSuccess(res, { ticket }, 201);
}

// Returns a page of tickets applying the requested search, filters and sort order.
export async function listTickets(req, res) {
  const query = listTicketsQuerySchema.parse(req.query);
  const result = await ticketService.listTickets(query);

  return sendSuccess(res, result);
}

// Returns one ticket by its id.
export async function getTicket(req, res) {
  const { id } = ticketIdParamSchema.parse(req.params);
  const ticket = await ticketService.getTicketById(id);

  return sendSuccess(res, { ticket });
}

// Updates a ticket's status and priority and returns the saved ticket.
export async function updateTicket(req, res) {
  const { id } = ticketIdParamSchema.parse(req.params);
  const changes = updateTicketSchema.parse(req.body);
  const ticket = await ticketService.updateTicket(id, changes);

  return sendSuccess(res, { ticket });
}

// Returns dataset-wide counts that ignore the active search and filters.
export async function getSummary(req, res) {
  const summary = await ticketService.getSummary();

  return sendSuccess(res, summary);
}

// Returns aggregated figures for the analytics view and the triage queue.
export async function getAnalytics(req, res) {
  const analytics = await ticketService.getAnalytics();

  return sendSuccess(res, analytics);
}