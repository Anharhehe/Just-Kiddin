"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactQuery = createContactQuery;
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const createContactQuerySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Name is required").max(100),
    email: zod_1.z.string().trim().email("Valid email is required").toLowerCase(),
    mobile: zod_1.z.string().trim().min(7, "Mobile number is required").max(20),
    subject: zod_1.z.string().trim().min(2, "Subject is required").max(120),
    message: zod_1.z.string().trim().min(10, "Message is required").max(2000)
});
async function createContactQuery(req, res) {
    const parsed = createContactQuerySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid request body"
        });
    }
    const id = (0, crypto_1.randomUUID)();
    const [contactQuery] = await prisma_1.prisma.$queryRaw `
    INSERT INTO "ContactQuery" ("id", "name", "email", "mobile", "subject", "message", "status", "createdAt", "updatedAt")
    VALUES (${id}, ${parsed.data.name}, ${parsed.data.email}, ${parsed.data.mobile}, ${parsed.data.subject}, ${parsed.data.message}, 'NEW', NOW(), NOW())
    RETURNING "id", "name", "email", "mobile", "subject", "message", "status", "createdAt", "updatedAt"
  `;
    return res.status(201).json({
        success: true,
        message: "Your message has been sent successfully",
        data: contactQuery
    });
}
