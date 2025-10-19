import { NextRequest, NextResponse } from "next/server";

const authRoutes = ["/login", "/register", "/verify-email"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const jwtToken = request.cookies.get("gratia-token");

  if (jwtToken && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
