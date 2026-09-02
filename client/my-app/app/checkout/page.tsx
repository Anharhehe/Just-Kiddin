"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	ArrowRight,
	CheckCircle2,
	CreditCard,
	MapPin,
	Mail,
	Phone,
	User,
	Home,
	MessageSquare,
	BadgePercent,
	Loader2,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { getProductImage } from "../utils/product-image";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/maewplde";
const DELIVERY_CHARGE = 300;
const FREE_DELIVERY_THRESHOLD = 3000;
const FONT_HEADING = "'Quicksand', sans-serif";

const PROMO_CODES = ["KIDIN10", "BABY10", "CUTE10", "MINI10", "SMART10", "FAMILY10", "LOVE10", "FIRST10", "SWEET10", "JUNIOR10"];

function formatCurrency(amount: number) {
	return `PKR ${amount.toLocaleString()}`;
}

type ProductCard = {
	id: string;
	name: string;
	price: number;
	image: string | string[];
	images?: { url: string }[];
	inStock: boolean;
	ageGroup?: string;
};

type FormState = {
	fullName: string;
	email: string;
	mobile: string;
	address: string;
	city: string;
	postalCode: string;
	notes: string;
};

function Field({
	icon: Icon,
	label,
	name,
	value,
	onChange,
	placeholder,
	required = false,
	type = "text",
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	name: keyof FormState;
	value: string;
	onChange: (name: keyof FormState, value: string) => void;
	placeholder: string;
	required?: boolean;
	type?: string;
}) {
	return (
		<label className="block">
			<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">{label}</span>
			<div className="relative">
				<Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6F5D]" />
				<input
					type={type}
					name={name}
					value={value}
					onChange={(event) => onChange(name, event.target.value)}
					placeholder={placeholder}
					required={required}
					className="h-11 w-full rounded-xl border border-[#e3dccb] bg-white pl-10 pr-3 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#ff7d6b]"
				/>
			</div>
		</label>
	);
}

