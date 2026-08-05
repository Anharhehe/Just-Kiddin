"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const DELIVERY_CHARGE = 300;
const PROMO_CODES = ["KIDIN10", "BABY10", "CUTE10", "MINI10", "SMART10", "FAMILY10", "LOVE10", "FIRST10", "SWEET10", "JUNIOR10"];
const orderItemSchema = zod_1.z.object({
    cartItemId: zod_1.z.string().min(1),
    productId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    price: zod_1.z.number().int().positive(),
    image: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().min(1).max(99),
    size: zod_1.z.string().min(1),
    color: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    ageGroup: zod_1.z.enum(["newborn", "toddler"]),
    gender: zod_1.z.enum(["boy", "girl"]),
    inStock: zod_1.z.boolean(),
});
const createOrderSchema = zod_1.z.object({
    customer: zod_1.z.object({
        fullName: zod_1.z.string().trim().min(2, "Full name is required").max(120),
        email: zod_1.z.string().trim().email("Valid email is required").toLowerCase(),
        mobile: zod_1.z.string().trim().min(7, "Mobile number is required").max(20),
        address: zod_1.z.string().trim().min(5, "Address is required").max(250),
        city: zod_1.z.string().trim().min(2, "City is required").max(120),
        postalCode: zod_1.z.string().trim().max(20).optional().or(zod_1.z.literal("")),
        notes: zod_1.z.string().trim().max(500).optional().or(zod_1.z.literal("")),
    }),
    items: zod_1.z.array(orderItemSchema).min(1, "Cart cannot be empty"),
    promoCode: zod_1.z.string().trim().max(20).optional().nullable().or(zod_1.z.literal("")),
});
async function createOrder(req, res) {
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
    if (hasPromo && !PROMO_CODES.includes(promoCode)) {
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
    const orderId = (0, crypto_1.randomUUID)();
    const itemsJson = JSON.stringify(parsed.data.items);
    const [order] = await prisma_1.prisma.$queryRaw `
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
}
