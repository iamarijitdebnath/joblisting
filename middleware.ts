import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect routes
  if (pathname.startsWith("/dashboard/employer")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    
    if (token.role !== "employer") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  if (pathname.startsWith("/dashboard/job-seeker")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
    
    if (token.role !== "jobSeeker") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};