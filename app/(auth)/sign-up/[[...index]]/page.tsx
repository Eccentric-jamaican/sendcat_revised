import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Start shopping US brands with AI-powered logistics
        </p>
      </div>

      <SignUp />
    </div>
  );
}
