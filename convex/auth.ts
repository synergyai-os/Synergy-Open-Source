import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import type { DataModel } from "./_generated/dataModel";

console.log("🔧 [Convex Auth] Initializing authentication...");
console.log("🔧 [Convex Auth] SITE_URL:", process.env.SITE_URL);
console.log("🔧 [Convex Auth] NODE_ENV:", process.env.NODE_ENV);

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        console.log("🔧 [Password Provider] Profile called with:", { 
          email: params.email, 
          name: params.name 
        });
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
});

console.log("✅ [Convex Auth] Authentication initialized successfully");
