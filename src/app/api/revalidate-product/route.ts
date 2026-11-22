
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (
    !secret ||
    request.headers.get("x-revalidate-secret") !== secret
  ) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  revalidateTag("products", { expire: 0 });

  return NextResponse.json({
    success: true,
    message: "Product cache invalidated",
  });
}
