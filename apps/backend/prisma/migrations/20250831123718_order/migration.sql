/*
  Warnings:

  - The `balance` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "balance",
ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 5000;
