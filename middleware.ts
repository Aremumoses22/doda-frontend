import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

/**
 * Doda Next.js Edge Middleware
 *
 * Runs on every request matching /admin/* and /dashboard/*
 *
 * Flow:
 *  1. No token    → redirect to /login
 *  2. Invalid JWT → clear the cookie, redirect to /login
 *  3. Client accessing /admin → redirect to /dashboard
 *  4. Staff accessing /dashboard → redirect to /admin
 *  5. Valid + correct role → allow through
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // The access token is stored as an httpOnly cookie by the login flow
  const token = req.cookies.get("doda_token")?.value

  // ── No token ────────────────────────────────────────────────────────────────
  if (!token) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // ── Verify token ────────────────────────────────────────────────────────────
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string

    // Clients must only access /dashboard
    if (pathname.startsWith("/admin") && role === "client") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Staff (principal, lawyer, admin_staff, billing_admin) must only access /admin
    if (pathname.startsWith("/dashboard") && role !== "client") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  } catch {
    // Token is invalid / expired — clear the cookie and send to login
    const response = NextResponse.redirect(new URL("/login", req.url))
    response.cookies.delete("doda_token")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
  ],
}
