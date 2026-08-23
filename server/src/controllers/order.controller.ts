import { randomUUID } from "crypto";
import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";

const DELIVERY_CHARGE = 300;
const PROMO_CODES = ["KIDIN10", "BABY10", "CUTE10", "MINI10", "SMART10", "FAMILY10", "LOVE10", "FIRST10", "SWEET10", "JUNIOR10"] as const;

const orderItemSchema = z.object({
  cartItemId: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().positive(),
  image: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  size: z.string().min(1),
  color: z.string().min(1),
  category: z.string().min(1),
  ageGroup: z.enum(["newborn", "toddler", "accessories"]),
  gender: z.enum(["boy", "girl"]).nullable(),
  inStock: z.boolean(),
});

const createOrderSchema = z.object({
  customer: z.object({
    fullName: z.string().trim().min(2, "Full name is required").max(120),
    email: z.string().trim().email("Valid email is required").toLowerCase(),
    mobile: z.string().trim().min(7, "Mobile number is required").max(20),
    address: z.string().trim().min(5, "Address is required").max(250),
    city: z.string().trim().min(2, "City is required").max(120),
    postalCode: z.string().trim().max(20).optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
  }),
  items: z.array(orderItemSchema).min(1, "Cart cannot be empty"),
  promoCode: z.string().trim().max(20).optional().nullable().or(z.literal("")),
});

export async function createOrder(req: { body: unknown }, res: Response) {
  const parsed = createOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid order payload",
      errors: parsed.error.flatten(),
    });
  }

  const promoCode = (parsed.data.promoCode ?? "").trim().toUpperCase();
  const hasPromo = promoCode.length > 0;

  if (hasPromo && !PROMO_CODES.includes(promoCode as (typeof PROMO_CODES)[number])) {
    return res.status(400).json({
      success: false,
      message: "Invalid promo code",
    });
  }

  const subtotal = parsed.data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (subtotal <= 0) {
    return res.status(400).json({
      success: false,
      message: "Cart total must be greater than zero",
    });
  }

  const discountAmount = hasPromo ? Math.round(subtotal * 0.1) : 0;
  const totalAmount = subtotal - discountAmount + DELIVERY_CHARGE;
  const orderId = randomUUID();
  const itemsJson = JSON.stringify(parsed.data.items);

  const itemsByProduct = parsed.data.items.reduce<Map<string, number>>((groupedItems, item) => {
    groupedItems.set(item.productId, (groupedItems.get(item.productId) ?? 0) + item.quantity);
    return groupedItems;
  }, new Map());

  try {
    const [order] = await prisma.$transaction(async (tx) => {
      for (const [productId, quantity] of itemsByProduct.entries()) {
        const [product] = await tx.$queryRaw<Array<{
          id: string;
          stockQuantity: number;
          name: string;
        }>>`
          SELECT
            "id",
            "stockQuantity",
            "name"
          FROM "Product"
          WHERE "id" = ${productId}
          LIMIT 1
        `;

        if (!product) {
          throw new Error(`Product not found for item ${productId}`);
        }

        if (product.stockQuantity < quantity) {
          throw new Error(`Only ${product.stockQuantity} items left for ${product.name}`);
        }

        const updatedRows = await tx.product.updateMany({
          where: {
            id: productId,
            stockQuantity: {
              gte: quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: quantity,
            },
          },
        });

        if (updatedRows.count !== 1) {
          throw new Error(`Unable to reserve stock for ${product.name}`);
        }
      }

      const [createdOrder] = await tx.$queryRaw<Array<{
      id: string;
      fullName: string;
      email: string;
      mobile: string;
      address: string;
      city: string;
      postalCode: string | null;
      notes: string | null;
      paymentMethod: string;
      promoCode: string | null;
      subtotal: number;
      discountAmount: number;
      deliveryCharge: number;
      totalAmount: number;
      itemsJson: unknown;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      INSERT INTO "CustomerOrder" (
        "id",
        "fullName",
        "email",
        "mobile",
        "address",
        "city",
        "postalCode",
        "notes",
        "paymentMethod",
        "promoCode",
        "subtotal",
        "discountAmount",
        "deliveryCharge",
        "totalAmount",
        "itemsJson",
        "status",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${orderId},
        ${parsed.data.customer.fullName},
        ${parsed.data.customer.email},
        ${parsed.data.customer.mobile},
        ${parsed.data.customer.address},
        ${parsed.data.customer.city},
        ${parsed.data.customer.postalCode || null},
        ${parsed.data.customer.notes || null},
        'COD',
        ${hasPromo ? promoCode : null},
        ${subtotal},
        ${discountAmount},
        ${DELIVERY_CHARGE},
        ${totalAmount},
        ${itemsJson}::jsonb,
        'PENDING',
        NOW(),
        NOW()
      )
      RETURNING
        "id",
        "fullName",
        "email",
        "mobile",
        "address",
        "city",
        "postalCode",
        "notes",
        "paymentMethod",
        "promoCode",
        "subtotal",
        "discountAmount",
        "deliveryCharge",
        "totalAmount",
        "itemsJson",
        "status",
        "createdAt",
        "updatedAt"
      `;

      return [createdOrder];
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: {
        orderId: order.id,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not place order";

    if (/^Only \d+ items left for /.test(message) || message.startsWith("Product not found for item") || message.startsWith("Unable to reserve stock") || message.startsWith("Failed to reserve stock")) {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Could not place order",
    });
  }
}

export async function getMyOrders(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.email) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const orders = await prisma.$queryRaw<Array<{
      id: string;
      fullName: string;
      email: string;
      mobile: string;
      address: string;
      city: string;
      postalCode: string | null;
      notes: string | null;
      paymentMethod: string;
      promoCode: string | null;
      subtotal: number;
      discountAmount: number;
      deliveryCharge: number;
      totalAmount: number;
      itemsJson: unknown;
      status: string;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT
        "id",
        "fullName",
        "email",
        "mobile",
        "address",
        "city",
        "postalCode",
        "notes",
        "paymentMethod",
        "promoCode",
        "subtotal",
        "discountAmount",
        "deliveryCharge",
        "totalAmount",
        "itemsJson",
        "status",
        "createdAt",
        "updatedAt"
      FROM "CustomerOrder"
      WHERE LOWER("email") = LOWER(${req.user.email})
      ORDER BY "createdAt" DESC
    `;

    return res.status(200).json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.id,
          fullName: order.fullName,
          email: order.email,
          mobile: order.mobile,
          address: order.address,
          city: order.city,
          postalCode: order.postalCode,
          notes: order.notes,
          paymentMethod: order.paymentMethod,
          promoCode: order.promoCode,
          subtotal: order.subtotal,
          discountAmount: order.discountAmount,
          deliveryCharge: order.deliveryCharge,
          totalAmount: order.totalAmount,
          status: order.status,
          items: order.itemsJson,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
      },
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load order history",
    });
  }
}

