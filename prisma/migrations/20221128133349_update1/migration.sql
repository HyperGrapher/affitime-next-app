/*
  Warnings:

  - You are about to alter the column `price` on the `product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `image` TEXT NULL,
    MODIFY `price` DOUBLE NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `active` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `trial` BOOLEAN NULL DEFAULT true;
