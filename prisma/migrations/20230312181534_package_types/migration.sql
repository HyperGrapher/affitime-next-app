/*
  Warnings:

  - The values [MEDIUM,ADVANCED] on the enum `user_packageType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MEDIUM,ADVANCED] on the enum `user_packageType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `plan_payment` MODIFY `packageType` ENUM('NONE', 'BASIC', 'PRO', 'ULTIMATE', 'TRIAL', 'FREE', 'OTHER') NULL DEFAULT 'TRIAL';

-- AlterTable
ALTER TABLE `user` MODIFY `packageType` ENUM('NONE', 'BASIC', 'PRO', 'ULTIMATE', 'TRIAL', 'FREE', 'OTHER') NULL DEFAULT 'TRIAL';
