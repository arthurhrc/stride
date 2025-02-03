import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth/login", "/api/auth/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("stride_session")?.value;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/api/auth"));

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/app", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
