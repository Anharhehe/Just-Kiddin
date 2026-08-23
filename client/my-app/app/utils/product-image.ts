type ProductImageRecord = {
  url: string;
  position?: number;
  type?: string;
  createdAt?: string | Date;
};

type ProductImageSource = {
  image?: string | string[] | null;
  images?: ProductImageRecord[] | null;
};

function sortImages(images: ProductImageRecord[]) {
  return [...images].sort((left, right) => {
    const leftPosition = typeof left.position === "number" ? left.position : 0;
    const rightPosition = typeof right.position === "number" ? right.position : 0;

    if (leftPosition !== rightPosition) {
      return leftPosition - rightPosition;
    }

    if (left.type !== right.type) {
      return left.type === "PRIMARY" ? -1 : 1;
    }

    const leftCreated = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightCreated = right.createdAt ? new Date(right.createdAt).getTime() : 0;

    return leftCreated - rightCreated;
  });
}

export function getProductGallery(product: ProductImageSource, fallback = "/demo.png") {
  if (Array.isArray(product.images) && product.images.length > 0) {
    return sortImages(product.images)
      .map((image) => image.url)
      .filter(Boolean);
  }

  if (Array.isArray(product.image)) {
    return product.image.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  }

  if (typeof product.image === "string" && product.image.trim().length > 0) {
    return [product.image];
  }

  return [fallback];
}

export function getProductImage(product: ProductImageSource, fallback = "/demo.png") {
  return getProductGallery(product, fallback)[0] ?? fallback;
}