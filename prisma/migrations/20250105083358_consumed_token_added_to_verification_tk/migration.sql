/*
  Warnings:

  - Added the required column `consumed` to the `VerificationTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationTokens" ADD COLUMN     "consumed" BOOLEAN NOT NULL;
