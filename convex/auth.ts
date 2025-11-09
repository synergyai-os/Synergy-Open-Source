import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
        };
      },
    }),
    // Add other providers here:
    // GitHub from "@auth/core/providers/github"
    // Google from "@auth/core/providers/google"
    // Resend from "@auth/core/providers/resend" (for magic links)
  ],
  callbacks: {
    async redirect({ redirectTo }) {
      // For password auth, redirect to the provided URL or default to home
      const baseUrl = process.env.SITE_URL ?? "http://localhost:5173";
      
      // If redirectTo is provided and starts with /, return it
      if (redirectTo && redirectTo.startsWith("/")) {
        return redirectTo;
      }
      
      // Default redirect after sign in
      return "/";
    },
  },
});
