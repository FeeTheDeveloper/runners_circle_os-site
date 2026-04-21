-- AlterEnum
ALTER TYPE "JobType" ADD VALUE IF NOT EXISTS 'GENERATE_IMAGE';
ALTER TYPE "JobType" ADD VALUE IF NOT EXISTS 'GENERATE_VIDEO';

-- CreateEnum
CREATE TYPE "CreatorRequestType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "CreatorRequestStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "GeneratedAssetType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "GeneratedAssetStatus" AS ENUM ('READY', 'FAILED');

-- CreateTable
CREATE TABLE "CreatorRequest" (
    "id" TEXT NOT NULL,
    "type" "CreatorRequestType" NOT NULL,
    "templateKey" TEXT NOT NULL,
    "platform" "ContentPlatform" NOT NULL,
    "format" TEXT NOT NULL,
    "brandSlug" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "status" "CreatorRequestStatus" NOT NULL DEFAULT 'QUEUED',
    "payload" JSONB NOT NULL,
    "campaignId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedAsset" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "assetType" "GeneratedAssetType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "durationSec" INTEGER,
    "status" "GeneratedAssetStatus" NOT NULL DEFAULT 'READY',
    "metadata" JSONB NOT NULL,
    "campaignId" TEXT,
    "contentId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatorRequest_type_status_idx" ON "CreatorRequest"("type", "status");

-- CreateIndex
CREATE INDEX "CreatorRequest_campaignId_idx" ON "CreatorRequest"("campaignId");

-- CreateIndex
CREATE INDEX "CreatorRequest_createdById_idx" ON "CreatorRequest"("createdById");

-- CreateIndex
CREATE INDEX "GeneratedAsset_requestId_idx" ON "GeneratedAsset"("requestId");

-- CreateIndex
CREATE INDEX "GeneratedAsset_assetType_status_idx" ON "GeneratedAsset"("assetType", "status");

-- CreateIndex
CREATE INDEX "GeneratedAsset_campaignId_idx" ON "GeneratedAsset"("campaignId");

-- CreateIndex
CREATE INDEX "GeneratedAsset_contentId_idx" ON "GeneratedAsset"("contentId");

-- CreateIndex
CREATE INDEX "GeneratedAsset_createdById_idx" ON "GeneratedAsset"("createdById");

-- AddForeignKey
ALTER TABLE "CreatorRequest" ADD CONSTRAINT "CreatorRequest_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorRequest" ADD CONSTRAINT "CreatorRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedAsset" ADD CONSTRAINT "GeneratedAsset_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CreatorRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedAsset" ADD CONSTRAINT "GeneratedAsset_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedAsset" ADD CONSTRAINT "GeneratedAsset_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedAsset" ADD CONSTRAINT "GeneratedAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
