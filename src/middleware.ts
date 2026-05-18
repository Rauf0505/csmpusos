import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/auth", "/api/auth/login", "/api/auth/signup"];

const rolePrefixes: Record<string, string> = {
  student: "/student",
  admin: "/admin",
  teacher: "/teacher",
  "department-head": "/department",
};

const roleDashboards: Record<string, string> = {
  student: "/student/dashboard",
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  "department-head": "/department/dashboard",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

    if (!payload.id || !payload.role) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    const role = payload.role as string;
    const prefix = rolePrefixes[role];

    if (prefix && pathname.startsWith(prefix)) {
      return NextResponse.next();
    }

    const redirectPath = roleDashboards[role] || "/auth";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
