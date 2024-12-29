import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedPaths = [
  "/rag",
  "/upload-dashboard",
  "/explore-files",
  "/system-monitoring",
  "/api/ragchat",
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some((prefix) =>
    path.startsWith(prefix)
  );

  if (path.startsWith("/api/")) {
    const origin = req.headers.get("origin");
    // for debugging
    // console.log({
    //   env: process.env.NODE_ENV,
    //   configuredUrl: process.env.NEXT_PUBLIC_APP_URL,
    //   currentOrigin: origin,
    // });

    if (process.env.NODE_ENV === "development" || !origin) {
      return NextResponse.next();
    }

    if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized origin" }),
        { status: 403, headers: { "content-type": "application/json" } }
      );
    }
  }

  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
