/*
  Warnings:

  - Added the required column `paymentMethod` to the `ServiceOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "paymentMethod" TEXT NOT NULL;
