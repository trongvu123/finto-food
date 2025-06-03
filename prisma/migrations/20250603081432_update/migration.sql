/*
  Warnings:

  - The `imageUrl` column on the `Supplier` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" TEXT[];
