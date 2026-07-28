import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const nextUrl = request.nextUrl.clone();

  if (nextUrl.pathname === "/en") {
    nextUrl.pathname = "/";
    return NextResponse.redirect(nextUrl);
  }

  if (nextUrl.pathname.startsWith("/en/")) {
    nextUrl.pathname = nextUrl.pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(nextUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/en", "/en/:path*"],
};
