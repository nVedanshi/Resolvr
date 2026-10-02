-- Trigram indexes so the case-insensitive substring search used by
-- GET /api/tickets?search=... does not fall back to a sequential scan.
-- pg_trgm ships with PostgreSQL, no extra dependency is required.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "tickets_title_trgm_idx"
  ON "tickets" USING GIN ("title" gin_trgm_ops);

CREATE INDEX "tickets_customerEmail_trgm_idx"
  ON "tickets" USING GIN ("customerEmail" gin_trgm_ops);