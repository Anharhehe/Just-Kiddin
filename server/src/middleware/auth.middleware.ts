import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : undefined;
  const cookieToken = req.cookies?.jk_access_token as string | undefined;
  const token = bearer ?? cookieToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
      role: "USER" | "ADMIN";
    };

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };

    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
}
