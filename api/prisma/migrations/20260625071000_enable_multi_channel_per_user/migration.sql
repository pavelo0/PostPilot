-- DropIndex
DROP INDEX "Channel_userId_key";

-- CreateIndex
CREATE INDEX "Channel_userId_idx" ON "Channel"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_userId_telegramChatId_key" ON "Channel"("userId", "telegramChatId");
