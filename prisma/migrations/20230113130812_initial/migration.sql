-- CreateTable
CREATE TABLE `account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    INDEX `account_userId_idx`(`userId`),
    UNIQUE INDEX `account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `session_sessionToken_key`(`sessionToken`),
    INDEX `session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `packageType` ENUM('NONE', 'BASIC', 'MEDIUM', 'ADVANCED', 'OTHER') NULL DEFAULT 'BASIC',
    `error` BOOLEAN NOT NULL DEFAULT false,
    `errorReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `payment_id_userId_idx`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `fname` VARCHAR(191) NULL,
    `lname` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('PARTNER', 'VENDOR', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'PARTNER',
    `vendor_id` VARCHAR(191) NULL,
    `partner_id` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `trial` BOOLEAN NOT NULL DEFAULT true,
    `pro` BOOLEAN NOT NULL DEFAULT false,
    `packageType` ENUM('NONE', 'BASIC', 'MEDIUM', 'ADVANCED', 'OTHER') NULL DEFAULT 'BASIC',
    `proDetails` JSON NULL,
    `ipdata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_id_email_idx`(`id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_token` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verification_token_token_key`(`token`),
    UNIQUE INDEX `verification_token_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_vendor` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `website` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_vendor_userId_key`(`userId`),
    UNIQUE INDEX `user_vendor_brand_key`(`brand`),
    UNIQUE INDEX `user_vendor_website_key`(`website`),
    INDEX `user_vendor_id_userId_idx`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_partner` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_partner_userId_key`(`userId`),
    UNIQUE INDEX `user_partner_username_key`(`username`),
    INDEX `user_partner_id_userId_idx`(`id`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- CreateTable
CREATE TABLE `tags_on_products` (
    `productId` VARCHAR(191) NOT NULL,
    `tagId` INTEGER NOT NULL,

    PRIMARY KEY (`productId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NULL,
    `desc` TEXT NULL,
    `fullDesc` TEXT NULL,
    `price` DOUBLE NULL,
    `cookieLife` INTEGER NOT NULL DEFAULT 60,
    `perClick` DOUBLE NULL,
    `perClickType` ENUM('CASH', 'PERC') NOT NULL DEFAULT 'CASH',
    `perSale` DOUBLE NULL,
    `perSaleType` ENUM('CASH', 'PERC') NOT NULL DEFAULT 'CASH',
    `vendor_profile_id` VARCHAR(191) NOT NULL,
    `vendor_user_id` VARCHAR(191) NULL,
    `product_url` TEXT NULL,
    `image` TEXT NULL,
    `categoryId` INTEGER NOT NULL,
    `published` BOOLEAN NULL DEFAULT true,
    `active` BOOLEAN NULL DEFAULT true,
    `extra_info` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `product_id_vendor_profile_id_idx`(`id`, `vendor_profile_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visit` (
    `id` VARCHAR(191) NOT NULL,
    `link_id` VARCHAR(191) NOT NULL,
    `visiterIp` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'tr',
    `ipInfo` JSON NULL,
    `ipwareIp` VARCHAR(191) NULL,
    `ipwareIsPublic` BOOLEAN NULL,
    `ipwareIsRouteTrusted` BOOLEAN NULL,
    `hasCookie` BOOLEAN NOT NULL,
    `cookieInfo` JSON NULL,
    `lastVisit` DATETIME(3) NULL,
    `prevIp` VARCHAR(191) NULL,
    `isSold` BOOLEAN NOT NULL DEFAULT false,
    `isVpn` BOOLEAN NOT NULL DEFAULT false,
    `isUnique` BOOLEAN NOT NULL DEFAULT true,
    `params` VARCHAR(191) NULL,
    `dubious` BOOLEAN NULL,
    `dubiousCause` VARCHAR(191) NULL,
    `partnerVisit` BOOLEAN NULL,
    `vendorVisit` BOOLEAN NULL,
    `paid` BOOLEAN NULL,
    `os` VARCHAR(191) NULL DEFAULT 'undetected',
    `device` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `isAgentBot` BOOLEAN NULL,
    `ua_family` VARCHAR(191) NULL,
    `ua_major` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `visit_id_link_id_idx`(`id`, `link_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `link` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NOT NULL,
    `partner_user_id` VARCHAR(191) NULL,
    `vendor_id` VARCHAR(191) NOT NULL,
    `vendor_user_id` VARCHAR(191) NULL,
    `categoryId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `partnerVisitCount` INTEGER NOT NULL DEFAULT 0,
    `declined` INTEGER NOT NULL DEFAULT 0,
    `repeated` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NULL,
    `confirmed` BOOLEAN NULL,
    `vendor_notified` BOOLEAN NOT NULL DEFAULT false,
    `partner_notified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `link_url_key`(`url`),
    INDEX `link_id_product_id_url_idx`(`id`, `product_id`, `url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_ip` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ip` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `partner_id` VARCHAR(191) NULL,
    `vendor_id` VARCHAR(191) NULL,
    `ipInfo` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_ip_id_ip_idx`(`id`, `ip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NULL,
    `action` VARCHAR(191) NULL,
    `for` ENUM('PARTNER', 'VENDOR', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'PARTNER',
    `read` BOOLEAN NOT NULL DEFAULT false,
    `partner_id` VARCHAR(191) NOT NULL,
    `vendor_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `notification_id_idx`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_vendor` ADD CONSTRAINT `user_vendor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_partner` ADD CONSTRAINT `user_partner_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags_on_products` ADD CONSTRAINT `tags_on_products_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags_on_products` ADD CONSTRAINT `tags_on_products_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tag`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_vendor_profile_id_fkey` FOREIGN KEY (`vendor_profile_id`) REFERENCES `user_vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visit` ADD CONSTRAINT `visit_link_id_fkey` FOREIGN KEY (`link_id`) REFERENCES `link`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `link` ADD CONSTRAINT `link_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `link` ADD CONSTRAINT `link_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `user_partner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `link` ADD CONSTRAINT `link_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `user_vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `link` ADD CONSTRAINT `link_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `user_partner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `user_vendor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
