import { randomUUID } from "crypto";
import { Response } from "express";
import type { Request } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { supabaseAdmin } from "../lib/supabase";

const PRODUCT_IMAGE_BUCKET = "product-images";

const ageGroupSchema = z.enum(["newborn", "toddler", "accessories"]);
const genderSchema = z.enum(["boy", "girl"]);

const productPayloadSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().min(2).max(220).optional(),
  category: z.string().trim().min(2).max(120).nullable().optional(),
  ageGroup: ageGroupSchema,
  gender: genderSchema.nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  price: z.number().int().nonnegative(),
  discountPercent: z.number().int().min(0).max(100).default(15),
  description: z.string().max(2000).optional().or(z.literal("")),
  sizes: z.array(z.string().trim().min(1)).default([]),
  colors: z.array(z.string().trim().min(1)).default([]),
  variantStock: z.array(z.object({
    size: z.string().trim().min(1).nullable().optional(),
    color: z.string().trim().min(1).nullable().optional(),
    quantity: z.number().int().min(0),
  })).default([]),
  sku: z.string().trim().min(1).max(120).optional().or(z.literal("")),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
}).superRefine((value, context) => {
  if (value.ageGroup === "accessories") {
    if (value.category !== null && typeof value.category !== "undefined") {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["category"], message: "Accessories must not have a category" });
    }

    if (value.gender !== null && typeof value.gender !== "undefined") {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["gender"], message: "Accessories must not have a gender" });
    }
    return;
  }

  if (!value.category?.trim()) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["category"], message: "Category is required" });
  }

  if (!value.gender) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["gender"], message: "Gender is required" });
  }
});

const imagePayloadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(120),
  base64: z.string().trim().min(16),
  altText: z.string().trim().max(255).optional().or(z.literal("")),
  position: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

type UploadedProductFile = Express.Multer.File & { buffer: Buffer };

function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return fallback;

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return fallback;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

async function makeUniqueSlug(baseValue: string, excludeProductId?: string) {
  const baseSlug = slugify(baseValue) || randomUUID();
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    const maxBaseLength = Math.max(1, 220 - String(suffix).length - 1);
    candidate = `${baseSlug.slice(0, maxBaseLength)}-${suffix}`;
    suffix += 1;
  }
}

function normalizeProduct(product: {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  ageGroup: string;
  gender: string | null;
  tags: string[];
  price: number;
  discountPercent: number;
  description: string | null;
  sizes: string[];
  colors: string[];
  variantStock: unknown;
  sku: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    id: string;
    type: string;
    url: string;
    path: string;
    altText: string | null;
    position: number;
    createdAt: Date;
  }>;
}) {
  const orderedImages = [...product.images].sort((left, right) => {
    if (left.position !== right.position) {
      return left.position - right.position;
    }

    if (left.type !== right.type) {
      return left.type === "PRIMARY" ? -1 : 1;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });

  const imageList = orderedImages.map((image) => ({
    id: image.id,
    type: image.type,
    url: image.url,
    path: image.path,
    altText: image.altText,
    position: image.position,
    createdAt: image.createdAt,
  }));

  const variantStock = Array.isArray(product.variantStock)
    ? product.variantStock
        .map((entry) => {
          if (!entry || typeof entry !== "object") {
            return null;
          }

          const typedEntry = entry as { size?: unknown; color?: unknown; quantity?: unknown };

          return {
            size: typeof typedEntry.size === "string" && typedEntry.size.trim().length > 0 ? typedEntry.size : null,
            color: typeof typedEntry.color === "string" && typedEntry.color.trim().length > 0 ? typedEntry.color : null,
            quantity: typeof typedEntry.quantity === "number" ? typedEntry.quantity : Number(typedEntry.quantity) || 0,
          };
        })
        .filter((entry): entry is { size: string | null; color: string | null; quantity: number } => Boolean(entry))
    : [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    ageGroup: product.ageGroup.toLowerCase(),
    gender: product.gender ? product.gender.toLowerCase() : null,
    tags: product.tags,
    price: product.price,
    discountPercent: product.discountPercent,
    description: product.description,
    sizes: product.sizes,
    colors: product.colors,
    variantStock,
    sku: product.sku,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    inStock: product.stockQuantity > 0,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    image: imageList.length <= 1 ? imageList[0]?.url ?? "/demo.png" : imageList.map((image) => image.url),
    images: imageList,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function splitBase64Data(base64: string) {
  const trimmed = base64.trim();

  if (!trimmed.includes("base64,")) {
    return trimmed;
  }

  return trimmed.slice(trimmed.indexOf("base64,") + 7);
}

function getStringValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return "";
}

async function getProductOrThrow(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { images: true },
  });

  if (!product) {
    return null;
  }

  return product;
}

