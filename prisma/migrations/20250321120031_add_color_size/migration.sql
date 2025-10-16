/*
  Warnings:

  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `address` DROP FOREIGN KEY `address_userId_fkey`;

-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `gallery` DROP FOREIGN KEY `Gallery_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `orderdetail` DROP FOREIGN KEY `OrderDetail_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_category_id_fkey`;

-- DropTable
DROP TABLE `product`;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `thumbnail` TEXT NULL,
    `description` LONGTEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `color` VARCHAR(50) NULL,
    `size` VARCHAR(50) NULL,

    INDEX `Product_category_id_fkey`(`category_id`),
    INDEX `products_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Gallery` ADD CONSTRAINT `Gallery_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetail` ADD CONSTRAINT `OrderDetail_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `Product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `address` RENAME INDEX `address_userId_idx` TO `Address_userId_idx`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `user_email_key` TO `User_email_key`;
