-- CreateEnum
CREATE TYPE "PredictionPlatform" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'X', 'LINKEDIN');

-- CreateEnum
CREATE TYPE "PredictionContentType" AS ENUM ('REEL', 'SHORT', 'POST', 'VIDEO');

-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "PredictionPlatform" NOT NULL,
    "contentType" "PredictionContentType" NOT NULL,
    "topic" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "llmRawOutput" JSONB,
    "scoredHashtags" JSONB,
    "scriptSuggestions" JSONB,
    "bestPostingTime" JSONB,
    "trafficForecast" JSONB,
    "explanation" JSONB,
    "modelVersion" TEXT,
    "status" "PredictionStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_idempotencyKey_key" ON "Prediction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Prediction_userId_idx" ON "Prediction"("userId");

-- CreateIndex
CREATE INDEX "Prediction_status_idx" ON "Prediction"("status");

-- CreateIndex
CREATE INDEX "Prediction_idempotencyKey_idx" ON "Prediction"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
