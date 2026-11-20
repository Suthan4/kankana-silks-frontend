import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.REVALIDATE_SECRET;
  const suppliedSecret = request.headers.get("x-revalidate-secret");

  if (!configuredSecret || !suppliedSecret || suppliedSecret !== configuredSecret) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  // Invalidate the home page only after the backend confirms its DB mutation.
  revalidatePath("/", "page");

  return NextResponse.json({ success: true, revalidated: ["/"] });
}
