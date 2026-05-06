import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get("doda_token")?.value

  if (!token) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      const response = NextResponse.redirect(new URL("/login", req.url))
      response.cookies.delete("doda_token")
      return response
    }

    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as string

    if (pathname.startsWith("/admin") && role === "client") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (pathname.startsWith("/dashboard") && role !== "client") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  } catch {
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
