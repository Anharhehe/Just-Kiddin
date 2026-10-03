type ProductPriceFields = {
  price: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
};

export function getProductCutoffPrice(product: ProductPriceFields) {
  if (typeof product.originalPrice === "number" && Number.isFinite(product.originalPrice)) {
    return Math.round(product.originalPrice * 1.15);
  }

  const discountPercent = Math.min(100, Math.max(0, Number(product.discountPercent) || 0));
  if (discountPercent <= 0 || discountPercent >= 100) {
    return product.price;
  }

  const legacyOriginalPrice = Math.round(product.price / (1 - discountPercent / 100));
  return Math.round(legacyOriginalPrice * 1.15);
}