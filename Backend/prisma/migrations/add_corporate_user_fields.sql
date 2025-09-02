-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_corporate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "company_name" TEXT;
