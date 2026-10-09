-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'EXTRACTING', 'GENERATING', 'GENERATED', 'PUBLISHING', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "generation_jobs" (
    "id" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "source_url_hash" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "source" JSONB,
    "article" JSONB,
    "llm_provider" TEXT,
    "llm_model" TEXT,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "wp_post_id" INTEGER,
    "permalink" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "generation_jobs_source_url_hash_idx" ON "generation_jobs"("source_url_hash");

-- CreateIndex
CREATE INDEX "generation_jobs_created_at_idx" ON "generation_jobs"("created_at");
