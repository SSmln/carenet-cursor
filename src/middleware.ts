import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // 🔐 로그인 안 된 상태에서 보호 페이지 접근 시 로그인 페이지로 리다이렉트
  if (pathname.startsWith("/dashboard") && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔐 로그인 된 상태에서 로그인 페이지 접근 시 대시보드로 리다이렉트
  if (pathname === "/login" && accessToken) {
    return NextResponse.redirect(new URL("/cctv", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cctv/:path*", "/login"], // ✅ 로그인 페이지도 감시
};
