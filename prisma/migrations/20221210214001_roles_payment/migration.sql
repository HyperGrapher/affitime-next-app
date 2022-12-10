/*
  Warnings:

  - You are about to drop the column `active` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `partnerId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `trial` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `vendorId` on the `session` table. All the data in the column will be lost.
  - You are about to drop the `example` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `active` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `trial` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `session` DROP COLUMN `active`,
    DROP COLUMN `partnerId`,
    DROP COLUMN `role`,
    DROP COLUMN `trial`,
    DROP COLUMN `vendorId`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `ipdata` JSON NULL,
    ADD COLUMN `packageType` ENUM('BASIC', 'MEDIUM', 'ADVANCED', 'OTHER') NULL DEFAULT 'BASIC',
    ADD COLUMN `partner_id` VARCHAR(191) NULL,
    ADD COLUMN `pro` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `proDetails` JSON NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `vendor_id` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NOT NULL,
    MODIFY `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `trial` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `password` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('PARTNER', 'VENDOR', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'PARTNER';

-- DropTable
DROP TABLE `example`;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `packageType` ENUM('BASIC', 'MEDIUM', 'ADVANCED', 'OTHER') NULL DEFAULT 'BASIC',
    `error` BOOLEAN NOT NULL DEFAULT false,
    `errorReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Payment_id_userId_idx`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Link_id_idx` ON `Link`(`id`);

-- CreateIndex
CREATE INDEX `Partner_id_userId_idx` ON `Partner`(`id`, `userId`);

-- CreateIndex
CREATE INDEX `Product_id_vendor_profile_id_idx` ON `Product`(`id`, `vendor_profile_id`);

-- CreateIndex
CREATE INDEX `User_id_email_idx` ON `User`(`id`, `email`);

-- CreateIndex
CREATE INDEX `Vendor_id_userId_idx` ON `Vendor`(`id`, `userId`);

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
