/*
  Warnings:

  - You are about to drop the column `bestPostingTime` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `idempotencyKey` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `llmRawOutput` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `scoredHashtags` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `scriptSuggestions` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `trafficForecast` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Prediction` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `platform` on the `Prediction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `contentType` on the `Prediction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterEnum
ALTER TYPE "PredictionStatus" ADD VALUE 'PROCESSING';

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropIndex
DROP INDEX "AnalyticsEvent_event_idx";

-- DropIndex
DROP INDEX "PhysicsMathTask_taskType_idx";

-- DropIndex
DROP INDEX "Prediction_idempotencyKey_idx";

-- DropIndex
DROP INDEX "Prediction_idempotencyKey_key";

-- AlterTable
ALTER TABLE "Prediction" DROP COLUMN "bestPostingTime",
DROP COLUMN "explanation",
DROP COLUMN "idempotencyKey",
DROP COLUMN "llmRawOutput",
DROP COLUMN "scoredHashtags",
DROP COLUMN "scriptSuggestions",
DROP COLUMN "timezone",
DROP COLUMN "trafficForecast",
DROP COLUMN "updatedAt",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "processingTimeMs" INTEGER,
ADD COLUMN     "tokensUsed" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "platform",
ADD COLUMN     "platform" TEXT NOT NULL,
DROP COLUMN "contentType",
ADD COLUMN     "contentType" TEXT NOT NULL,
ALTER COLUMN "region" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roleId",
ADD COLUMN     "dailyLimit" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';

-- DropTable
DROP TABLE "Role";

-- DropEnum
DROP TYPE "PredictionContentType";

-- DropEnum
DROP TYPE "PredictionPlatform";

-- CreateTable
CREATE TABLE "PredictionResult" (
    "id" TEXT NOT NULL,
    "hashtags" JSONB,
    "scripts" JSONB,
    "explanation" JSONB,
    "predictionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "costEstimate" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "predictionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PredictionResult_predictionId_key" ON "PredictionResult"("predictionId");

-- CreateIndex
CREATE INDEX "UsageLog_userId_idx" ON "UsageLog"("userId");

-- CreateIndex
CREATE INDEX "UsageLog_createdAt_idx" ON "UsageLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PredictionResult" ADD CONSTRAINT "PredictionResult_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "Prediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "Prediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
