import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(128)
});

const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").max(128)
});

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  currentPassword: z.string().min(6).max(128).optional(),
  newPassword: z.string().min(6).max(128).optional()
});

const deleteAccountSchema = z.object({
  password: z.string().min(6).max(128)
});

type AuthJwtPayload = {
  sub: string;
  email: string;
  role: "USER" | "ADMIN";
};

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenInfoResponse = {
  aud?: string;
  email?: string;
  email_verified?: string;
  sub?: string;
  name?: string;
  picture?: string;
};

const ADMIN_EMAIL = "sanan@admin.com";
const ADMIN_PASSWORD = "@Sanan123";
const GOOGLE_STATE_COOKIE = "jk_google_oauth_state";
const GOOGLE_VERIFIER_COOKIE = "jk_google_code_verifier";

function getFrontendOrigin() {
  return env.CORS_ORIGIN.replace(/\/$/, "");
}

function getGoogleRedirectUri(req: Request) {
  return `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
}

function setTempOAuthCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 10,
    path: "/"
  });
}

function clearTempOAuthCookie(res: Response, name: string) {
  res.clearCookie(name, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

function signAccessToken(payload: AuthJwtPayload) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

function setAuthCookie(res: Response, token: string) {
  res.cookie("jk_access_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

function clearAuthCookie(res: Response) {
  res.clearCookie("jk_access_token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax"
  });
}

export async function registerWithEmail(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid request body"
    });
  }

  const { fullName, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists"
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      authProvider: "EMAIL"
    }
  });

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  setAuthCookie(res, token);

  return res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        authProvider: user.authProvider
      },
      accessToken: token
    }
  });
}

export async function loginWithEmail(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid request body"
    });
  }

  const { email, password } = parsed.data;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const adminUser = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        fullName: "Sanan Admin",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        authProvider: "EMAIL"
      },
      create: {
        fullName: "Sanan Admin",
        email: ADMIN_EMAIL,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        authProvider: "EMAIL"
      }
    });

    const adminToken = signAccessToken({
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });
    setAuthCookie(res, adminToken);

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      data: {
        user: {
          id: adminUser.id,
          email: adminUser.email,
          fullName: adminUser.fullName,
          role: adminUser.role,
          authProvider: adminUser.authProvider
        },
        accessToken: adminToken
      }
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  setAuthCookie(res, token);

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        authProvider: user.authProvider
      },
      accessToken: token
    }
  });
}

export async function loginWithGoogle(_req: Request, res: Response) {
  if (!env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({
      success: false,
      message: "GOOGLE_CLIENT_ID is required to use Google sign-in"
    });
  }

  const state = randomBytes(24).toString("base64url");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  const redirectUri = getGoogleRedirectUri(_req);

  setTempOAuthCookie(res, GOOGLE_STATE_COOKIE, state);
  setTempOAuthCookie(res, GOOGLE_VERIFIER_COOKIE, codeVerifier);

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("state", state);
  googleAuthUrl.searchParams.set("code_challenge", codeChallenge);
  googleAuthUrl.searchParams.set("code_challenge_method", "S256");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return res.redirect(302, googleAuthUrl.toString());
}

export async function googleCallback(req: Request, res: Response) {
  const code = typeof req.query.code === "string" ? req.query.code.trim() : "";
  const state = typeof req.query.state === "string" ? req.query.state.trim() : "";
  const storedState = typeof req.cookies?.[GOOGLE_STATE_COOKIE] === "string" ? req.cookies[GOOGLE_STATE_COOKIE] : "";
  const codeVerifier = typeof req.cookies?.[GOOGLE_VERIFIER_COOKIE] === "string" ? req.cookies[GOOGLE_VERIFIER_COOKIE] : "";

  clearTempOAuthCookie(res, GOOGLE_STATE_COOKIE);
  clearTempOAuthCookie(res, GOOGLE_VERIFIER_COOKIE);

  if (!env.GOOGLE_CLIENT_ID) {
    return res.redirect(`${getFrontendOrigin()}/auth?google=missing-client-id`);
  }

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return res.redirect(`${getFrontendOrigin()}/auth?google=invalid-state`);
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        ...(env.GOOGLE_CLIENT_SECRET ? { client_secret: env.GOOGLE_CLIENT_SECRET } : {}),
        code,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
        redirect_uri: getGoogleRedirectUri(req)
      })
    });

    const tokenPayload = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenPayload.id_token) {
      return res.redirect(`${getFrontendOrigin()}/auth?google=token-exchange-failed`);
    }

    const tokenInfoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenPayload.id_token)}`);
    const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfoResponse;

    if (!tokenInfoResponse.ok || tokenInfo.aud !== env.GOOGLE_CLIENT_ID || tokenInfo.email_verified !== "true" || !tokenInfo.email || !tokenInfo.sub) {
      return res.redirect(`${getFrontendOrigin()}/auth?google=token-invalid`);
    }

    const email = tokenInfo.email.toLowerCase();
    const googleId = tokenInfo.sub;
    const fullName = tokenInfo.name?.trim() || email.split("@")[0] || "Google User";

    const existingByGoogleId = await prisma.user.findUnique({ where: { googleId } });
    const existingByEmail = existingByGoogleId ? null : await prisma.user.findUnique({ where: { email } });

    const user = existingByGoogleId
      ? await prisma.user.update({
          where: { id: existingByGoogleId.id },
          data: {
            fullName: existingByGoogleId.fullName ?? fullName,
            email,
            googleId,
            authProvider: "GOOGLE"
          }
        })
      : existingByEmail
        ? await prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
              fullName: existingByEmail.fullName ?? fullName,
              googleId,
              authProvider: "GOOGLE"
            }
          })
        : await prisma.user.create({
            data: {
              fullName,
              email,
              googleId,
              authProvider: "GOOGLE"
            }
          });

    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.redirect(`${getFrontendOrigin()}${user.role === "ADMIN" ? "/admin" : "/"}`);
  } catch (_error) {
    return res.redirect(`${getFrontendOrigin()}/auth?google=failed`);
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      authProvider: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    clearAuthCookie(res);
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    data: { user }
  });
}

export async function updateCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid request body"
    });
  }

  const { fullName, email, currentPassword, newPassword } = parsed.data;

  if (newPassword && !currentPassword) {
    return res.status(400).json({
      success: false,
      message: "Current password is required to set a new password"
    });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    clearAuthCookie(res);
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== user.id) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use"
      });
    }
  }

  let passwordHash = user.passwordHash;
  if (newPassword) {
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "This account cannot change password with email flow"
      });
    }

    const validCurrentPassword = await bcrypt.compare(currentPassword as string, user.passwordHash);
    if (!validCurrentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    passwordHash = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: fullName ?? user.fullName,
      email: email ?? user.email,
      passwordHash
    }
  });

  const refreshedToken = signAccessToken({
    sub: updated.id,
    email: updated.email,
    role: updated.role
  });
  setAuthCookie(res, refreshedToken);

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
        authProvider: updated.authProvider
      }
    }
  });
}

export async function deleteCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const parsed = deleteAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid request body"
    });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    clearAuthCookie(res);
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!user.passwordHash) {
    return res.status(400).json({
      success: false,
      message: "Password confirmation is not available for this account"
    });
  }

  const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid password"
    });
  }

  await prisma.user.delete({ where: { id: user.id } });
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    message: "Account deleted successfully"
  });
}

export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
}
