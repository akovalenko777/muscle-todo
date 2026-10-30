-- CreateTable
CREATE TABLE "quick_task" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quick_task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "quick_task" ADD CONSTRAINT "quick_task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
