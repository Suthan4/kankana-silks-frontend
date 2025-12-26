import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const siteMode = process.env.NEXT_PUBLIC_SITE_MODE;
  const pathname = request.nextUrl.pathname;

  // Always allow Next.js internals & static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // Coming soon gate
  if (siteMode === "coming-soon" && !pathname.startsWith("/coming-soon")) {
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  return NextResponse.next();
}
