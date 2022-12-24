-- AlterTable
ALTER TABLE `link` ADD COLUMN `notified` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `partnerConfirmed` BOOLEAN NULL DEFAULT true;
