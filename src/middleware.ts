import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define protected routes
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

  // Redirect to home page if trying to access protected route without authentication
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