export async function getProducts(req: { query: { ageGroup?: string; gender?: string; category?: string; featured?: string; active?: string } }, res: Response) {
  const ageGroup = req.query.ageGroup?.trim().toUpperCase();
  const gender = req.query.gender?.trim().toUpperCase();
  const category = req.query.category?.trim();
  const featured = req.query.featured?.trim().toLowerCase();
  const active = req.query.active?.trim().toLowerCase();

  const products = await prisma.product.findMany({
    where: {
      ...(ageGroup === "NEWBORN" || ageGroup === "TODDLER" ? { ageGroup: ageGroup as "NEWBORN" | "TODDLER" } : {}),
        ...(gender === "BOY" || gender === "GIRL" ? { gender: gender as "BOY" | "GIRL" } : {}),
      ...(category ? { category } : {}),
      ...(featured === "true" ? { isFeatured: true } : {}),
      ...(active === "false" ? {} : { isActive: true }),
    },
    orderBy: [
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
    include: { images: true },
  });

  return res.status(200).json({
    success: true,
    data: {
      products: products.map(normalizeProduct),
    },
  });
}

export async function getProductById(req: { params: { productId?: string } }, res: Response) {
  const productId = req.params.productId?.trim();

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product id is required",
    });
  }

  const product = await getProductOrThrow(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      product: normalizeProduct(product),
    },
  });
}

export async function createProduct(req: { body: unknown }, res: Response) {
  const parsed = productPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid product payload",
      errors: parsed.error.flatten(),
    });
  }

  const slug = await makeUniqueSlug(parsed.data.slug || parsed.data.name);
  const sku = parsed.data.sku?.trim() || null;
  const variantStock = parsed.data.variantStock.map((entry) => ({
    size: entry.size?.trim() || null,
    color: entry.color?.trim() || null,
    quantity: entry.quantity,
  }));
  const stockQuantity = variantStock.length > 0
    ? variantStock.reduce((sum, entry) => sum + entry.quantity, 0)
    : parsed.data.stockQuantity;

  const productData = parsed.data.ageGroup === "accessories"
    ? {
        slug,
        name: parsed.data.name,
        category: null,
        ageGroup: "ACCESSORIES" as const,
        gender: null,
        tags: parsed.data.tags,
        price: parsed.data.price,
        discountPercent: parsed.data.discountPercent,
        description: parsed.data.description ?? null,
        sizes: parsed.data.sizes,
        colors: parsed.data.colors,
        variantStock,
        sku,
        stockQuantity,
        lowStockThreshold: parsed.data.lowStockThreshold,
        isActive: parsed.data.isActive,
        isFeatured: parsed.data.isFeatured,
      }
    : {
        slug,
        name: parsed.data.name,
        category: parsed.data.category?.trim() || null,
        ageGroup: parsed.data.ageGroup.toUpperCase() as "NEWBORN" | "TODDLER",
        gender: parsed.data.gender?.toUpperCase() as "BOY" | "GIRL",
        tags: parsed.data.tags,
        price: parsed.data.price,
        discountPercent: parsed.data.discountPercent,
        description: parsed.data.description ?? null,
        sizes: parsed.data.sizes,
        colors: parsed.data.colors,
        variantStock,
        sku,
        stockQuantity,
        lowStockThreshold: parsed.data.lowStockThreshold,
        isActive: parsed.data.isActive,
        isFeatured: parsed.data.isFeatured,
      };

  const product = await prisma.product.create({
    data: productData,
    include: { images: true },
  });

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: {
      product: normalizeProduct(product),
    },
  });
}

