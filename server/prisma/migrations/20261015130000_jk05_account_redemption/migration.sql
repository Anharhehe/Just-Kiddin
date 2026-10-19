ALTER TABLE "CustomerOrder" ADD COLUMN "userId" TEXT;

UPDATE "CustomerOrder" AS orders
SET "userId" = users."id"
FROM "User" AS users
WHERE orders."promoCode" = 'JK05'
  AND LOWER(orders."email") = LOWER(users."email");

ALTER TABLE "CustomerOrder"
ADD CONSTRAINT "CustomerOrder_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "CustomerOrder_userId_idx" ON "CustomerOrder"("userId");

DROP INDEX IF EXISTS "CustomerOrder_jk05_email_once";

CREATE UNIQUE INDEX "CustomerOrder_jk05_user_once"
ON "CustomerOrder" ("userId")
WHERE "promoCode" = 'JK05' AND "userId" IS NOT NULL;