-- CreateEnum
CREATE TYPE "PublicSubmissionType" AS ENUM ('CONSULTATION', 'INTAKE', 'ONBOARDING');

-- CreateTable
CREATE TABLE "PublicSubmission" (
    "id" TEXT NOT NULL,
    "type" "PublicSubmissionType" NOT NULL,
    "source" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "company" TEXT,
    "payload" JSONB NOT NULL,
    "summary" JSONB,
    "requestMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leadId" TEXT,

    CONSTRAINT "PublicSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PublicSubmission_type_createdAt_idx" ON "PublicSubmission"("type", "createdAt");

-- CreateIndex
CREATE INDEX "PublicSubmission_source_idx" ON "PublicSubmission"("source");

-- CreateIndex
CREATE INDEX "PublicSubmission_email_idx" ON "PublicSubmission"("email");

-- CreateIndex
CREATE INDEX "PublicSubmission_leadId_idx" ON "PublicSubmission"("leadId");

-- AddForeignKey
ALTER TABLE "PublicSubmission" ADD CONSTRAINT "PublicSubmission_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
