/*
  Warnings:

  - Added the required column `firstName` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `address` ADD COLUMN `company` VARCHAR(255) NULL,
    ADD COLUMN `firstName` VARCHAR(100) NOT NULL,
    ADD COLUMN `lastName` VARCHAR(100) NOT NULL,
    ADD COLUMN `phone` VARCHAR(20) NOT NULL,
    ADD COLUMN `street2` VARCHAR(255) NULL;
