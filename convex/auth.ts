import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password, // Email/password authentication
    // Add other providers here:
    // GitHub from "@auth/core/providers/github"
    // Google from "@auth/core/providers/google"
    // Resend from "@auth/core/providers/resend" (for magic links)
  ],
});
