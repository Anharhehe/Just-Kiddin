import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createContactQuerySchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  mobile: z.string().trim().min(7, "Mobile number is required").max(20),
  subject: z.string().trim().min(2, "Subject is required").max(120),
  message: z.string().trim().min(10, "Message is required").max(2000)
});

export async function createContactQuery(req: Request, res: Response) {
  const parsed = createContactQuerySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid request body"
    });
  }

  const id = randomUUID();

  const [contactQuery] = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    email: string;
    mobile: string;
    subject: string;
    message: string;
    status: "NEW" | "IN_PROGRESS" | "RESOLVED";
    createdAt: Date;
    updatedAt: Date;
  }>>`
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
