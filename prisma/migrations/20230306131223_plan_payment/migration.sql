/*
  Warnings:

  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `payment` DROP FOREIGN KEY `payment_userId_fkey`;

-- AlterTable
ALTER TABLE `user` MODIFY `packageType` ENUM('NONE', 'BASIC', 'MEDIUM', 'ADVANCED', 'TRIAL', 'FREE', 'OTHER') NULL DEFAULT 'TRIAL';

-- DropTable
DROP TABLE `payment`;

-- CreateTable
CREATE TABLE `plan_payment` (
    `id` VARCHAR(191) NOT NULL,
    `merchant_oid` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `user_basket` VARCHAR(191) NOT NULL,
    `user_phone` VARCHAR(191) NOT NULL,
    `user_name` VARCHAR(191) NOT NULL,
    `user_address` VARCHAR(191) NOT NULL,
    `payment_amount` DOUBLE NOT NULL,
    `packageType` ENUM('NONE', 'BASIC', 'MEDIUM', 'ADVANCED', 'TRIAL', 'FREE', 'OTHER') NULL DEFAULT 'TRIAL',
    `annual` BOOLEAN NOT NULL DEFAULT false,
    `success` BOOLEAN NULL,
    `errorReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `plan_payment_merchant_oid_key`(`merchant_oid`),
    INDEX `plan_payment_id_userId_idx`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `plan_payment` ADD CONSTRAINT `plan_payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
