import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const reviewSchema = z.object({
  productId: z.string().trim().min(1).optional().or(z.literal("")),
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().min(10).max(1000),
});

function normalizeLimit(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 6;
  return Math.min(Math.max(Math.trunc(parsed), 1), 20);
}

function normalizeSkip(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.max(Math.trunc(parsed), 0);
}

export async function getReviews(req: { query: { limit?: string; skip?: string; productId?: string } }, res: Response) {
  const limit = normalizeLimit(req.query.limit);
  const skip = normalizeSkip(req.query.skip);
  const productId = req.query.productId?.trim();
  const productFilter = productId ? { productId } : { productId: null };

  try {
    const [total, rows] = await Promise.all([
      prisma.review.count({ where: productFilter }),
      prisma.review.findMany({
        where: productFilter,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews: rows,
        total,
        hasMore: skip + rows.length < total,
      },
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load reviews",
    });
  }
}

export async function createReview(req: { body: unknown }, res: Response) {
  const parsed = reviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid review payload",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const productId = parsed.data.productId?.trim() || null;

    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    const review = await prisma.review.create({
      data: {
        productId,
        name: parsed.data.name,
        city: parsed.data.city,
        rating: parsed.data.rating,
        review: parsed.data.review,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
    });
  }
}