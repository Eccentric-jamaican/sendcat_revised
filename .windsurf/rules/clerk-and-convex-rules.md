---
trigger: always_on
---
Using Convex Helpers
Show UI Based on Auth State
Use Convex's helper components to control UI visibility:

<Authenticated> - shows content when user is signed in
<Unauthenticated> - shows content when user is signed out
<AuthLoading> - shows content while auth is loading
These should be used instead of Clerk's <SignedIn>, <SignedOut> and <ClerkLoading> components.

https://clerk.com/docs/guides/development/integrations/databases/convex
