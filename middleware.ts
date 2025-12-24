import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "admin"
    const isAffiliate = token?.role === "affiliate" || token?.role === "admin"
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Affiliate routes
    if (path.startsWith("/affiliate") && !isAffiliate) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

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
          return !!token
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

