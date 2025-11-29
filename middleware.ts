import { NextRequest, NextResponse } from "next/server";



function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(.*)$/) !== null // any file with extension
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow API routes and static assets
  if (pathname.startsWith("/api") || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Per new requirement, authentication is handled on the client via localStorage.
  // We do not enforce redirects based on server cookies anymore.
  return NextResponse.next();
}

// Run middleware on all routes so we can centrally enforce redirects.
export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // all paths except _next and files with extension
  ],
};
