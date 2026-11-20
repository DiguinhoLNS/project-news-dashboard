-- Garante no banco que cada URL tenha no máximo um job ativo (não FAILED).
-- A checagem feita no código (buscar e depois criar) não é atômica: dois
-- POSTs simultâneos passavam juntos por ela e criavam jobs duplicados.
--
-- O Prisma não representa índices parciais no schema, por isso ele vive
-- só nesta migration.

-- Resolve duplicatas que já existam antes de criar o índice. Fica o job
-- publicado, se houver; senão, o mais recente.
WITH ranked AS (
    SELECT
        "id",
        row_number() OVER (
            PARTITION BY "source_url_hash"
            ORDER BY ("status" = 'PUBLISHED') DESC, "created_at" DESC, "id" DESC
        ) AS "position"
    FROM "generation_jobs"
    WHERE "status" <> 'FAILED'
)
UPDATE "generation_jobs" AS job
SET
    "status" = 'FAILED',
    "error_message" = 'Job duplicado: já existe outro job ativo para esta URL.',
    "updated_at" = now()
FROM ranked
WHERE job."id" = ranked."id" AND ranked."position" > 1;

-- CreateIndex
CREATE UNIQUE INDEX "generation_jobs_active_source_url_hash_key"
    ON "generation_jobs" ("source_url_hash")
    WHERE "status" <> 'FAILED';