export async function updateProduct(req: { params: { productId?: string }; body: unknown }, res: Response) {
  const productId = req.params.productId?.trim();

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product id is required",
    });
  }

  const parsed = productPayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid product payload",
      errors: parsed.error.flatten(),
    });
  }

  const existing = await getProductOrThrow(productId);

  if (!existing) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const nextSlug = parsed.data.slug ? await makeUniqueSlug(parsed.data.slug, productId) : undefined;
  const nextName = parsed.data.name ?? existing.name;
  const variantStock = parsed.data.variantStock.map((entry) => ({
    size: entry.size?.trim() || null,
    color: entry.color?.trim() || null,
    quantity: entry.quantity,
  }));
  const stockQuantity = variantStock.length > 0
    ? variantStock.reduce((sum, entry) => sum + entry.quantity, 0)
    : parsed.data.stockQuantity;

  const productData = parsed.data.ageGroup === "accessories"
    ? {
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.slug || parsed.data.name ? { slug: nextSlug || await makeUniqueSlug(nextName, productId) } : {}),
        ageGroup: "ACCESSORIES" as const,
        category: null,
        gender: null,
        ...(parsed.data.tags ? { tags: parsed.data.tags } : {}),
        ...(typeof parsed.data.price === "number" ? { price: parsed.data.price } : {}),
        ...(typeof parsed.data.description !== "undefined" ? { description: parsed.data.description ?? null } : {}),
        ...(parsed.data.sizes ? { sizes: parsed.data.sizes } : {}),
        ...(parsed.data.colors ? { colors: parsed.data.colors } : {}),
        ...(parsed.data.variantStock ? { variantStock } : {}),
        ...(typeof parsed.data.sku !== "undefined" ? { sku: parsed.data.sku?.trim() || null } : {}),
        ...(typeof parsed.data.stockQuantity === "number" || variantStock.length > 0 ? { stockQuantity } : {}),
        ...(typeof parsed.data.lowStockThreshold === "number" ? { lowStockThreshold: parsed.data.lowStockThreshold } : {}),
        ...(typeof parsed.data.isActive === "boolean" ? { isActive: parsed.data.isActive } : {}),
        ...(typeof parsed.data.isFeatured === "boolean" ? { isFeatured: parsed.data.isFeatured } : {}),
      }
    : {
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.slug || parsed.data.name ? { slug: nextSlug || await makeUniqueSlug(nextName, productId) } : {}),
        ...(typeof parsed.data.ageGroup !== "undefined"
          ? { ageGroup: parsed.data.ageGroup.toUpperCase() as "NEWBORN" | "TODDLER" }
          : {}),
        ...(typeof parsed.data.category !== "undefined" ? { category: parsed.data.category?.trim() || null } : {}),
        ...(typeof parsed.data.gender !== "undefined" ? { gender: parsed.data.gender?.toUpperCase() as "BOY" | "GIRL" } : {}),
        ...(parsed.data.tags ? { tags: parsed.data.tags } : {}),
        ...(typeof parsed.data.price === "number" ? { price: parsed.data.price } : {}),
        ...(typeof parsed.data.discountPercent === "number" ? { discountPercent: parsed.data.discountPercent } : {}),
        ...(typeof parsed.data.discountPercent === "number" ? { discountPercent: parsed.data.discountPercent } : {}),
        ...(typeof parsed.data.description !== "undefined" ? { description: parsed.data.description ?? null } : {}),
        ...(parsed.data.sizes ? { sizes: parsed.data.sizes } : {}),
        ...(parsed.data.colors ? { colors: parsed.data.colors } : {}),
        ...(parsed.data.variantStock ? { variantStock } : {}),
        ...(typeof parsed.data.sku !== "undefined" ? { sku: parsed.data.sku?.trim() || null } : {}),
        ...(typeof parsed.data.stockQuantity === "number" || variantStock.length > 0 ? { stockQuantity } : {}),
        ...(typeof parsed.data.lowStockThreshold === "number" ? { lowStockThreshold: parsed.data.lowStockThreshold } : {}),
        ...(typeof parsed.data.isActive === "boolean" ? { isActive: parsed.data.isActive } : {}),
        ...(typeof parsed.data.isFeatured === "boolean" ? { isFeatured: parsed.data.isFeatured } : {}),
      };

  const product = await prisma.product.update({
    where: { id: productId },
    data: productData,
    include: { images: true },
  });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: {
      product: normalizeProduct(product),
    },
  });
}

