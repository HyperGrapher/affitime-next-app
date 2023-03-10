-- AlterTable
ALTER TABLE `plan_payment` ADD COLUMN `validTill` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `validTill` DATETIME(3) NULL;
