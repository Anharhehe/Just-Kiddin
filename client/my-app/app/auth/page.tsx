"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";

type AuthMode = "login" | "signup";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const heading = useMemo(() => {
    return mode === "login" ? "Welcome Back" : "Join Just Kiddin'";
  }, [mode]);

  const subheading = useMemo(() => {
    return mode === "login"
      ? "Log in to pick up right where you left off."
      : "Create an account for faster checkout and order tracking.";
  }, [mode]);

  const submitLabel = mode === "login" ? "Log In" : "Create Account";

  useEffect(() => {
    const googleStatus = new URLSearchParams(window.location.search).get("google");

    if (!googleStatus) {
      return;
    }

    const googleMessages: Record<string, string> = {
      "missing-client-id": "Google sign-in is not configured yet.",
      "invalid-state": "Google sign-in was interrupted. Please try again.",
      "token-exchange-failed": "Google sign-in could not be completed. Please try again.",
      "token-invalid": "Google account verification failed. Please try again.",
      failed: "Google sign-in failed. Please try again.",
    };

    setErrorMessage(googleMessages[googleStatus] ?? "Google sign-in failed. Please try again.");
    setSuccessMessage("");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const payload =
        mode === "login"
          ? { email: email.trim(), password }
          : { fullName: fullName.trim(), email: email.trim(), password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: {
          user?: {
            role?: "USER" | "ADMIN";
          };
        };
      };

      if (!response.ok || !data.success) {
        setErrorMessage(data.message ?? "Authentication failed");
        return;
      }

      setSuccessMessage(data.message ?? "Success");
      setPassword("");

      const role = data.data?.user?.role;
      router.push(role === "ADMIN" ? "/admin" : "/");
    } catch (_error) {
      setErrorMessage("Unable to reach server. Check backend is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleAuth() {
    setGoogleLoading(true);
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  }

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 sm:px-8">
      {/* Full-page hero background */}
      <Image
        src="/hero.png"
        alt="Kids wearing Just Kiddin' clothing"
        fill
        priority
        className="object-cover -z-20"
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,20,30,0.45) 0%, rgba(20,20,30,0.35) 45%, rgba(20,20,30,0.6) 100%)",
        }}
      />

      {/* Centered form card */}
      <div
        className="w-full max-w-md rounded-3xl border p-6 sm:p-8 backdrop-blur-xl"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div className="text-center">

          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "'Quicksand', sans-serif", color: "var(--foreground)" }}
          >
            {heading}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            {subheading}
          </p>
        </div>

          {/* Mode toggle */}
          <div
            className="relative mt-7 grid grid-cols-2 rounded-xl p-1"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            <div
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-out"
              style={{
                background: mode === "login" ? "#E8735F" : "#7FA08D",
                transform: mode === "login" ? "translateX(0)" : "translateX(calc(100% + 8px))",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="relative z-10 h-10 rounded-lg text-sm font-semibold transition-colors"
              style={{ color: mode === "login" ? "#fff" : "var(--foreground)" }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="relative z-10 h-10 rounded-lg text-sm font-semibold transition-colors"
              style={{ color: mode === "signup" ? "#fff" : "var(--foreground)" }}
            >
              Sign Up
            </button>
          </div>

          {/* Google auth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="mt-6 w-full h-11 rounded-xl border text-sm font-semibold inline-flex items-center justify-center gap-2 transition hover:shadow-sm disabled:opacity-70"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
              background: "var(--card-bg)",
            }}
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FcGoogle size={18} />
            )}
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1" style={{ background: "var(--card-border)" }} />
            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
              or
            </span>
            <span className="h-px flex-1" style={{ background: "var(--card-border)" }} />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Full Name
                </span>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required
                    minLength={2}
                    placeholder="John Doe"
                    className="w-full h-11 rounded-xl border pl-9 pr-3 text-sm outline-none transition focus:ring-2"
                    style={{
                      background: "var(--background)",
                      color: "var(--foreground)",
                      borderColor: "var(--card-border)",
                    }}
                  />
                </div>
              </label>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                Email
              </span>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full h-11 rounded-xl border pl-9 pr-3 text-sm outline-none transition focus:ring-2"
                  style={{
                    background: "var(--background)",
                    color: "var(--foreground)",
                    borderColor: "var(--card-border)",
                  }}
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                Password
              </span>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full h-11 rounded-xl border pl-9 pr-9 text-sm outline-none transition focus:ring-2"
                  style={{
                    background: "var(--background)",
                    color: "var(--foreground)",
                    borderColor: "var(--card-border)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {errorMessage ? (
              <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                {errorMessage}
              </p>
            ) : null}

            {successMessage ? (
              <p className="text-sm font-medium" style={{ color: "#10b981" }}>
                {successMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                background: mode === "login" ? "#E8735F" : "#7FA08D",
                color: "#fff",
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : mode === "login" ? (
                <LogIn size={16} />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? "Please wait..." : submitLabel}
              {!loading ? <ArrowRight size={16} className="opacity-70" /> : null}
            </button>
          </form>
        </div>
    </section>
  );
}