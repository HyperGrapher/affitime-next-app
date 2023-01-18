/*
  Warnings:

  - You are about to drop the column `confirmed` on the `link` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `link` DROP COLUMN `confirmed`,
    MODIFY `status` ENUM('AWAITING', 'CONFIRMED', 'REQUEST_DENIED', 'PAUSED_BY_VENDOR', 'CANCELED_BY_VENDOR', 'CANCELED_BY_PARTNER', 'PRODUCT_DELETED') NOT NULL;
