/*
  Warnings:

  - You are about to drop the `partner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `link` DROP FOREIGN KEY `Link_partner_id_fkey`;

-- DropForeignKey
ALTER TABLE `link` DROP FOREIGN KEY `Link_vendor_id_fkey`;

-- DropForeignKey
ALTER TABLE `partner` DROP FOREIGN KEY `Partner_userId_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_vendor_profile_id_fkey`;

-- DropForeignKey
ALTER TABLE `vendor` DROP FOREIGN KEY `Vendor_userId_fkey`;

-- AlterTable
ALTER TABLE `payment` MODIFY `packageType` ENUM('NONE', 'BASIC', 'MEDIUM', 'ADVANCED', 'OTHER') NULL DEFAULT 'BASIC';

-- AlterTable
ALTER TABLE `user` MODIFY `packageType` ENUM('NONE', 'BASIC', 'MEDIUM', 'ADVANCED', 'OTHER') NULL DEFAULT 'BASIC';

-- DropTable
DROP TABLE `partner`;

-- DropTable
DROP TABLE `vendor`;

-- CreateTable
CREATE TABLE `user_vendor` (
    `id` VARCHAR(191) NOT NULL,
    `fname` VARCHAR(191) NULL,
    `lname` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_vendor_userId_key`(`userId`),
    INDEX `user_vendor_id_userId_idx`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_partner` (
    `id` VARCHAR(191) NOT NULL,
    `fname` VARCHAR(191) NULL,
    `lname` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_partner_userId_key`(`userId`),
    INDEX `user_partner_id_userId_idx`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_vendor` ADD CONSTRAINT `user_vendor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_partner` ADD CONSTRAINT `user_partner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_vendor_profile_id_fkey` FOREIGN KEY (`vendor_profile_id`) REFERENCES `user_vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Link` ADD CONSTRAINT `Link_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `user_partner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Link` ADD CONSTRAINT `Link_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `user_vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
