-- AlterTable
ALTER TABLE "Post"
ADD COLUMN "telegramMessageId" INTEGER,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "errorMessage" TEXT;