export async function deleteProduct(req: { params: { productId?: string } }, res: Response) {
  const productId = req.params.productId?.trim();

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product id is required",
    });
  }

  const product = await getProductOrThrow(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  if (product.images.length > 0) {
    await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove(product.images.map((image) => image.path));
  }

  await prisma.product.delete({ where: { id: productId } });

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
}

export async function uploadProductImage(req: { params: { productId?: string }; body: unknown }, res: Response) {
  const productId = req.params.productId?.trim();

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product id is required",
    });
  }

  const parsed = imagePayloadSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid image payload",
      errors: parsed.error.flatten(),
    });
  }

  const product = await getProductOrThrow(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const bucketPath = `${productId}/${randomUUID()}-${parsed.data.fileName.replace(/\s+/g, "-")}`;
  const buffer = new Uint8Array(Buffer.from(splitBase64Data(parsed.data.base64), "base64"));

  const uploadResult = await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).upload(bucketPath, buffer, {
    contentType: parsed.data.contentType,
    upsert: false,
  });

  if (uploadResult.error) {
    return res.status(500).json({
      success: false,
      message: uploadResult.error.message || "Failed to upload image",
    });
  }

  const publicUrl = supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(bucketPath).data.publicUrl;

  const shouldPromotePrimary = parsed.data.isPrimary || product.images.length === 0;

  if (shouldPromotePrimary) {
    await prisma.productImage.updateMany({
      where: { productId },
      data: { type: "GALLERY" },
    });
  }

  const image = await prisma.productImage.create({
    data: {
      productId,
      type: shouldPromotePrimary ? "PRIMARY" : "GALLERY",
      url: publicUrl,
      path: bucketPath,
      altText: parsed.data.altText?.trim() || null,
      position: parsed.data.position,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      image,
    },
  });
}

export async function deleteProductImage(req: { params: { productId?: string; imageId?: string } }, res: Response) {
  const productId = req.params.productId?.trim();
  const imageId = req.params.imageId?.trim();

  if (!productId || !imageId) {
    return res.status(400).json({
      success: false,
      message: "Product id and image id are required",
    });
  }

  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId,
    },
  });

  if (!image) {
    return res.status(404).json({
      success: false,
      message: "Image not found",
    });
  }

  await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([image.path]);
  await prisma.productImage.delete({ where: { id: imageId } });

  return res.status(200).json({
    success: true,
    message: "Image deleted successfully",
  });
}

export async function uploadProductImages(req: Request, res: Response) {
  const { params, files, body } = req as Request & { params: { productId?: string }; files?: Express.Multer.File[]; body: Record<string, unknown> };
  const productId = params.productId?.trim();

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: "Product id is required",
    });
  }

  const product = await getProductOrThrow(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  const uploadedFiles = (files ?? []) as UploadedProductFile[];

  if (uploadedFiles.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one image file is required",
    });
  }

  const altText = getStringValue(body.altText).trim() || null;
  const startPosition = Number(getStringValue(body.position) || 0);
  const primaryRequested = parseBoolean(body.isPrimary, false);

  const uploadedImages = [] as Array<{ id: string; type: string; url: string; path: string; altText: string | null; position: number; createdAt: Date }>;

  for (let index = 0; index < uploadedFiles.length; index += 1) {
    const file = uploadedFiles[index];
    const bucketPath = `${productId}/${randomUUID()}-${file.originalname.replace(/\s+/g, "-")}`;

    const uploadResult = await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).upload(bucketPath, new Uint8Array(file.buffer), {
      contentType: file.mimetype || "image/jpeg",
      upsert: false,
    });

    if (uploadResult.error) {
      return res.status(500).json({
        success: false,
        message: uploadResult.error.message || "Failed to upload image",
      });
    }

    const shouldPromotePrimary = (primaryRequested && index === 0) || (index === 0 && product.images.length === 0);

    if (shouldPromotePrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { type: "GALLERY" },
      });
    }

    const publicUrl = supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(bucketPath).data.publicUrl;

    const image = await prisma.productImage.create({
      data: {
        productId,
        type: shouldPromotePrimary ? "PRIMARY" : "GALLERY",
        url: publicUrl,
        path: bucketPath,
        altText,
        position: startPosition + index,
      },
    });

    uploadedImages.push(image);
  }

  return res.status(201).json({
    success: true,
    message: "Images uploaded successfully",
    data: {
      images: uploadedImages,
    },
  });
}
