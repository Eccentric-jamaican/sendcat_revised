import { NextResponse } from "next/server";

const OUTBOUND_ALLOWLIST = new Set([
  "www.ebay.com",
  "ebay.com",
  "www.amazon.com",
  "amazon.com",
  "www.walmart.com",
  "walmart.com",
]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid url param" }, { status: 400 });
  }

  if (!OUTBOUND_ALLOWLIST.has(parsed.hostname)) {
    return NextResponse.json({ error: "Blocked redirect host" }, { status: 400 });
  }

  // TODO: log outbound click as a Convex event (sessionId + optional Clerk identity).
  return NextResponse.redirect(parsed.toString(), 302);
}
