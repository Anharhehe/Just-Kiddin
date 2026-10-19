UPDATE "CustomerOrder" AS orders
SET "userId" = users."id"
FROM "User" AS users
WHERE orders."userId" IS NULL
  AND LOWER(orders."email") = LOWER(users."email");

ALTER TABLE "Review" ADD COLUMN "userId" TEXT;

ALTER TABLE "Review"
ADD CONSTRAINT "Review_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Review_userId_idx" ON "Review"("userId");