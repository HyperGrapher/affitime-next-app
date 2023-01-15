/*
  Warnings:

  - You are about to drop the column `cookieInfo` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `dubiousCause` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `ipwareIp` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `isAgentBot` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `isPartner` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `isSold` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `isUnique` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `isVendor` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `isVpn` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `lastVisit` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `ua_family` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `ua_major` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `visit` table. All the data in the column will be lost.
  - You are about to drop the column `visiterIp` on the `visit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `visit` DROP COLUMN `cookieInfo`,
    DROP COLUMN `dubiousCause`,
    DROP COLUMN `ipwareIp`,
    DROP COLUMN `isAgentBot`,
    DROP COLUMN `isPartner`,
    DROP COLUMN `isSold`,
    DROP COLUMN `isUnique`,
    DROP COLUMN `isVendor`,
    DROP COLUMN `isVpn`,
    DROP COLUMN `lastVisit`,
    DROP COLUMN `ua_family`,
    DROP COLUMN `ua_major`,
    DROP COLUMN `userAgent`,
    DROP COLUMN `visiterIp`,
    ADD COLUMN `agent` TEXT NULL,
    ADD COLUMN `bot` BOOLEAN NULL,
    ADD COLUMN `cause` VARCHAR(191) NULL,
    ADD COLUMN `cookie` JSON NULL,
    ADD COLUMN `ipapi` VARCHAR(191) NULL,
    ADD COLUMN `ipware` VARCHAR(191) NULL,
    ADD COLUMN `partner` BOOLEAN NULL,
    ADD COLUMN `partner_id` VARCHAR(191) NULL,
    ADD COLUMN `referer` VARCHAR(191) NULL,
    ADD COLUMN `sold` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `uaFamily` VARCHAR(191) NULL,
    ADD COLUMN `uaMajor` VARCHAR(191) NULL,
    ADD COLUMN `unique` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `vendor` BOOLEAN NULL,
    ADD COLUMN `vendor_id` VARCHAR(191) NULL,
    ADD COLUMN `vpn` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `country` VARCHAR(191) NOT NULL DEFAULT '-',
    MODIFY `os` VARCHAR(191) NULL DEFAULT '-';
