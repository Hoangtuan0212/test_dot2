/*
  Warnings:

  - You are about to alter the column `gender` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- DropForeignKey
ALTER TABLE `orderdetail` DROP FOREIGN KEY `OrderDetail_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `orderdetail` DROP FOREIGN KEY `OrderDetail_product_id_fkey`;

-- AlterTable
ALTER TABLE `user` MODIFY `gender` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL;

-- AddForeignKey
ALTER TABLE `orderdetail` ADD CONSTRAINT `OrderDetail_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orderdetail` ADD CONSTRAINT `OrderDetail_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
