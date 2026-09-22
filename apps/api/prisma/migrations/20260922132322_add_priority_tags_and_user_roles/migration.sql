/*
  Warnings:

  - A unique constraint covering the columns `[text]` on the table `tag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tag_text_key" ON "tag"("text");
