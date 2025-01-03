/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `ProductImages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `ProductImages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductImages" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProductImages_publicId_key" ON "ProductImages"("publicId");
