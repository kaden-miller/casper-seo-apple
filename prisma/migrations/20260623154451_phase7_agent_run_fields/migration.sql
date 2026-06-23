/*
  Warnings:

  - Added the required column `updatedAt` to the `AgentRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AgentRunStatus" ADD VALUE 'VALIDATION_FAILED';

-- AlterTable
ALTER TABLE "AgentRun" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "maxTokens" INTEGER,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "promptVersion" TEXT,
ADD COLUMN     "provider" TEXT,
ADD COLUMN     "temperature" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validationError" TEXT;

-- CreateIndex
CREATE INDEX "AgentRun_clientId_idx" ON "AgentRun"("clientId");

-- AddForeignKey
ALTER TABLE "AgentRun" ADD CONSTRAINT "AgentRun_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
