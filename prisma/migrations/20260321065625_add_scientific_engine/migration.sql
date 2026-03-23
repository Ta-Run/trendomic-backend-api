-- AlterTable
ALTER TABLE "GenerationHistory" ADD COLUMN     "chaosAlert" TEXT,
ADD COLUMN     "r0Score" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "viralScore" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserEngagementProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bayesianWeights" JSONB NOT NULL DEFAULT '{}',
    "contentDNA" TEXT,
    "nicheHistory" JSONB NOT NULL DEFAULT '[]',
    "postCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEngagementProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEngagementProfile_userId_key" ON "UserEngagementProfile"("userId");

-- CreateIndex
CREATE INDEX "UserEngagementProfile_userId_idx" ON "UserEngagementProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserEngagementProfile" ADD CONSTRAINT "UserEngagementProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
