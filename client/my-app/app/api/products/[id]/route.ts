import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(id)}`, { cache: "no-store" });
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
