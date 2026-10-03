ALTER TABLE "Product" ADD COLUMN "originalPrice" INTEGER;

UPDATE "Product"
SET "originalPrice" = CASE
  WHEN "discountPercent" > 0 AND "discountPercent" < 100
    THEN ROUND("price"::numeric / (1 - "discountPercent"::numeric / 100))::integer
  ELSE "price"
END;