export default function CheckoutPage() {
	const router = useRouter();
	const { items, subtotal, clearCart, hydrated } = useCart();
	const [form, setForm] = useState<FormState>({
		fullName: "",
		email: "",
		mobile: "",
		address: "",
		city: "",
		postalCode: "",
		notes: "",
	});
	const [promoInput, setPromoInput] = useState("");
	const [appliedPromo, setAppliedPromo] = useState("");
	const [promoMessage, setPromoMessage] = useState("");
	const [promoError, setPromoError] = useState("");
	const [placingOrder, setPlacingOrder] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [accessoryProducts, setAccessoryProducts] = useState<ProductCard[]>([]);
	const [loadingAccessories, setLoadingAccessories] = useState(false);

	const discountAmount = useMemo(() => {
		if (!appliedPromo) return 0;
		return Math.round(subtotal * 0.1);
	}, [appliedPromo, subtotal]);

	const orderAmount = subtotal - discountAmount;
	const deliveryCharge = orderAmount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
	const totalAmount = orderAmount + deliveryCharge;
	const deliveryMessage =
		deliveryCharge === 0
			? "Yahoo, you got free delivery!"
			: `Add necessary accessories to get free delivery over ${formatCurrency(FREE_DELIVERY_THRESHOLD)}.`;

	useEffect(() => {
		let cancelled = false;

		async function loadAccessories() {
			setLoadingAccessories(true);

			try {
				const response = await fetch(`/api/products?ageGroup=accessories&active=true`);
				if (!response.ok) {
					return;
				}

				const payload = (await response.json()) as { data?: { products?: ProductCard[] } };
				if (!cancelled) {
					const products = payload.data?.products ?? [];
					// The API route doesn't actually filter by ageGroup server-side,
					// so we filter client-side. The stored/returned value is the
					// lowercase enum value "accessories" (Supabase's table editor
					// just displays it in caps for readability).
					setAccessoryProducts(products.filter((product) => product.ageGroup === "accessories"));
				}
			} finally {
				if (!cancelled) {
					setLoadingAccessories(false);
				}
			}
		}

		void loadAccessories();

		return () => {
			cancelled = true;
		};
	}, []);

	const updateField = (name: keyof FormState, value: string) => {
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleApplyPromo = () => {
		const normalized = promoInput.trim().toUpperCase();
		if (!normalized) {
			setAppliedPromo("");
			setPromoError("Enter a promo code first.");
			setPromoMessage("");
			return;
		}

		if (PROMO_CODES.includes(normalized)) {
			setAppliedPromo(normalized);
			setPromoMessage(`${normalized} applied. You saved 10% on subtotal.`);
			setPromoError("");
			return;
		}

		setAppliedPromo("");
		setPromoMessage("");
		setPromoError("Invalid promo code.");
	};

	const handlePlaceOrder = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitError("");

		if (items.length === 0) {
			setSubmitError("Your cart is empty.");
			return;
		}

		const promoCode = appliedPromo || promoInput.trim().toUpperCase();

		setPlacingOrder(true);

		try {
			const response = await fetch(`${API_BASE_URL}/api/orders`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					customer: form,
					items,
					promoCode: promoCode || null,
				}),
			});

			const payload = (await response.json().catch(() => null)) as
				| { success?: boolean; message?: string; data?: { orderId?: string } }
				| null;

			if (!response.ok || !payload?.success || !payload.data?.orderId) {
				throw new Error(payload?.message ?? "Could not place order");
			}

			const orderId = payload.data.orderId;

			void fetch(FORMSPREE_ENDPOINT, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					_subject: `New Order Received - ${orderId}`,
					orderId,
					customerName: form.fullName,
					email: form.email,
					mobile: form.mobile,
					address: `${form.address}, ${form.city} ${form.postalCode}`.trim(),
					notes: form.notes,
					items: items
						.map((item) => `${item.name} (Size ${item.size}) x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`)
						.join("\n"),
					promoCode: promoCode || "None",
					subtotal: formatCurrency(subtotal),
					discount: formatCurrency(discountAmount),
					deliveryCharge: deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge),
					"payable amount": formatCurrency(totalAmount),
				}),
			}).catch((error) => {
				console.error("Formspree notification failed:", error);
			});

			clearCart();
			router.push(`/thankyou?orderId=${orderId}`);
		} catch (error) {
			setSubmitError(error instanceof Error ? error.message : "Could not place order");
		} finally {
			setPlacingOrder(false);
		}
	};

	if (!hydrated) {
		return (
			<main className="min-h-[60vh] w-full bg-[#FCF5EE] px-6 py-14 sm:px-10" style={{ fontFamily: FONT_HEADING }}>
				<div className="mx-auto flex max-w-7xl items-center justify-center">
					<p className="text-sm text-[#7A6F5D]">Loading checkout...</p>
				</div>
			</main>
		);
	}

	if (items.length === 0) {
		return (
			<main className="min-h-[60vh] w-full bg-[#0000] px-6 py-14 sm:px-10" style={{ fontFamily: FONT_HEADING }}>
				<div className="mx-auto flex max-w-7xl items-center justify-center">
					<div className="max-w-lg rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] px-8 py-10 text-center shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
						<CheckCircle2 className="mx-auto h-12 w-12 text-[#ff7d6b]" />
						<h1 className="mt-4 text-3xl font-bold text-[#0F2540]">
							Checkout is empty
						</h1>
						<p className="mt-3 text-sm leading-6 text-[#7A6F5D]">
							Add items to your cart before placing an order.
						</p>
						<Link href="/" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#ff7d6b] px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105">
							Start Shopping
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="min-h-screen w-full bg-[#0000] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" style={{ fontFamily: FONT_HEADING }}>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-col gap-2">
					<span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7FA08D]">Checkout</span>
					<h1 className="text-4xl font-bold text-[#0F2540]">
						Place your order
					</h1>
					<p className="text-sm text-[#7A6F5D]">Fill in your details, apply a promo code if you have one, and confirm the order.</p>
				</div>

				<form onSubmit={handlePlaceOrder} className="mt-10 grid items-stretch gap-8 lg:grid-cols-[1.2fr_0.8fr]">
				<section className="space-y-6 rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.08)] sm:p-7">
					<div>
						<h2 className="text-2xl font-bold text-[#0F2540]">
							Customer details
						</h2>
						<p className="mt-1 text-sm text-[#7A6F5D]">We need these details to prepare and deliver your order.</p>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<Field icon={User} label="Full Name" name="fullName" value={form.fullName} onChange={updateField} placeholder="Your full name" required />
						<Field icon={Phone} label="Mobile" name="mobile" value={form.mobile} onChange={updateField} placeholder="03XX XXXXXXX" required />
						<Field icon={Mail} label="Email" name="email" value={form.email} onChange={updateField} placeholder="you@example.com" type="email" required />
						<Field icon={MapPin} label="City" name="city" value={form.city} onChange={updateField} placeholder="Your city" required />
					</div>

					<Field icon={Home} label="Address" name="address" value={form.address} onChange={updateField} placeholder="House no, street, area" required />

					<div className="grid gap-4 sm:grid-cols-2">
						<Field icon={BadgePercent} label="Postal Code" name="postalCode" value={form.postalCode} onChange={updateField} placeholder="Postal code" />
						<label className="block">
							<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">Payment Method</span>
							<div className="flex h-11 items-center gap-2 rounded-xl border border-[#e3dccb] bg-white px-3 text-sm text-[#0F2540]">
								<CreditCard className="h-4 w-4 text-[#7A6F5D]" />
								Cash on Delivery
							</div>
						</label>
					</div>

					<label className="block">
						<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">Order Notes</span>
						<div className="relative">
							<MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#7A6F5D]" />
							<textarea
								name="notes"
								rows={4}
								value={form.notes}
								onChange={(event) => updateField("notes", event.target.value)}
								placeholder="Any delivery instructions or notes..."
								className="w-full resize-none rounded-xl border border-[#e3dccb] bg-white pl-10 pr-3 py-3 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#ff7d6b]"
							/>
						</div>
					</label>

					<div className="rounded-[1.5rem] border border-[#e3dccb] bg-white p-4">
						<h3 className="text-lg font-bold text-[#0F2540]" style={{ fontFamily: FONT_HEADING }}>
							Promo code
						</h3>
						<p className="mt-1 text-sm text-[#7A6F5D]">Apply promo code to get 10% discount.</p>
						<div className="mt-4 flex flex-col gap-3 sm:flex-row">
							<div className="relative flex-1">
								<BadgePercent className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6F5D]" />
								<input
									value={promoInput}
									onChange={(event) => setPromoInput(event.target.value)}
									placeholder="Enter promo code"
									className="h-11 w-full rounded-xl border border-[#e3dccb] bg-white pl-10 pr-3 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#ff7d6b]"
								/>
							</div>
							<button
								type="button"
								onClick={handleApplyPromo}
								className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0F2540] px-5 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105"
							>
								Apply
							</button>
						</div>
						{promoMessage ? <p className="mt-3 text-sm text-emerald-600">{promoMessage}</p> : null}
						{promoError ? <p className="mt-3 text-sm text-red-600">{promoError}</p> : null}
					</div>

					{submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

					<button
						type="submit"
						disabled={placingOrder}
						className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ff7d6b] px-6 py-4 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{placingOrder ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Placing Order...
							</>
						) : (
							<>
								Place Order
								<ArrowRight className="h-4 w-4" />
							</>
						)}
					</button>
				</section>

				<aside className="flex h-full flex-col rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.08)] sm:p-7">
					<h2 className="text-2xl font-bold text-[#0F2540]">
						Order summary
					</h2>

					<div className="mt-5 space-y-4">
						{items.map((item) => (
							<div key={item.cartItemId} className="flex items-center gap-3 rounded-2xl bg-white p-3">
								<div className="relative h-16 w-16 overflow-hidden rounded-xl bg-[#f8f5ef]">
									<Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-[#0F2540]">{item.name}</p>
									<p className="text-xs text-[#7A6F5D]">Size {item.size} · Qty {item.quantity}</p>
								</div>
								<p className="text-sm font-semibold text-[#0F2540]">{formatCurrency(item.price * item.quantity)}</p>
							</div>
						))}
					</div>

					<div className="mt-6 space-y-3 text-sm text-[#7A6F5D]">
						<div className="flex items-center justify-between">
							<span>Subtotal</span>
							<span className="font-semibold text-[#0F2540]">{formatCurrency(subtotal)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span>Promo discount</span>
							<span className="font-semibold text-emerald-600">-{formatCurrency(discountAmount)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span>Delivery charge</span>
							<span className="font-semibold text-[#0F2540]">{deliveryCharge === 0 ? "Free" : formatCurrency(deliveryCharge)}</span>
						</div>
						<p className={`rounded-xl px-3 py-2 text-sm font-semibold flex items-center text-center ${deliveryCharge === 0 ? "bg-emerald-50 text-emerald-700" : "bg-[#fff7ed] text-[#b45309]"}`}>
							{deliveryMessage}
						</p>
						<div className="border-t border-[#e3dccb] pt-3">
							<div className="flex items-center justify-between text-base font-bold text-[#0F2540]">
								<span>Total</span>
								<span>{formatCurrency(totalAmount)}</span>
							</div>
						</div>
					</div>

					<div className="mt-6 flex flex-col rounded-[1.5rem] border border-[#e3dccb] bg-white p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">Accessories</p>
								<h3 className="mt-1 text-lg font-bold text-[#0F2540]">Small add-ons that fit the order</h3>
							</div>
							<Link href="/accessories" className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff7d6b] hover:underline">
								View more
							</Link>
						</div>

						{loadingAccessories ? (
							<p className="mt-4 text-sm text-[#7A6F5D]">Loading accessories...</p>
						) : accessoryProducts.length > 0 ? (
							<div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
								{accessoryProducts.map((product) => (
									<Link key={product.id} href={`/products/${product.id}`} className="flex items-center gap-3 rounded-2xl border border-[#f0e6d7] bg-[#fffdf8] p-3 transition hover:border-[#ff7d6b]/40 hover:shadow-sm">
										<div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#f8f5ef]">
											<Image src={getProductImage(product)} alt={product.name} fill className="object-cover" sizes="56px" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-[#0F2540]">{product.name}</p>
											<p className="text-xs text-[#7A6F5D]">{formatCurrency(product.price)}</p>
										</div>
									</Link>
								))}
							</div>
						) : (
							<p className="mt-4 text-sm text-[#7A6F5D]">Accessories will appear here once they are added to the database.</p>
						)}
					</div>
				</aside>
				</form>
			</div>
		</main>
	);
}