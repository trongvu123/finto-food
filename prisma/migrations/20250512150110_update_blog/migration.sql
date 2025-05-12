/*
  Warnings:

  - You are about to drop the column `slug` on the `BlogPost` table. All the data in the column will be lost.
  - Added the required column `category` to the `BlogPost` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BlogPost_slug_key";

-- AlterTable
ALTER TABLE "BlogPost" DROP COLUMN "slug",
ADD COLUMN     "category" TEXT NOT NULL;
