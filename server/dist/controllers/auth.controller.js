"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWithEmail = registerWithEmail;
exports.loginWithEmail = loginWithEmail;
exports.loginWithGoogle = loginWithGoogle;
exports.googleCallback = googleCallback;
exports.getCurrentUser = getCurrentUser;
exports.updateCurrentUser = updateCurrentUser;
exports.deleteCurrentUser = deleteCurrentUser;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const env_1 = require("../config/env");
const prisma_1 = require("../lib/prisma");
const registerSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Full name is required").max(100),
    email: zod_1.z.string().trim().email("Valid email is required").toLowerCase(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(128)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("Valid email is required").toLowerCase(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters").max(128)
});
const updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2).max(100).optional(),
    email: zod_1.z.string().trim().email().toLowerCase().optional(),
    currentPassword: zod_1.z.string().min(6).max(128).optional(),
    newPassword: zod_1.z.string().min(6).max(128).optional()
});
const deleteAccountSchema = zod_1.z.object({
    password: zod_1.z.string().min(6).max(128)
});
const ADMIN_EMAIL = "sanan@admin.com";
const ADMIN_PASSWORD = "@Sanan123";
function signAccessToken(payload) {
    const options = { expiresIn: env_1.env.JWT_EXPIRES_IN };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
}
function setAuthCookie(res, token) {
    res.cookie("jk_access_token", token, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7
    });
}
function clearAuthCookie(res) {
    res.clearCookie("jk_access_token", {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === "production",
        sameSite: "lax"
    });
}
async function registerWithEmail(req, res) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid request body"
        });
    }
    const { fullName, email, password } = parsed.data;
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "An account with this email already exists"
        });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await prisma_1.prisma.user.create({
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
async function loginWithEmail(req, res) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid request body"
        });
    }
    const { email, password } = parsed.data;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminPasswordHash = await bcryptjs_1.default.hash(ADMIN_PASSWORD, 12);
        const adminUser = await prisma_1.prisma.user.upsert({
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
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
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
async function loginWithGoogle(_req, res) {
    return res.status(501).json({
        success: false,
        message: "Google auth flow is not implemented yet"
    });
}
async function googleCallback(_req, res) {
    return res.status(501).json({
        success: false,
        message: "Google callback is not implemented yet"
    });
}
async function getCurrentUser(req, res) {
    if (!req.user?.id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = await prisma_1.prisma.user.findUnique({
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
async function updateCurrentUser(req, res) {
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
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
        clearAuthCookie(res);
        return res.status(404).json({ success: false, message: "User not found" });
    }
    if (email && email !== user.email) {
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
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
        const validCurrentPassword = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
        if (!validCurrentPassword) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
    }
    const updated = await prisma_1.prisma.user.update({
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
async function deleteCurrentUser(req, res) {
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
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
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
    const validPassword = await bcryptjs_1.default.compare(parsed.data.password, user.passwordHash);
    if (!validPassword) {
        return res.status(401).json({
            success: false,
            message: "Invalid password"
        });
    }
    await prisma_1.prisma.user.delete({ where: { id: user.id } });
    clearAuthCookie(res);
    return res.status(200).json({
        success: true,
        message: "Account deleted successfully"
    });
}
async function logout(_req, res) {
    clearAuthCookie(res);
    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
}
