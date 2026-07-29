CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED');

ALTER TABLE "Media"
  ADD COLUMN "alt" TEXT,
  ADD COLUMN "caption" TEXT,
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "storageKey" TEXT,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Media_url_key" ON "Media"("url");

CREATE TABLE "ContentDocument" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "route" TEXT,
  "schemaVersion" INTEGER NOT NULL DEFAULT 1,
  "draftData" JSONB NOT NULL,
  "publishedData" JSONB,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentDocument_key_key" ON "ContentDocument"("key");

CREATE TABLE "ContentRevision" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "data" JSONB NOT NULL,
  "note" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentRevision_documentId_version_key"
  ON "ContentRevision"("documentId", "version");

CREATE TABLE "ServiceContent" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "shortDescription" TEXT NOT NULL,
  "heroContent" TEXT NOT NULL,
  "iconKey" TEXT,
  "colorKey" TEXT,
  "coverMediaId" TEXT,
  "priceText" TEXT,
  "durationText" TEXT,
  "features" JSONB NOT NULL,
  "process" JSONB NOT NULL,
  "faqs" JSONB NOT NULL,
  "ctaText" TEXT,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "seoKeywords" TEXT[],
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceContent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ServiceContent_slug_key" ON "ServiceContent"("slug");

ALTER TABLE "Media"
  ADD CONSTRAINT "Media_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContentDocument"
  ADD CONSTRAINT "ContentDocument_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContentRevision"
  ADD CONSTRAINT "ContentRevision_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "ContentDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContentRevision"
  ADD CONSTRAINT "ContentRevision_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ServiceContent"
  ADD CONSTRAINT "ServiceContent_coverMediaId_fkey"
  FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
