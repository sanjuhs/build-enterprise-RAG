import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedPaths = [
  "/rag",
  "/upload-dashboard",
  "/explore-files",
  "/system-monitoring",
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some((prefix) =>
    path.startsWith(prefix)
  );

  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
