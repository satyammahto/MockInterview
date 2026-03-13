import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_ROUTES = ["/dashboard", "/upload", "/report", "/settings", "/interview", "/resume-analyzer", "/resume"]
const AUTH_ROUTES = ["/auth/login", "/auth/signup"]

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get("auth_token")?.value

    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

    // Redirect unauthenticated users away from protected pages
    if (isProtected && !token) {
        const loginUrl = new URL("/auth/login", request.url)
        loginUrl.searchParams.set("from", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users away from login/signup to dashboard
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|fonts|public).*)",
    ],
}
