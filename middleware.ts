import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "admin"
    const isAffiliate = token?.role === "affiliate" || token?.role === "admin"
    const path = req.nextUrl.pathname
    const isBlocked = Boolean(token?.isBlocked)

    // Affiliate API routes
    if (path.startsWith("/api/affiliate")) {
      if (!token) {
        return NextResponse.json(
          { error: "احراز هویت انجام نشده است." },
          { status: 401 }
        )
      }
      if (isBlocked) {
        return NextResponse.json(
          { error: "حساب کاربری شما مسدود است." },
          { status: 403 }
        )
      }
      if (!isAffiliate) {
        return NextResponse.json(
          { error: "دسترسی مجاز نیست." },
          { status: 403 }
        )
      }
    }

    // Admin API routes
    if (path.startsWith("/api/admin")) {
      if (!token) {
        return NextResponse.json(
          { error: "احراز هویت انجام نشده است." },
          { status: 401 }
        )
      }
      if (isBlocked) {
        return NextResponse.json(
          { error: "حساب کاربری شما مسدود است." },
          { status: 403 }
        )
      }
      if (!isAdmin) {
        return NextResponse.json(
          { error: "دسترسی مجاز نیست." },
          { status: 403 }
        )
      }
    }

    // Admin routes
    if (path.startsWith("/admin")) {
      if (isBlocked || !isAdmin) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Affiliate routes
    if (path.startsWith("/affiliate")) {
      if (isBlocked || !isAffiliate) {
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        const isBlocked = Boolean(token?.isBlocked)

        // Public routes
        if (
          path.startsWith("/store") ||
          path.startsWith("/auth") ||
          path.startsWith("/api/auth") ||
          path === "/" ||
          path.startsWith("/_next") ||
          path.startsWith("/api/public")
        ) {
          return true
        }

        // Protected routes require auth
        if (path.startsWith("/admin") || path.startsWith("/affiliate")) {
          return !!token && !isBlocked
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/affiliate/:path*",
    "/api/orders/:path*",
    "/api/admin/:path*",
    "/api/affiliate/:path*",
  ],
}
