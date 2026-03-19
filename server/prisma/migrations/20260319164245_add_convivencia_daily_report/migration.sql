-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "custodyNotes" TEXT,
ADD COLUMN     "parentADays" TEXT[],
ADD COLUMN     "parentAName" TEXT,
ADD COLUMN     "parentBDays" TEXT[],
ADD COLUMN     "parentBName" TEXT;

-- CreateTable
CREATE TABLE "DailyReport" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reportText" TEXT NOT NULL,
    "mood" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReport_childId_date_key" ON "DailyReport"("childId", "date");

-- AddForeignKey
ALTER TABLE "DailyReport" ADD CONSTRAINT "DailyReport_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
