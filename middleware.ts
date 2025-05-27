import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if user is authenticated by looking for the namaPetugas in localStorage
  // Since middleware runs on the server, we can't access localStorage directly
  // We'll handle authentication checks in the components instead

  const { pathname } = request.nextUrl

  // Allow access to login page
  if (pathname === "/login") {
    return NextResponse.next()
  }

  // For all other routes, let the components handle authentication
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
