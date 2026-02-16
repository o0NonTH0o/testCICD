-- AlterTable
ALTER TABLE "AwardType" ADD COLUMN     "criteria" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "iconUrl" TEXT,
ADD COLUMN     "scheduleFileUrl" TEXT,
ADD COLUMN     "tags" TEXT[];
