"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Users, ShoppingCart, DollarSign, Activity, AlertTriangle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type MeResponse = {
	data?: {
		user?: {
			fullName?: string | null;
			email?: string;
			role?: "USER" | "ADMIN";
		};
	};
};

export default function AdminPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [adminName, setAdminName] = useState("Admin");

	useEffect(() => {
		let cancelled = false;

		async function verifyAdmin() {
			try {
				const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
					method: "GET",
					credentials: "include"
				});

				if (!response.ok) {
					router.replace("/auth");
					return;
				}

				const payload = (await response.json()) as MeResponse;
				const role = payload.data?.user?.role;

				if (role !== "ADMIN") {
					router.replace("/");
					return;
				}

				if (!cancelled) {
					setAdminName(payload.data?.user?.fullName || "Admin");
				}
			} catch (_error) {
				router.replace("/auth");
				return;
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void verifyAdmin();

		return () => {
			cancelled = true;
		};
	}, [router]);

	if (loading) {
		return (
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
				<p style={{ color: "var(--muted)" }}>Loading admin dashboard...</p>
			</section>
		);
	}

	const statCards = [
		{ label: "Total Orders", value: "124", icon: ShoppingCart, accent: "var(--primary)" },
		{ label: "Active Customers", value: "87", icon: Users, accent: "#5cb5ec" },
		{ label: "Products", value: "56", icon: Package, accent: "#7FCF3E" },
		{ label: "Revenue", value: "$2,480", icon: DollarSign, accent: "#f59e0b" }
	];

	return (
		<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
			<div
				className="rounded-3xl border p-6 sm:p-8"
				style={{
					background: "var(--card-bg)",
					borderColor: "var(--card-border)",
					boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
				}}
			>
				<h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Quicksand', sans-serif", color: "var(--foreground)" }}>
					Admin Dashboard
				</h1>
				<p className="mt-2 text-sm sm:text-base" style={{ color: "var(--muted)" }}>
					Welcome, {adminName}. This is a demo dashboard for management features.
				</p>
			</div>

			<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
				{statCards.map((card) => {
					const Icon = card.icon;
					return (
						<article
							key={card.label}
							className="rounded-2xl border p-5"
							style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
						>
							<div className="flex items-center justify-between">
								<p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
									{card.label}
								</p>
								<span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${card.accent}1A` }}>
									<Icon size={18} style={{ color: card.accent }} />
								</span>
							</div>
							<p className="mt-4 text-3xl font-bold" style={{ color: "var(--foreground)" }}>
								{card.value}
							</p>
						</article>
					);
				})}
			</div>

			<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
				<section className="rounded-2xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
					<div className="flex items-center gap-2">
						<Activity size={18} style={{ color: "#5cb5ec" }} />
						<h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
							Recent Activity
						</h2>
					</div>
					<ul className="mt-4 space-y-3 text-sm" style={{ color: "var(--muted)" }}>
						<li>New order #1024 placed by Ayesha.</li>
						<li>Inventory alert for Toddler Denim Overalls.</li>
						<li>Coupon KIDS10 applied 14 times today.</li>
						<li>Two product reviews pending moderation.</li>
					</ul>
				</section>

				<section className="rounded-2xl border p-5" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
					<div className="flex items-center gap-2">
						<AlertTriangle size={18} style={{ color: "#f59e0b" }} />
						<h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
							Quick Actions
						</h2>
					</div>
					<div className="mt-4 flex flex-wrap gap-2">
						<button className="h-10 px-4 rounded-xl text-sm font-semibold" style={{ background: "var(--primary)", color: "#fff" }}>
							Add Product
						</button>
						<button className="h-10 px-4 rounded-xl text-sm font-semibold" style={{ background: "#5cb5ec", color: "#fff" }}>
							Manage Orders
						</button>
						<button className="h-10 px-4 rounded-xl text-sm font-semibold" style={{ background: "#7FCF3E", color: "#fff" }}>
							User Reports
						</button>
					</div>
				</section>
			</div>
		</section>
	);
}
