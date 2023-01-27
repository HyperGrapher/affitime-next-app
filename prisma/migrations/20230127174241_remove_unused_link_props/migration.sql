/*
  Warnings:

  - You are about to drop the column `count` on the `link` table. All the data in the column will be lost.
  - You are about to drop the column `declined` on the `link` table. All the data in the column will be lost.
  - You are about to drop the column `partnerVisitCount` on the `link` table. All the data in the column will be lost.
  - You are about to drop the column `repeated` on the `link` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `link` DROP COLUMN `count`,
    DROP COLUMN `declined`,
    DROP COLUMN `partnerVisitCount`,
    DROP COLUMN `repeated`,
    ADD COLUMN `cookieLife` INTEGER NOT NULL DEFAULT 60;
