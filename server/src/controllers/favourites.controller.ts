import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const addSchema = z.object({
  productId: z.string().min(1),
  name:      z.string().min(1),
  price:     z.number().int().positive(),
  image:     z.string().min(1),
  category:  z.string().min(1),
  ageGroup:  z.string().min(1),
  gender:    z.string().min(1),
});

export async function getFavourites(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const items = await prisma.favourite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: items });
}

export async function addFavourite(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.id;
  const body = addSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ success: false, message: "Invalid body", errors: body.error.flatten() });
  }

  const item = await prisma.favourite.upsert({
    where:  { userId_productId: { userId, productId: body.data.productId } },
    update: {},
    create: { userId, ...body.data },
  });
  res.status(201).json({ success: true, data: item });
}

export async function removeFavourite(req: AuthenticatedRequest, res: Response) {
  const userId    = req.user!.id;
  const productId = req.params.productId;
  await prisma.favourite.deleteMany({ where: { userId, productId } });
  res.json({ success: true });
}

export async function checkFavourite(req: AuthenticatedRequest, res: Response) {
  const userId    = req.user!.id;
  const productId = req.params.productId;
  const item = await prisma.favourite.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  res.json({ success: true, favourited: item !== null });
}
