/*
  Warnings:

  - You are about to drop the column `partner` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `vendor` on the `visit` table. All the data in the column will be lost.
  - Made the column `partner_id` on table `visit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendor_id` on table `visit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `link` MODIFY `status` ENUM('AWAITING', 'CONFIRMED', 'REQUEST_DENIED', 'PAUSED_BY_VENDOR', 'CANCELED_BY_VENDOR', 'CANCELED_BY_PARTNER', 'CANCELED_BY_ADMIN', 'PRODUCT_DELETED') NOT NULL;

-- AlterTable
ALTER TABLE `user_partner` ADD COLUMN `image` TEXT NULL;

-- AlterTable
ALTER TABLE `user_vendor` ADD COLUMN `image` TEXT NULL;

-- AlterTable
ALTER TABLE `visit` DROP COLUMN `partner`,
    DROP COLUMN `vendor`,
    ADD COLUMN `isPartner` BOOLEAN NULL,
    ADD COLUMN `isVendor` BOOLEAN NULL,
    ADD COLUMN `perClick` DOUBLE NULL,
    ADD COLUMN `perClickType` ENUM('CASH', 'PERC') NOT NULL DEFAULT 'CASH',
    ADD COLUMN `perSale` DOUBLE NULL,
    ADD COLUMN `perSaleType` ENUM('CASH', 'PERC') NOT NULL DEFAULT 'CASH',
    ADD COLUMN `price` DOUBLE NULL,
    MODIFY `partner_id` VARCHAR(191) NOT NULL,
    MODIFY `vendor_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `faq` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quest` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `answer` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `faq_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `visit` ADD CONSTRAINT `visit_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `user_vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visit` ADD CONSTRAINT `visit_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `user_partner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
