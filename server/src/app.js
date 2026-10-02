import express from 'express';
import ticketRoutes from './routes/ticketRoutes.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './db/prisma.js';

// Assembles the Express application, mounting routes and error handling.
export function createApp() {
  const app = express();

  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, data: { status: 'ok' } });
  });

  app.use('/api/tickets', ticketRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Closes the Prisma connection pool during shutdown.
export async function closeDatabase() {
  await prisma.$disconnect();
}