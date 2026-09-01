import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export async function GET(request: Request) {
  const targetUrl = new URL(request.url);
  const upstreamUrl = new URL(`${API_BASE_URL}/api/products`);

  targetUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(upstreamUrl.toString(), { cache: "no-store" });
    const contentType = response.headers.get("content-type") ?? "application/json";
    const body = contentType.includes("application/json") ? await response.json() : await response.text();

    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach the products service";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 502 }
    );
  }
}
