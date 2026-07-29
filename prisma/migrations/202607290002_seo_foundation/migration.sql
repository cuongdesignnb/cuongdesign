CREATE TYPE "ProjectSchemaKind" AS ENUM (
  'CREATIVE_WORK',
  'SOFTWARE_SOURCE_CODE',
  'WEB_SITE',
  'WEB_APPLICATION'
);

CREATE TYPE "ProductPricingMode" AS ENUM ('FIXED', 'FREE', 'CONTACT');

CREATE TYPE "ProductAvailability" AS ENUM (
  'IN_STOCK',
  'OUT_OF_STOCK',
  'PRE_ORDER',
  'LIMITED'
);

ALTER TABLE "ServiceContent"
  ADD COLUMN "canonicalPath" TEXT,
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "ServiceContent"
SET "publishedAt" = COALESCE("publishedAt", "updatedAt")
WHERE "isPublished" = true;

ALTER TABLE "Page"
  ADD COLUMN "seoKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "canonicalPath" TEXT,
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "robotsFollow" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Project"
  ADD COLUMN "projectType" "ProjectSchemaKind" NOT NULL DEFAULT 'CREATIVE_WORK',
  ADD COLUMN "clientName" TEXT,
  ADD COLUMN "clientIndustry" TEXT,
  ADD COLUMN "projectRole" TEXT,
  ADD COLUMN "completedAt" TIMESTAMP(3),
  ADD COLUMN "projectResult" TEXT,
  ADD COLUMN "seoTitle" TEXT,
  ADD COLUMN "seoDescription" TEXT,
  ADD COLUMN "seoKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "canonicalPath" TEXT,
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "Project"
SET "isPublished" = true,
    "publishedAt" = COALESCE("publishedAt", "createdAt");

ALTER TABLE "Product"
  ADD COLUMN "content" TEXT,
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'VND',
  ADD COLUMN "pricingMode" "ProductPricingMode" NOT NULL DEFAULT 'FIXED',
  ADD COLUMN "availability" "ProductAvailability" NOT NULL DEFAULT 'IN_STOCK',
  ADD COLUMN "priceValidUntil" TIMESTAMP(3),
  ADD COLUMN "sku" TEXT,
  ADD COLUMN "brandName" TEXT,
  ADD COLUMN "softwareCategory" TEXT,
  ADD COLUMN "operatingSystem" TEXT,
  ADD COLUMN "softwareVersion" TEXT,
  ADD COLUMN "licenseName" TEXT,
  ADD COLUMN "seoTitle" TEXT,
  ADD COLUMN "seoDescription" TEXT,
  ADD COLUMN "seoKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "canonicalPath" TEXT,
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "publishedAt" TIMESTAMP(3);

UPDATE "Product"
SET "pricingMode" = CASE
      WHEN "price" = 0 THEN 'CONTACT'::"ProductPricingMode"
      ELSE 'FIXED'::"ProductPricingMode"
    END,
    "isPublished" = true,
    "publishedAt" = COALESCE("publishedAt", "createdAt");

CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

ALTER TABLE "Category"
  ADD COLUMN "seoTitle" TEXT,
  ADD COLUMN "seoDescription" TEXT,
  ADD COLUMN "seoKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "canonicalPath" TEXT,
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "robotsFollow" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Post"
  ADD COLUMN "canonicalPath" TEXT,
  ADD COLUMN "ogTitle" TEXT,
  ADD COLUMN "ogDescription" TEXT,
  ADD COLUMN "ogImage" TEXT,
  ADD COLUMN "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "robotsFollow" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "SeoRedirect" (
  "id" TEXT NOT NULL,
  "sourcePath" TEXT NOT NULL,
  "destinationPath" TEXT NOT NULL,
  "permanent" BOOLEAN NOT NULL DEFAULT true,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SeoRedirect_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SeoRedirect_sourcePath_key" ON "SeoRedirect"("sourcePath");
CREATE INDEX "SeoRedirect_destinationPath_idx" ON "SeoRedirect"("destinationPath");

UPDATE "ContentDocument"
SET "draftData" = REPLACE("draftData"::TEXT, 'Nguyễn Văn Cường', 'Đinh Cường')::JSONB,
    "publishedData" = CASE
      WHEN "publishedData" IS NULL THEN NULL
      ELSE REPLACE("publishedData"::TEXT, 'Nguyễn Văn Cường', 'Đinh Cường')::JSONB
    END
WHERE "draftData"::TEXT LIKE '%Nguyễn Văn Cường%'
   OR "publishedData"::TEXT LIKE '%Nguyễn Văn Cường%';

UPDATE "ContentDocument"
SET "draftData" = REPLACE("draftData"::TEXT, 'Cuong Design', 'Cường Design')::JSONB,
    "publishedData" = CASE
      WHEN "publishedData" IS NULL THEN NULL
      ELSE REPLACE("publishedData"::TEXT, 'Cuong Design', 'Cường Design')::JSONB
    END
WHERE "draftData"::TEXT LIKE '%Cuong Design%'
   OR "publishedData"::TEXT LIKE '%Cuong Design%';
