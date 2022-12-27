-- AlterTable
ALTER TABLE `link` ADD COLUMN `confirmed` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user_partner` ADD COLUMN `username` VARCHAR(191) NOT NULL DEFAULT '';
