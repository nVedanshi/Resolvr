import { Router } from 'express';
import * as controller from '../controllers/ticketController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

// Fixed paths are registered before /:id so they are not parsed as ticket ids.
router.get('/summary', asyncHandler(controller.getSummary));
router.get('/analytics', asyncHandler(controller.getAnalytics));
router.post('/', asyncHandler(controller.createTicket));
router.get('/', asyncHandler(controller.listTickets));
router.get('/:id', asyncHandler(controller.getTicket));
router.patch('/:id', asyncHandler(controller.updateTicket));

export default router;