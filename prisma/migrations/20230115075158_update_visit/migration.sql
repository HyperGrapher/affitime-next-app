/*
  Warnings:

  - You are about to drop the column `device` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `ipwareIsPublic` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `ipwareIsRouteTrusted` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `partnerVisit` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `vendorVisit` on the `visit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `visit` DROP COLUMN `device`,
    DROP COLUMN `ipwareIsPublic`,
    DROP COLUMN `ipwareIsRouteTrusted`,
    DROP COLUMN `partnerVisit`,
    DROP COLUMN `vendorVisit`,
    ADD COLUMN `isPartner` BOOLEAN NULL,
    ADD COLUMN `isVendor` BOOLEAN NULL;
