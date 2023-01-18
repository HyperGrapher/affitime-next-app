/*
  Warnings:

  - Added the required column `status` to the `link` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `link` ADD COLUMN `status` ENUM('AWAITING', 'CONFIRMED', 'PAUSED_BY_VENDOR', 'CANCELED_BY_VENDOR', 'CANCELED_BY_PARTNER', 'PRODUCT_DELETED') NOT NULL;
