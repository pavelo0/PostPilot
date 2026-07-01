-- AlterTable
ALTER TABLE "PostMedia" ALTER COLUMN "telegramFileId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PostMedia" ADD COLUMN "storageKey" TEXT,
ADD COLUMN "originalName" TEXT,
ADD COLUMN "sizeBytes" INTEGER;
