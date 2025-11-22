/*
  Warnings:

  - Made the column `cloudVersion` on table `FileMetaData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FileMetaData" ALTER COLUMN "cloudVersion" SET NOT NULL,
ALTER COLUMN "cloudVersion" SET DEFAULT 0;
