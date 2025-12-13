import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Sign in to your account to continue shopping
        </p>
      </div>

      <SignIn />
    </div>
  );
}
