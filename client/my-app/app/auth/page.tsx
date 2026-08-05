"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, LogIn, UserPlus } from "lucide-react";

type AuthMode = "login" | "signup";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const heading = useMemo(() => {
    return mode === "login" ? "Welcome Back" : "Create Account";
  }, [mode]);

  const submitLabel = mode === "login" ? "Login" : "Sign Up";

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
        body: JSON.stringify(payload)
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

  return (
    <section
      className="min-h-[calc(100vh-10rem)] w-full flex items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, rgba(243,88,122,0.2), transparent 35%), radial-gradient(circle at 85% 20%, rgba(92,181,236,0.2), transparent 40%), var(--background)",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-6 sm:p-8"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--card-border)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
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
            {mode === "login"
              ? "Log in to continue shopping at Just Kidin'."
              : "Sign up and start exploring cute kids styles."}
          </p>
        </div>

        <div
          className="mt-6 grid grid-cols-2 rounded-xl p-1"
          style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="h-10 rounded-lg text-sm font-semibold transition"
            style={{
              background: mode === "login" ? "var(--primary)" : "transparent",
              color: mode === "login" ? "#fff" : "var(--foreground)",
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            className="h-10 rounded-lg text-sm font-semibold transition"
            style={{
              background: mode === "signup" ? "#5cb5ec" : "transparent",
              color: mode === "signup" ? "#fff" : "var(--foreground)",
            }}
          >
            Sign Up
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
                  className="w-full h-11 rounded-xl border pl-9 pr-3 text-sm"
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
                className="w-full h-11 rounded-xl border pl-9 pr-3 text-sm"
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
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full h-11 rounded-xl border pl-9 pr-3 text-sm"
                style={{
                  background: "var(--background)",
                  color: "var(--foreground)",
                  borderColor: "var(--card-border)",
                }}
              />
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
            className="w-full h-11 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
            style={{
              background: mode === "login" ? "var(--primary)" : "#5cb5ec",
              color: "#fff",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? "Please wait..." : submitLabel}
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full h-11 rounded-xl border text-sm font-semibold"
          style={{
            borderColor: "var(--card-border)",
            color: "var(--foreground)",
            background: "var(--background)",
          }}
          onClick={() => {
            window.location.href = `${API_BASE_URL}/api/auth/google`;
          }}
        >
          Continue with Google
        </button>
      </div>
    </section>
  );
}
