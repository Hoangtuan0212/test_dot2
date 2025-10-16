/*
  Warnings:

  - You are about to alter the column `gender` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `gender` VARCHAR(191) NOT NULL,
    MODIFY `birthDate` DATETIME(3) NULL,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NULL,
    `country` VARCHAR(100) NOT NULL,
    `zipCode` VARCHAR(20) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,

    INDEX `address_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `address` ADD CONSTRAINT `address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
