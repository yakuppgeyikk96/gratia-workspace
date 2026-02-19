import { COOKIE_TOKEN_KEY } from "@/constants";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_TOKEN_KEY);

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
