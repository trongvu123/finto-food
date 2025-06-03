/*
  Warnings:

  - The `orderTime` column on the `ServiceOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ServiceOrder" DROP COLUMN "orderTime",
ADD COLUMN     "orderTime" TIMESTAMP(3);
