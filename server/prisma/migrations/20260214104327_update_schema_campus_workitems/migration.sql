/*
  Warnings:

  - You are about to drop the column `activityType` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `advisor` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `awardWorkDate` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `awardWorkTitle` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `awards` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `birthdate` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `competition` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `competitionLevel` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `gpax` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `organizer` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `teamName` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `AwardApplication` table. All the data in the column will be lost.
  - You are about to drop the `FileLog` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,academicYear,semester]` on the table `AwardApplication` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYear` to the `AwardApplication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `AwardApplication` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FileLog" DROP CONSTRAINT "FileLog_applicationId_fkey";

-- AlterTable
ALTER TABLE "AwardApplication" DROP COLUMN "activityType",
DROP COLUMN "address",
DROP COLUMN "advisor",
DROP COLUMN "age",
DROP COLUMN "awardWorkDate",
DROP COLUMN "awardWorkTitle",
DROP COLUMN "awards",
DROP COLUMN "birthdate",
DROP COLUMN "competition",
DROP COLUMN "competitionLevel",
DROP COLUMN "gpax",
DROP COLUMN "organizer",
DROP COLUMN "teamName",
DROP COLUMN "year",
ADD COLUMN     "academicYear" TEXT NOT NULL,
ADD COLUMN     "semester" TEXT NOT NULL,
ADD COLUMN     "transcriptFile" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "campusId" TEXT;

-- DropTable
DROP TABLE "FileLog";

-- CreateTable
CREATE TABLE "ApplicationPeriod" (
    "id" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "campusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "competitionName" TEXT,
    "organizer" TEXT,
    "awardDate" TIMESTAMP(3),
    "level" TEXT,
    "rank" TEXT,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "workItemId" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AwardApplication_userId_academicYear_semester_key" ON "AwardApplication"("userId", "academicYear", "semester");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationPeriod" ADD CONSTRAINT "ApplicationPeriod_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "AwardApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
