CREATE UNIQUE INDEX "CustomerOrder_jk05_email_once"
ON "CustomerOrder" (LOWER("email"))
WHERE "promoCode" = 'JK05';