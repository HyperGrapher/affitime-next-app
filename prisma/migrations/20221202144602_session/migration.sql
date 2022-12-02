-- DropForeignKey
ALTER TABLE `account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `session` DROP FOREIGN KEY `Session_userId_fkey`;

-- AlterTable
ALTER TABLE `session` ADD COLUMN `active` VARCHAR(191) NULL,
    ADD COLUMN `partnerId` VARCHAR(191) NULL,
    ADD COLUMN `role` VARCHAR(191) NULL,
    ADD COLUMN `trial` VARCHAR(191) NULL,
    ADD COLUMN `vendorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `account` RENAME INDEX `Account_userId_fkey` TO `Account_userId_idx`;

-- RenameIndex
ALTER TABLE `link` RENAME INDEX `Link_partner_id_fkey` TO `Link_partner_id_idx`;

-- RenameIndex
ALTER TABLE `link` RENAME INDEX `Link_product_id_fkey` TO `Link_product_id_idx`;

-- RenameIndex
ALTER TABLE `link` RENAME INDEX `Link_vendor_id_fkey` TO `Link_vendor_id_idx`;

-- RenameIndex
ALTER TABLE `product` RENAME INDEX `Product_vendor_profile_id_fkey` TO `Product_vendor_profile_id_idx`;

-- RenameIndex
ALTER TABLE `session` RENAME INDEX `Session_userId_fkey` TO `Session_userId_idx`;
