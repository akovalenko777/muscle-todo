/*
  Warnings:

  - You are about to drop the `task_owner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "task_owner" DROP CONSTRAINT "task_owner_taskId_fkey";

-- DropForeignKey
ALTER TABLE "task_owner" DROP CONSTRAINT "task_owner_userId_fkey";

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "assigneeId" TEXT;

-- DropTable
DROP TABLE "task_owner";

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