export async function getOrderById(req: { params: { orderId?: string } }, res: Response) {
  const orderId = req.params.orderId?.trim();

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "Order id is required",
    });
  }

  try {
    const [order] = await prisma.$queryRaw<Array<{
      id: string;
      status: string;
      fullName: string;
      email: string;
      createdAt: Date;
    }>>`
      SELECT
        "id",
        "status",
        "fullName",
        "email",
        "createdAt"
      FROM "CustomerOrder"
      WHERE LOWER("id") = LOWER(${orderId})
         OR UPPER(SPLIT_PART("id", '-', 1)) = UPPER(${orderId})
      LIMIT 1
    `;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const normalizedStatus = order.status.trim().toUpperCase();
    let statusMessage = "";

    if (normalizedStatus === "PENDING") {
      statusMessage = "Your order is pending and will be confirmed by a phone call.";
    } else if (normalizedStatus === "DISPATCHED" || normalizedStatus === "SHIPPED") {
      statusMessage = "Your order has been dispatched and you will receive it within 2 working days.";
    } else if (normalizedStatus === "COMPLETE" || normalizedStatus === "DELIVERED") {
      statusMessage = "Your order has been received.";
    } else {
      statusMessage = `Your order status is ${order.status.toLowerCase()}.`;
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        status: order.status,
        message: statusMessage,
      },
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to track order",
    });
  }
}