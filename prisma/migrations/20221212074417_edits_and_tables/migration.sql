/*
  Warnings:

  - You are about to drop the column `visits` on the `link` table. All the data in the column will be lost.
  - You are about to drop the column `listing_info` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `store_url` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `fname` on the `user_partner` table. All the data in the column will be lost.
  - You are about to drop the column `lname` on the `user_partner` table. All the data in the column will be lost.
  - You are about to drop the column `fname` on the `user_vendor` table. All the data in the column will be lost.
  - You are about to drop the column `lname` on the `user_vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `link` DROP COLUMN `visits`,
    ADD COLUMN `count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `declined` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `platform` VARCHAR(191) NULL,
    ADD COLUMN `repeated` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `listing_info`,
    DROP COLUMN `store_url`,
    ADD COLUMN `cookieLife` INTEGER NOT NULL DEFAULT 60,
    ADD COLUMN `extra_info` JSON NULL,
    ADD COLUMN `fullDesc` TEXT NULL,
    ADD COLUMN `perClick` DOUBLE NULL,
    ADD COLUMN `perClickType` ENUM('CASH', 'PERC') NOT NULL DEFAULT 'CASH',
    ADD COLUMN `perSale` DOUBLE NULL,
    ADD COLUMN `perSaleType` ENUM('CASH', 'PERC') NOT NULL DEFAULT 'CASH',
    ADD COLUMN `product_url` TEXT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `name`,
    ADD COLUMN `fname` VARCHAR(191) NULL,
    ADD COLUMN `lname` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user_partner` DROP COLUMN `fname`,
    DROP COLUMN `lname`;

-- AlterTable
ALTER TABLE `user_vendor` DROP COLUMN `fname`,
    DROP COLUMN `lname`;

-- CreateTable
CREATE TABLE `Visit` (
    `id` VARCHAR(191) NOT NULL,
    `link_id` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NULL,
    `vendor_id` VARCHAR(191) NULL,
    `visiterIp` VARCHAR(191) NULL,
    `ipInfo` JSON NULL,
    `cookieInfo` JSON NULL,
    `isSold` BOOLEAN NOT NULL DEFAULT false,
    `isUnique` BOOLEAN NOT NULL DEFAULT true,
    `params` VARCHAR(191) NULL,
    `dubious` BOOLEAN NULL,
    `paid` BOOLEAN NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Visit` ADD CONSTRAINT `Visit_link_id_fkey` FOREIGN KEY (`link_id`) REFERENCES `Link`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
