import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const {
      nextUrl: { pathname },
    } = req;

    // manage route protection
    const isAuth = await getToken({ req });
    const isLoginPage = pathname.startsWith("/login");

    const sensitiveRoutes = ["/dashboard"];

    const isAccessingSensitiveRoute = sensitiveRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (!isAuth && isAccessingSensitiveRoute) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isLoginPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Allow access to all other routes
    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
