import { COOKIE_TOKEN_KEY } from "@/constants";
import { NextRequest, NextResponse } from "next/server";
const authRoutes = ["/login", "/register", "/verify-email"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite GCS URLs for Docker-internal networking (/_next/image proxy)
  if (pathname === "/_next/image") {
    const url = request.nextUrl.searchParams.get("url");
    const publicHost = process.env.GCS_PUBLIC_HOST;
    const internalHost = process.env.GCS_INTERNAL_HOST;

    if (url && publicHost && internalHost && url.startsWith(publicHost)) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.searchParams.set(
        "url",
        url.replace(publicHost, internalHost),
      );
      return NextResponse.rewrite(rewriteUrl);
    }
    return NextResponse.next();
  }

  const jwtToken = request.cookies.get(COOKIE_TOKEN_KEY);

  if (jwtToken && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico).*)",
    "/_next/image",
  ],
};
