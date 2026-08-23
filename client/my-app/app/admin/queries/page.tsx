"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCheck, Loader2, Search, Trash2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const FONT_HEADING = "'Quicksand', sans-serif";

type QueryItem = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
};

type QueryResponse = {
  data?: {
    queries?: QueryItem[];
    total?: number;
    unread?: number;
  };
};

type MeResponse = {
  data?: {
    user?: {
      role?: "USER" | "ADMIN";
      fullName?: string | null;
    };
  };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function QueryBadge({ status }: { status: QueryItem["status"] }) {
  const tone = status === "NEW" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{status === "NEW" ? "Unread" : "Read"}</span>;
}

export default function AdminQueriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const filteredQueries = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return queries;
    }

    return queries.filter((item) =>
      [item.name, item.email, item.mobile, item.subject, item.message, item.status].join(" ").toLowerCase().includes(query)
    );
  }, [queries, search]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function apiFetch(path: string, init?: RequestInit) {
    return fetch(`${API_BASE_URL}/api${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  }

  async function loadQueries() {
    setLoading(true);

    try {
      const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!meResponse.ok) {
        router.replace("/auth");
        return;
      }

      const mePayload = (await meResponse.json()) as MeResponse;
      if (mePayload.data?.user?.role !== "ADMIN") {
        router.replace("/");
        return;
      }

      const response = await apiFetch("/admin/queries");
      if (!response.ok) {
        throw new Error("Failed to load queries");
      }

      const payload = (await response.json()) as QueryResponse;
      setQueries(payload.data?.queries ?? []);
      setTotal(payload.data?.total ?? 0);
      setUnread(payload.data?.unread ?? 0);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to load queries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQueries();
  }, []);

  async function markAsRead(queryId: string) {
    setSavingId(queryId);
    try {
      const response = await apiFetch(`/admin/queries/${queryId}/read`, { method: "PATCH" });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to mark query as read");
      }

      setNotice("Query marked as read successfully");
      await loadQueries();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to mark query as read");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteQuery(queryId: string) {
    if (!window.confirm("Delete this query?")) {
      return;
    }

    setSavingId(queryId);
    try {
      const response = await apiFetch(`/admin/queries/${queryId}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Failed to delete query");
      }

      setNotice("Query deleted successfully");
      await loadQueries();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Failed to delete query");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" style={{ fontFamily: FONT_HEADING }}>
      <section className="overflow-hidden rounded-[32px] border border-black/5 bg-[linear-gradient(135deg,rgba(255,249,240,0.96),rgba(255,255,255,0.94),rgba(242,249,255,0.96))] shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
        <div className="border-b border-black/5 px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <button type="button" onClick={() => router.push("/admin")} className="inline-flex items-center gap-2 text-sm font-semibold text-[#8b5a2b] hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to admin
              </button>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#8b5a2b]">Query Management</p>
              <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)] sm:text-4xl">Contact queries from the website</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">Review customer questions, mark them as read, or remove them once handled.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Total" value={total} />
              <StatCard label="Unread" value={unread} />
              <StatCard label="Shown" value={filteredQueries.length} />
            </div>
          </div>
        </div>

        {notice ? (
          <div className="mx-5 mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 sm:mx-8">
            {notice}
          </div>
        ) : null}

        <div className="px-5 py-6 sm:px-8">
          <div className="mb-4 flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-3">
            <Search className="h-4 w-4 text-[var(--muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, subject or message"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
            />
          </div>

          {loading ? (
            <div className="flex items-center gap-3 rounded-3xl border border-black/5 bg-white px-5 py-8 text-sm text-[var(--muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading queries...
            </div>
          ) : filteredQueries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/10 bg-white px-5 py-12 text-center text-sm text-[var(--muted)]">
              No queries found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueries.map((query) => (
                <article key={query.id} className={`rounded-3xl border p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] ${query.status === "NEW" ? "border-rose-200 bg-[#fffaf9]" : "border-black/5 bg-white"}`}>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-[var(--foreground)]">{query.name}</p>
                        <QueryBadge status={query.status} />
                      </div>
                      <div className="grid gap-2 text-sm text-[var(--muted)] sm:grid-cols-2 xl:grid-cols-4">
                        <p><span className="font-semibold text-[var(--foreground)]">Email:</span> {query.email}</p>
                        <p><span className="font-semibold text-[var(--foreground)]">Mobile:</span> {query.mobile}</p>
                        <p><span className="font-semibold text-[var(--foreground)]">Subject:</span> {query.subject}</p>
                        <p><span className="font-semibold text-[var(--foreground)]">Sent:</span> {formatDate(query.createdAt)}</p>
                      </div>
                      <p className="rounded-2xl border border-black/5 bg-[#fffaf2] p-4 text-sm leading-7 text-[var(--foreground)]">{query.message}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => markAsRead(query.id)}
                        disabled={savingId === query.id || query.status !== "NEW"}
                        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingId === query.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                        Mark as read
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteQuery(query.id)}
                        disabled={savingId === query.id}
                        className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#fecaca] bg-[#fff5f5] px-4 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#ffecec] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/85 p-4 backdrop-blur-sm">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
