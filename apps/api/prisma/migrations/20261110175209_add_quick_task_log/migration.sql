-- AlterTable
ALTER TABLE "quick_task" ADD COLUMN     "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "quick_task_daily_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalTasks" INTEGER NOT NULL,
    "doneTasks" INTEGER NOT NULL,
    "list" JSONB NOT NULL,

    CONSTRAINT "quick_task_daily_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quick_task_daily_log_userId_date_key" ON "quick_task_daily_log"("userId", "date");

-- AddForeignKey
ALTER TABLE "quick_task_daily_log" ADD CONSTRAINT "quick_task_daily_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
