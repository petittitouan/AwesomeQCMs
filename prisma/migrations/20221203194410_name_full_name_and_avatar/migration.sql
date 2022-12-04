/*
  Warnings:

  - You are about to drop the column `name` on the `teacher` table. All the data in the column will be lost.
  - Added the required column `cheatAction` to the `QCM` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `qcm` ADD COLUMN `cheatAction` ENUM('AllowCheat', 'ValidateAnswers', 'NotifyOnly') NOT NULL;

-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `name`,
    ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL;
