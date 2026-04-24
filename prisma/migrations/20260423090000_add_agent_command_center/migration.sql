-- AlterEnum
ALTER TYPE "JobType" ADD VALUE IF NOT EXISTS 'GENERATE_CAMPAIGN_PLAN';
ALTER TYPE "JobType" ADD VALUE IF NOT EXISTS 'GENERATE_CONTENT_PACK';
ALTER TYPE "JobType" ADD VALUE IF NOT EXISTS 'GENERATE_VIDEO_PROMPT';
ALTER TYPE "JobType" ADD VALUE IF NOT EXISTS 'GENERATE_AUTOMATION_PROMPT';

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('CAMPAIGN_BUILDER', 'CONTENT_CREATOR', 'VIDEO_PROMPT', 'AUTOMATION_BUILDER');

-- CreateEnum
CREATE TYPE "AgentPromptStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "AgentPrompt" (
    "id" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "title" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "AgentPromptStatus" NOT NULL DEFAULT 'QUEUED',
    "createdById" TEXT NOT NULL,
    "campaignId" TEXT,
    "contentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentPrompt_agentType_status_idx" ON "AgentPrompt"("agentType", "status");

-- CreateIndex
CREATE INDEX "AgentPrompt_createdById_idx" ON "AgentPrompt"("createdById");

-- CreateIndex
CREATE INDEX "AgentPrompt_campaignId_idx" ON "AgentPrompt"("campaignId");

-- CreateIndex
CREATE INDEX "AgentPrompt_contentId_idx" ON "AgentPrompt"("contentId");

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
