import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET || "fallback-secret-key-for-development";
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Define protected routes
  const isStoreRoute = path.startsWith("/store");
  const isAdminRoute = path.startsWith("/admin");
  
  // Public routes (login, etc)
  if (!isStoreRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Get session cookie
  const cookie = req.cookies.get("session")?.value;
  
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify JWT
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });
    
    const role = payload.role as string;
    
    // Check Role-based access
    if (isStoreRoute && role !== "USER") {
      // If admin tries to access store without being a user, we can either allow or restrict
      // According to spec, ADMIN goes to /admin, USER goes to /store
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    
    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/store", req.url));
    }
    
    return NextResponse.next();
  } catch {
    // Invalid token
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/store/:path*", "/admin/:path*"],
};
