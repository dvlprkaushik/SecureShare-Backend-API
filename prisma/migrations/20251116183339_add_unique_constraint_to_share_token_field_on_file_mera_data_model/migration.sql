/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `FileMetaData` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FileMetaData_shareToken_key" ON "FileMetaData"("shareToken");
