-- AlterTable
ALTER TABLE "task" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedAt" TIMESTAMP(3);

UPDATE "task" SET "completedAt" = "updatedAt" WHERE status = 'DONE';
