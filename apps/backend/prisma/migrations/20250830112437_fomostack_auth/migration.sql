/*
  Warnings:

  - The `balance` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenExpiry" TIMESTAMP(3),
DROP COLUMN "balance",
ADD COLUMN     "balance" JSONB NOT NULL DEFAULT '{}';
