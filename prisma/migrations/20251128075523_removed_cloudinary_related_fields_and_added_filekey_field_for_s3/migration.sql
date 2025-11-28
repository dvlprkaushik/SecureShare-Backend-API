/*
  Warnings:

  - You are about to drop the column `cloudPublicId` on the `FileMetaData` table. All the data in the column will be lost.
  - You are about to drop the column `cloudVersion` on the `FileMetaData` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FileMetaData_cloudPublicId_key";

-- AlterTable
ALTER TABLE "FileMetaData" DROP COLUMN "cloudPublicId",
DROP COLUMN "cloudVersion",
ADD COLUMN     "fileKey" TEXT NOT NULL DEFAULT 'FILE_KEY';
