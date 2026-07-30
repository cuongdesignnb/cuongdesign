ALTER TABLE "Post"
  ADD COLUMN "coverImageAlt" TEXT;

ALTER TABLE "AiTask"
  ADD COLUMN "autoPublish" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "tone" TEXT NOT NULL DEFAULT 'professional',
  ADD COLUMN "length" TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN "sharedKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "withImages" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "imageCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "claimToken" TEXT,
  ADD COLUMN "lockedAt" TIMESTAMP(3),
  ADD COLUMN "lastAttemptAt" TIMESTAMP(3),
  ADD COLUMN "nextAttemptAt" TIMESTAMP(3),
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "completedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "AiTask_generatedPostId_key"
  ON "AiTask"("generatedPostId");

CREATE UNIQUE INDEX "AiTask_claimToken_key"
  ON "AiTask"("claimToken");

CREATE INDEX "AiTask_status_scheduleTime_idx"
  ON "AiTask"("status", "scheduleTime");

CREATE INDEX "AiTask_status_nextAttemptAt_idx"
  ON "AiTask"("status", "nextAttemptAt");

CREATE INDEX "AiTask_lockedAt_idx"
  ON "AiTask"("lockedAt");

CREATE INDEX "AiTask_categoryId_idx"
  ON "AiTask"("categoryId");

ALTER TABLE "AiTask"
  ADD CONSTRAINT "AiTask_generatedPostId_fkey"
  FOREIGN KEY ("generatedPostId") REFERENCES "Post"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AiTask"
  ADD CONSTRAINT "AiTask_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
