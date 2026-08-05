"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavourites = getFavourites;
exports.addFavourite = addFavourite;
exports.removeFavourite = removeFavourite;
exports.checkFavourite = checkFavourite;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const addSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    price: zod_1.z.number().int().positive(),
    image: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    ageGroup: zod_1.z.string().min(1),
    gender: zod_1.z.string().min(1),
});
async function getFavourites(req, res) {
    const userId = req.user.id;
    const items = await prisma_1.prisma.favourite.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: items });
}
async function addFavourite(req, res) {
    const userId = req.user.id;
    const body = addSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ success: false, message: "Invalid body", errors: body.error.flatten() });
    }
    const item = await prisma_1.prisma.favourite.upsert({
        where: { userId_productId: { userId, productId: body.data.productId } },
        update: {},
        create: { userId, ...body.data },
    });
    res.status(201).json({ success: true, data: item });
}
async function removeFavourite(req, res) {
    const userId = req.user.id;
    const productId = req.params.productId;
    await prisma_1.prisma.favourite.deleteMany({ where: { userId, productId } });
    res.json({ success: true });
}
async function checkFavourite(req, res) {
    const userId = req.user.id;
    const productId = req.params.productId;
    const item = await prisma_1.prisma.favourite.findUnique({
        where: { userId_productId: { userId, productId } },
    });
    res.json({ success: true, favourited: item !== null });
}
