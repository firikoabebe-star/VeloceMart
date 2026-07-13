import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/cart", "/checkout", "/account"];
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token");

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if ((isProtected || isAdmin) && !accessToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cart/:path*",
    "/checkout/:path*",
    "/account/:path*",
    "/admin/:path*",
  ],
};
