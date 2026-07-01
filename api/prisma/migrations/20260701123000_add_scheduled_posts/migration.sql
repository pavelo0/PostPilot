-- AlterEnum
ALTER TYPE "PostStatus" ADD VALUE 'scheduled';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Post_scheduledAt_idx" ON "Post"("scheduledAt");
