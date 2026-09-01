import { Prisma } from "@prisma/client";
import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const orderStatuses = ["PENDING", "DISPATCHED", "DELIVERED", "CANCELLED"] as const;
const revenueStatuses = ["DELIVERED"] as const;
const contactQueryReadStatuses = ["IN_PROGRESS", "RESOLVED"] as const;
const newArrivalsSettingKey = "newArrivalsCutoff";

const reviewSchema = z.object({
  name: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().min(10).max(1000),
});

function normalizeStatus(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const status = value.trim().toUpperCase();

  return orderStatuses.includes(status as (typeof orderStatuses)[number]) ? status : null;
}

export async function getAdminOverview(_req: unknown, res: Response) {
  const [products, activeProducts, lowStockProductsRow, orders, pendingOrders, revenueRow, customerCount, registeredUsers] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "Product"
      WHERE "isActive" = true
        AND "stockQuantity" <= "lowStockThreshold"
    `,
    prisma.customerOrder.count(),
    prisma.customerOrder.count({ where: { status: "PENDING" } }),
    prisma.$queryRaw<Array<{ revenue: bigint }>>`
      SELECT COALESCE(SUM("totalAmount"), 0)::bigint AS revenue
      FROM "CustomerOrder"
      WHERE UPPER("status") IN (${Prisma.join(revenueStatuses)})
    `,
    prisma.customerOrder.findMany({
      distinct: ["email"],
      select: { email: true },
    }),
    prisma.user.count({ where: { role: "USER" } }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      overview: {
        products,
        activeProducts,
        lowStockProducts: Number(lowStockProductsRow[0]?.count ?? 0),
        orders,
        pendingOrders,
        revenue: Number(revenueRow[0]?.revenue ?? 0),
        activeUsers: customerCount.length,
        registeredUsers,
      },
    },
  });
}

export async function getAdminOrders(req: { query: { status?: string; limit?: string; skip?: string; from?: string; to?: string } }, res: Response) {
  const status = normalizeStatus(req.query.status);
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = Math.max(Number(req.query.skip || 0), 0);
  const from = req.query.from?.trim();
  const to = req.query.to?.trim();

  const parsedFrom = from ? new Date(from) : null;
  const parsedTo = to ? new Date(to) : null;

  const createdAtFilter =
    parsedFrom && !Number.isNaN(parsedFrom.getTime()) && parsedTo && !Number.isNaN(parsedTo.getTime())
      ? { gte: parsedFrom, lte: parsedTo }
      : parsedFrom && !Number.isNaN(parsedFrom.getTime())
        ? { gte: parsedFrom }
        : parsedTo && !Number.isNaN(parsedTo.getTime())
          ? { lte: parsedTo }
          : undefined;

  const [total, orders] = await Promise.all([
    prisma.customerOrder.count({
      where: {
        ...(status ? { status } : {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      },
    }),
    prisma.customerOrder.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      orders,
      total,
      hasMore: skip + orders.length < total,
    },
  });
}

export async function updateAdminOrderStatus(req: { params: { orderId?: string }; body: unknown }, res: Response) {
  const orderId = req.params.orderId?.trim();
  const status = normalizeStatus((req.body as { status?: unknown } | undefined)?.status);

  if (!orderId) {
    return res.status(400).json({ success: false, message: "Order id is required" });
  }

  if (!status) {
    return res.status(400).json({ success: false, message: "Valid order status is required" });
  }

  const order = await prisma.customerOrder.updateMany({
    where: {
      OR: [
        { id: orderId },
        { id: { startsWith: `${orderId}-` } },
      ],
    },
    data: { status },
  });

  if (order.count === 0) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Order status updated successfully",
  });
}

function buildCustomerSearchClause(search: string | undefined) {
  if (!search) {
    return Prisma.empty;
  }

  const pattern = `%${search.toLowerCase()}%`;

  return Prisma.sql`
    WHERE LOWER(s.email) LIKE ${pattern}
       OR LOWER(COALESCE(l."fullName", s.email)) LIKE ${pattern}
       OR LOWER(COALESCE(l."mobile", '')) LIKE ${pattern}
       OR LOWER(COALESCE(l."address", '')) LIKE ${pattern}
       OR LOWER(COALESCE(l."city", '')) LIKE ${pattern}
  `;
}

const customerListQuery = (search: string | undefined, limit: number, skip: number) => Prisma.sql`
  WITH customer_summary AS (
    SELECT
      LOWER("email") AS email,
      COUNT(*)::int AS "orderCount",
      COALESCE(SUM("totalAmount"), 0)::int AS "totalSpent",
      COALESCE(SUM(CASE WHEN UPPER("status") IN (${Prisma.join(revenueStatuses)}) THEN "totalAmount" ELSE 0 END), 0)::int AS "deliveredRevenue",
      MAX("createdAt") AS "lastOrderAt"
    FROM "CustomerOrder"
    GROUP BY LOWER("email")
  ),
  latest_customer AS (
    SELECT DISTINCT ON (LOWER("email"))
      LOWER("email") AS email,
      "fullName",
      "mobile",
      "address",
      "city",
      "postalCode",
      "status" AS "lastStatus"
    FROM "CustomerOrder"
    ORDER BY LOWER("email"), "createdAt" DESC
  )
  SELECT
    s.email,
    l."fullName",
    l."mobile",
    l."address",
    l."city",
    l."postalCode",
    s."orderCount",
    s."totalSpent",
    s."deliveredRevenue",
    s."lastOrderAt",
    l."lastStatus"
  FROM customer_summary s
  LEFT JOIN latest_customer l ON l.email = s.email
  ${buildCustomerSearchClause(search)}
  ORDER BY s."lastOrderAt" DESC
  LIMIT ${limit}
  OFFSET ${skip}
`;

const customerCountQuery = Prisma.sql`
  SELECT COUNT(*)::bigint AS count
  FROM (
    SELECT LOWER("email")
    FROM "CustomerOrder"
    GROUP BY LOWER("email")
  ) AS customers
`;

export async function getAdminCustomers(req: { query: { limit?: string; skip?: string; search?: string } }, res: Response) {
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = Math.max(Number(req.query.skip || 0), 0);
  const search = req.query.search?.trim();

  const customers = await prisma.$queryRaw<Array<{
    email: string;
    fullName: string | null;
    mobile: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    orderCount: number;
    totalSpent: number;
    deliveredRevenue: number;
    lastOrderAt: Date | null;
    lastStatus: string | null;
  }>>(customerListQuery(search, limit, skip));

  const [{ count }] = await prisma.$queryRaw<Array<{ count: bigint }>>(customerCountQuery);

  return res.status(200).json({
    success: true,
    data: {
      customers,
      total: Number(count),
      hasMore: skip + customers.length < Number(count),
    },
  });
}

export async function getAdminCustomerByEmail(req: { params: { email?: string } }, res: Response) {
  const email = req.params.email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ success: false, message: "Customer email is required" });
  }

  const [summary] = await prisma.$queryRaw<Array<{
    email: string;
    fullName: string | null;
    mobile: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    orderCount: number;
    totalSpent: number;
    deliveredRevenue: number;
    lastOrderAt: Date | null;
    lastStatus: string | null;
  }>>`
    WITH customer_summary AS (
      SELECT
        LOWER("email") AS email,
        COUNT(*)::int AS "orderCount",
        COALESCE(SUM("totalAmount"), 0)::int AS "totalSpent",
        COALESCE(SUM(CASE WHEN UPPER("status") IN (${Prisma.join(revenueStatuses)}) THEN "totalAmount" ELSE 0 END), 0)::int AS "deliveredRevenue",
        MAX("createdAt") AS "lastOrderAt"
      FROM "CustomerOrder"
      WHERE LOWER("email") = ${email}
      GROUP BY LOWER("email")
    ),
    latest_customer AS (
      SELECT DISTINCT ON (LOWER("email"))
        LOWER("email") AS email,
        "fullName",
        "mobile",
        "address",
        "city",
        "postalCode",
        "status" AS "lastStatus"
      FROM "CustomerOrder"
      WHERE LOWER("email") = ${email}
      ORDER BY LOWER("email"), "createdAt" DESC
    )
    SELECT
      s.email,
      l."fullName",
      l."mobile",
      l."address",
      l."city",
      l."postalCode",
      s."orderCount",
      s."totalSpent",
      s."deliveredRevenue",
      s."lastOrderAt",
      l."lastStatus"
    FROM customer_summary s
    LEFT JOIN latest_customer l ON l.email = s.email
  `;

  const orders = await prisma.customerOrder.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!summary) {
    return res.status(404).json({ success: false, message: "Customer not found" });
  }

  return res.status(200).json({
    success: true,
    data: {
      customer: summary,
      orders,
    },
  });
}

export async function getAdminReviews(req: { query: { limit?: string; skip?: string; search?: string } }, res: Response) {
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
  const skip = Math.max(Number(req.query.skip || 0), 0);
  const search = req.query.search?.trim();

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
          { review: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      reviews,
      total,
      hasMore: skip + reviews.length < total,
    },
  });
}

export async function createAdminReview(req: { body: unknown }, res: Response) {
  const parsed = reviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid review payload",
      errors: parsed.error.flatten(),
    });
  }

  const review = await prisma.review.create({
    data: parsed.data,
  });

  return res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: { review },
  });
}

export async function updateAdminReview(req: { params: { reviewId?: string }; body: unknown }, res: Response) {
  const reviewId = req.params.reviewId?.trim();

  if (!reviewId) {
    return res.status(400).json({ success: false, message: "Review id is required" });
  }

  const parsed = reviewSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid review payload",
      errors: parsed.error.flatten(),
    });
  }

  const existing = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!existing) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: parsed.data,
  });

  return res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: { review },
  });
}

export async function deleteAdminReview(req: { params: { reviewId?: string } }, res: Response) {
  const reviewId = req.params.reviewId?.trim();

  if (!reviewId) {
    return res.status(400).json({ success: false, message: "Review id is required" });
  }

  const existing = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!existing) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  await prisma.review.delete({ where: { id: reviewId } });

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
}

export async function getAdminContactQueries(_req: unknown, res: Response) {
  const [total, queries] = await Promise.all([
    prisma.contactQuery.count(),
    prisma.contactQuery.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      queries,
      total,
      unread: queries.filter((query) => query.status === "NEW").length,
    },
  });
}

export async function markAdminContactQueryAsRead(req: { params: { queryId?: string } }, res: Response) {
  const queryId = req.params.queryId?.trim();

  if (!queryId) {
    return res.status(400).json({ success: false, message: "Query id is required" });
  }

  const existing = await prisma.contactQuery.findUnique({ where: { id: queryId } });

  if (!existing) {
    return res.status(404).json({ success: false, message: "Query not found" });
  }

  const updated = await prisma.contactQuery.update({
    where: { id: queryId },
    data: {
      status: contactQueryReadStatuses.includes(existing.status as (typeof contactQueryReadStatuses)[number]) ? existing.status : "IN_PROGRESS",
    },
  });

  return res.status(200).json({
    success: true,
    message: "Query marked as read successfully",
    data: { query: updated },
  });
}

export async function deleteAdminContactQuery(req: { params: { queryId?: string } }, res: Response) {
  const queryId = req.params.queryId?.trim();

  if (!queryId) {
    return res.status(400).json({ success: false, message: "Query id is required" });
  }

  const existing = await prisma.contactQuery.findUnique({ where: { id: queryId } });

  if (!existing) {
    return res.status(404).json({ success: false, message: "Query not found" });
  }

  await prisma.contactQuery.delete({ where: { id: queryId } });

  return res.status(200).json({
    success: true,
    message: "Query deleted successfully",
  });
}

function readNewArrivalsCutoff(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const cutoffAt = (value as { cutoffAt?: unknown }).cutoffAt;

  return typeof cutoffAt === "string" && cutoffAt.trim().length > 0 ? cutoffAt : null;
}

export async function getNewArrivalsSetting(_req: unknown, res: Response) {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: newArrivalsSettingKey },
  });

  return res.status(200).json({
    success: true,
    data: {
      cutoffAt: readNewArrivalsCutoff(setting?.value) ?? null,
    },
  });
}

export async function updateNewArrivalsSetting(_req: unknown, res: Response) {
  const cutoffAt = new Date().toISOString();

  const setting = await prisma.siteSetting.upsert({
    where: { key: newArrivalsSettingKey },
    create: {
      key: newArrivalsSettingKey,
      value: { cutoffAt },
    },
    update: {
      value: { cutoffAt },
    },
  });

  return res.status(200).json({
    success: true,
    message: "New arrivals cutoff updated successfully",
    data: {
      cutoffAt: readNewArrivalsCutoff(setting.value) ?? cutoffAt,
    },
  });
}
