import type { AuthConfig } from "convex/server";

// Clerk → Convex auth configuration.
// Requires a Clerk JWT template with audience/applicationID "convex".
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

