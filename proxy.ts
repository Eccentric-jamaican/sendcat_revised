import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const SENDCAT_SID_COOKIE = "sendcat_sid";

function ensureSessionCookie(req: Request) {
  const url = new URL(req.url);
  const cookieHeader = req.headers.get("cookie") ?? "";
  const hasSid = cookieHeader.split(";").some((c) => c.trim().startsWith(`${SENDCAT_SID_COOKIE}=`));
  if (hasSid) return NextResponse.next();

  const res = NextResponse.next();
  // Anonymous session identifier (NOT an auth credential). Keep readable by client
  // so it can be attached to Convex calls and click logging.
  res.cookies.set(SENDCAT_SID_COOKIE, crypto.randomUUID(), {
    httpOnly: false,
    sameSite: "lax",
    secure: url.protocol === "https:",
    path: "/",
  });
  return res;
}

export default clerkMiddleware((auth, req) => {
  // We intentionally do NOT protect `/app` globally (anonymous-first product).
  // Auth gates are enforced on specific routes/features and in Convex functions.
  return ensureSessionCookie(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and static assets unless manually requested
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes so Clerk + analytics hooks fire
    "/(api|trpc)(.*)",
  ],
};
