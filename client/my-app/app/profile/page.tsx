"use client";

import { FormEvent, useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarClock,
  Crown,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const FONT_BODY = "'Quicksand', sans-serif";

type CurrentUser = {
  id: string;
  fullName: string | null;
  email: string;
  role: "USER" | "ADMIN";
  authProvider: "EMAIL" | "GOOGLE";
};

type OrderRecord = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  postalCode: string | null;
  notes: string | null;
  paymentMethod: string;
  promoCode: string | null;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  status: string;
  items: unknown;
  createdAt: string;
  updatedAt: string;
};

function formatCurrency(amount: number) {
  return `PKR ${amount.toLocaleString()}`;
}

function statusTone(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "CONFIRMED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "SHIPPED":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "DELIVERED":
      return "bg-green-100 text-green-700 border-green-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

function ProfileField({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6F5D]" />
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-xl border border-[#e3dccb] bg-white pl-10 pr-3 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#ff7d6b]"
        />
      </div>
    </label>
  );
}

function PasswordField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6F5D]" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-xl border border-[#e3dccb] bg-white pl-10 pr-12 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#ff7d6b]"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#7A6F5D] transition-colors hover:bg-[#f8f5ef] hover:text-[#0F2540]"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

function ActionButton({
  type = "button",
  onClick,
  children,
  tone = "primary",
  disabled = false,
}: {
  type?: "button" | "submit";
  onClick?: () => void;
  children: React.ReactNode;
  tone?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const toneClass =
    tone === "primary"
      ? "bg-[#ff7d6b] text-white"
      : tone === "danger"
        ? "bg-rose-600 text-white"
        : "bg-[#0F2540] text-white";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 ${toneClass}`}
    >
      {children}
    </button>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e3dccb] bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#f8f5ef] p-2 text-[#7A6F5D]">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">{label}</span>
      </div>
      <span className="max-w-[55%] truncate text-sm text-[#0F2540]">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/auth");
          return;
        }

        const data = (await response.json()) as { data?: { user?: CurrentUser } };
        const currentUser = data.data?.user;

        if (!currentUser) {
          router.replace("/auth");
          return;
        }

        if (!cancelled) {
          setUser(currentUser);
          setFullName(currentUser.fullName ?? "");
          setEmail(currentUser.email);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load your profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchOrders() {
      setOrdersLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { data?: { orders?: OrderRecord[] } };
        const fetchedOrders = Array.isArray(data.data?.orders) ? data.data.orders : [];

        if (!cancelled) {
          setOrders(fetchedOrders);
        }
      } catch {
        if (!cancelled) {
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    }

    void fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    const body: {
      fullName?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    } = {
      fullName: fullName.trim(),
      email: email.trim(),
    };

    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { user?: CurrentUser };
      };

      if (!response.ok || !data.success) {
        setError(data.message ?? "Profile update failed");
        return;
      }

      const updatedUser = data.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        setFullName(updatedUser.fullName ?? "");
        setEmail(updatedUser.email);
      }

      setCurrentPassword("");
      setNewPassword("");
      setMessage(data.message ?? "Profile updated");
    } catch {
      setError("Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setMessage("");
    setError("");

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      router.push("/auth");
    } catch {
      setError("Failed to logout");
    }
  }

  async function handleDeleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        setError(data.message ?? "Delete failed");
        return;
      }

      router.push("/auth");
    } catch {
      setError("Failed to delete account");
    }
  }

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#0000] px-4 py-12 text-[#0F2540] sm:px-6 lg:px-8" style={{ fontFamily: FONT_BODY }}>
        <div className="mx-auto flex max-w-7xl items-center justify-center rounded-[2rem] border border-[#e3dccb] bg-white py-20 shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
          <p className="text-sm text-[#7A6F5D]">Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0000] px-4 py-10 text-[#0F2540] sm:px-6 lg:px-8 lg:py-14" style={{ fontFamily: FONT_BODY }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold sm:text-5xl">
            My Profile
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7A6F5D] sm:text-base">
            Manage your account details, password, and order history from one place.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.08)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#3a988a]/10 p-3 text-[#3a988a]">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b7f6c]">Account</p>
                <h2 className="text-2xl font-bold">
                  Current Details
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-[#2f2a22]">
              <InfoRow icon={User} label="User ID" value={user?.id ?? "-"} />
              <InfoRow icon={Mail} label="Email" value={user?.email ?? "-"} />
              <InfoRow icon={Crown} label="Role" value={user?.role ?? "-"} />
              <InfoRow icon={ShieldCheck} label="Provider" value={user?.authProvider ?? "-"} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <ActionButton tone="secondary" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </ActionButton>
            </div>

            <form onSubmit={handleDeleteAccount} className="mt-6 border-t border-[#e3dccb] pt-6">
              <PasswordField icon={Trash2} label="Confirm Password to Delete Account" value={deletePassword} onChange={setDeletePassword} placeholder="Enter password to delete" required />
              <div className="mt-4">
                <ActionButton type="submit">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </ActionButton>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.08)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#ff7d6b]/10 p-3 text-[#ff7d6b]">
                <Edit3 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b7f6c]">Profile</p>
                <h2 className="text-2xl font-bold">
                  Edit Details
                </h2>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
              <ProfileField icon={User} label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
              <ProfileField icon={Mail} label="Email" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
              <PasswordField icon={LockKeyhole} label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="Required only when changing password" />
              <ProfileField icon={ShieldCheck} label="New Password" value={newPassword} onChange={setNewPassword} type="password" placeholder="Leave empty if not changing" />

              <div className="flex flex-wrap gap-3 pt-2">
                <ActionButton type="submit" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </ActionButton>
              </div>
            </form>
          </section>

          <section className="rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.08)] sm:p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#ff7d6b]/10 p-3 text-[#ff7d6b]">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8b7f6c]">Orders</p>
                <h2 className="text-2xl font-bold">
                  Order History
                </h2>
              </div>
            </div>

            <p className="mt-2 text-sm text-[#7A6F5D]">
              Your saved orders are displayed here.
            </p>

            <div className="mt-5 space-y-4">
              {ordersLoading ? (
                <div className="rounded-2xl border border-[#e3dccb] bg-white p-5 text-sm text-[#7A6F5D] shadow-sm">
                  Loading orders...
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => {
                  const itemsList = Array.isArray(order.items) ? order.items : [];

                  return (
                    <article key={order.id} className="rounded-[1.5rem] border border-[#e3dccb] bg-white p-5 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-[#0F2540]">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusTone(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="flex items-center gap-2 text-sm text-[#7A6F5D]">
                            <CalendarClock className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                          <p className="flex items-center gap-2 text-sm text-[#7A6F5D]">
                            <MapPin className="h-4 w-4" />
                            {order.address}, {order.city}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#f8f5ef] px-4 py-3 text-right">
                          <p className="text-xs uppercase tracking-[0.16em] text-[#7FA08D]">Total</p>
                          <p className="mt-1 text-lg font-bold text-[#0F2540]">
                            {formatCurrency(order.totalAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-[#2f2a22] sm:grid-cols-2">
                        <InfoRow icon={User} label="Customer" value={order.fullName} />
                        <InfoRow icon={Mail} label="Email" value={order.email} />
                        <InfoRow icon={ShoppingBag} label="Items" value={`${itemsList.length} item(s)`} />
                        <InfoRow icon={BadgeCheck} label="Promo" value={order.promoCode ?? "No promo code"} />
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-[#2f2a22] sm:grid-cols-2">
                        <InfoRow icon={CalendarClock} label="Payment" value={order.paymentMethod} />
                        <InfoRow icon={MapPin} label="Delivery" value={formatCurrency(order.deliveryCharge)} />
                      </div>

                      <div className="mt-4 rounded-2xl border border-[#e3dccb] bg-[#fcfbf7] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">
                          Products Ordered
                        </p>
                        <div className="mt-3 space-y-2">
                          {itemsList.length > 0 ? (
                            itemsList.map((item, index) => {
                              const typedItem = item as {
                                cartItemId?: string;
                                productId?: string;
                                name?: string;
                                quantity?: number;
                                size?: string;
                                color?: string;
                              };
                              const itemKey = typedItem.cartItemId ?? typedItem.productId ?? `${index}`;

                              return (
                                <div
                                  key={`${order.id}-${itemKey}-${index}`}
                                  className="flex flex-col gap-1 rounded-xl bg-white px-4 py-3 text-sm text-[#0F2540] shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <div>
                                    <p className="font-semibold">{typedItem.name ?? `Item ${index + 1}`}</p>
                                    <p className="text-xs text-[#7A6F5D]">
                                      {typedItem.size ? `Size: ${typedItem.size}` : "Size: -"}
                                      {typedItem.color ? ` · Color: ${typedItem.color}` : ""}
                                    </p>
                                  </div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7FA08D]">
                                    Qty {typedItem.quantity ?? 1}
                                  </p>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-sm text-[#7A6F5D]">No item details available.</p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-[#e3dccb] bg-white p-6 text-center shadow-sm">
                  <ShoppingBag className="mx-auto h-10 w-10 text-[#ff7d6b]" />
                  <p className="mt-3 text-sm font-medium text-[#0F2540]">
                    No orders yet
                  </p>
                  <p className="mt-1 text-sm text-[#7A6F5D]">
                    Once you place an order, it will appear here with its live status.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {message ? <p className="mt-6 text-sm font-medium text-emerald-600">{message}</p> : null}
        {error ? <p className="mt-2 text-sm font-medium text-rose-600">{error}</p> : null}
      </div>
    </main>
  );
}