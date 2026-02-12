import { PROTECTED_ROUTES } from "@/lib/utils"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtDecode } from "jwt-decode"

interface JWTPayload {
  userId: string
  email: string
  role: "user" | "admin"
  exp: number
  googleId: string
}

export default function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")
  const isAuthPage = request.nextUrl.pathname === "/"
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  )
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

  if (!accessToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (accessToken && isAdminRoute) {
    try {
      const decoded = jwtDecode<JWTPayload>(accessToken.value)

      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/quiz/:path*", "/"],
}
