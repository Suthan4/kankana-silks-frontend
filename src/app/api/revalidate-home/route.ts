import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.REVALIDATE_SECRET;
  const suppliedSecret = request.headers.get("x-revalidate-secret");

  if (!configuredSecret || !suppliedSecret) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const expected = Buffer.from(configuredSecret);
  const received = Buffer.from(suppliedSecret);
  const authorized =
    expected.length === received.length && timingSafeEqual(expected, received);

  if (!authorized) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  revalidatePath("/", "page");

  return NextResponse.json({ success: true, revalidated: ["/"] });
}
