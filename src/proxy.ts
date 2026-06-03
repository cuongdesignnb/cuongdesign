import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Apply middleware to matching paths (skip static files, api routes, images)
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
