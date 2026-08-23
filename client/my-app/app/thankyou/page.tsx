import Link from "next/link";
import { Check, Heart } from "lucide-react";

export default function ThankYouPage({ searchParams }: { searchParams?: { orderId?: string } }) {
	const orderId = searchParams?.orderId ?? "JKD12345";

	return (
		<main
			className="flex min-h-[70vh] items-center justify-center bg-[#0000] px-6 py-8 sm:px-10"
			style={{ fontFamily: "'Quicksand', sans-serif" }}
		>
			<div className="flex w-full max-w-lg flex-col items-center text-center">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4d7a6c]">
					<Check className="h-7 w-7 text-white" strokeWidth={3} />
				</div>

				<h1 className="mt-4 flex items-center gap-2 text-3xl font-semibold text-[#1f2937] sm:text-4xl">
					Thank You!
					<Heart className="h-6 w-6 fill-[#e0645a] text-[#e0645a]" />
				</h1>

				<p className="mt-2 text-[#6b7280]">Your order has been placed successfully.</p>
				<p className="mt-2 text-sm text-[#9ca3af]">
					We will call you shortly for order confirmation.
				</p>

				<Link
					href="/"
					className="mt-6 cursor-pointer rounded-full bg-[#4d7a6c] px-8 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#3f6759]"
				>
					CONTINUE SHOPPING
				</Link>
			</div>
		</main>
	);
}