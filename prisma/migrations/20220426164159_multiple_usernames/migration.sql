-- CreateTable
CREATE TABLE "Username" (
    "username" TEXT NOT NULL,
    "id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Username_username_key" ON "Username"("username");

-- AddForeignKey
ALTER TABLE "Username" ADD CONSTRAINT "Username_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Username" (username, id)
SELECT "username", "id" FROM "User";
