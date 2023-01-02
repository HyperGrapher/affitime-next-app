/*
  Warnings:

  - You are about to drop the column `notified` on the `link` table. All the data in the column will be lost.
  - You are about to drop the column `partnerConfirmed` on the `link` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `Link` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `user_partner` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[brand]` on the table `user_vendor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[website]` on the table `user_vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Link_id_idx` ON `link`;

-- AlterTable
ALTER TABLE `link` DROP COLUMN `notified`,
    DROP COLUMN `partnerConfirmed`,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `partnerVisitCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `partner_notified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `url` VARCHAR(191) NOT NULL,
    ADD COLUMN `vendor_notified` BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN `active` DROP DEFAULT,
    ALTER COLUMN `confirmed` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user_partner` ALTER COLUMN `username` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user_vendor` ALTER COLUMN `brand` DROP DEFAULT,
    ALTER COLUMN `website` DROP DEFAULT;

-- AlterTable
ALTER TABLE `visit` ADD COLUMN `country` VARCHAR(191) NOT NULL DEFAULT 'tr',
    ADD COLUMN `dubiousCause` VARCHAR(191) NULL,
    ADD COLUMN `partnerVisit` BOOLEAN NULL;

-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriesOnProducts` (
    `productId` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,

    PRIMARY KEY (`productId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Link_url_key` ON `Link`(`url`);

-- CreateIndex
CREATE INDEX `Link_id_vendor_id_partner_id_product_id_idx` ON `Link`(`id`, `vendor_id`, `partner_id`, `product_id`);

-- CreateIndex
CREATE UNIQUE INDEX `user_partner_username_key` ON `user_partner`(`username`);

-- CreateIndex
CREATE UNIQUE INDEX `user_vendor_brand_key` ON `user_vendor`(`brand`);

-- CreateIndex
CREATE UNIQUE INDEX `user_vendor_website_key` ON `user_vendor`(`website`);

-- AddForeignKey
ALTER TABLE `CategoriesOnProducts` ADD CONSTRAINT `CategoriesOnProducts_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoriesOnProducts` ADD CONSTRAINT `CategoriesOnProducts_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
