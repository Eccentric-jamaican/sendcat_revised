import type { AuthConfig } from "convex/server";



// Clerk → Convex auth configuration.

// Requires a Clerk JWT template with audience/applicationID "convex".

const clerkIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!clerkIssuerDomain) {

  throw new Error(

    "Missing CLERK_JWT_ISSUER_DOMAIN. Set this environment variable to your Clerk JWT issuer domain so Convex can validate tokens.",

  );

}



export default {

  providers: [

    {

      domain: clerkIssuerDomain,

      applicationID: "convex",

    },

  ],

} satisfies AuthConfig;








