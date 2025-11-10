import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./auth";
import { requirePermission } from "./rbac/permissions";

/**
 * Sync user from WorkOS to Convex database
 * Called during OAuth callback after WorkOS authentication
 * 
 * Creates new user if doesn't exist, updates if exists
 * Returns the Convex userId for session storage
 */
export const syncUserFromWorkOS = mutation({
  args: {
    workosId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();
    
    const now = Date.now();
    
    // Compute full name from firstName and lastName
    const name = args.firstName && args.lastName
      ? `${args.firstName} ${args.lastName}`
      : args.firstName || args.lastName || undefined;
    
    if (existingUser) {
      // User exists - update their data and last login time
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        name,
        emailVerified: args.emailVerified ?? true,
        updatedAt: now,
        lastLoginAt: now,
      });
      
      return existingUser._id;
    } else {
      // New user - create record
      const userId = await ctx.db.insert("users", {
        workosId: args.workosId,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        name,
        emailVerified: args.emailVerified ?? true,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });
      
      return userId;
    }
  },
});

/**
 * Get user by Convex ID
 * Used to fetch user profile data
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by WorkOS ID
 * Used for admin lookups and debugging
 */
export const getUserByWorkosId = query({
  args: { workosId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosId", args.workosId))
      .first();
  },
});

/**
 * Get current authenticated user
 * This will work after Convex auth is properly set up
 * For now, returns null (auth context not yet configured)
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // identity.subject will contain the Convex userId
    // This will work once we set up Convex authentication
    return await ctx.db.get(identity.subject as any);
  },
});

/**
 * Update user profile
 * Requires "users.manage-profile" permission
 * Users can edit their own profile (scope: "own")
 * Admins can edit any profile (scope: "all")
 */
export const updateUserProfile = mutation({
  args: {
    targetUserId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    userId: v.optional(v.id("users")), // TODO: Remove once Convex auth context is set up
  },
  handler: async (ctx, args) => {
    // Try explicit userId first (client passes it), fallback to auth context
    const userId = args.userId ?? await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // RBAC Permission Check: Check "users.manage-profile" permission
    // Users can edit their own profile
    // Admins can edit any profile
    await requirePermission(ctx, userId, "users.manage-profile", {
      resourceOwnerId: args.targetUserId, // Target user is the "owner" of their profile
    });

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) {
      updates.firstName = args.firstName;
    }

    if (args.lastName !== undefined) {
      updates.lastName = args.lastName;
    }

    if (args.profileImageUrl !== undefined) {
      updates.profileImageUrl = args.profileImageUrl;
    }

    // Update computed name field if firstName or lastName changed
    if (args.firstName !== undefined || args.lastName !== undefined) {
      const user = await ctx.db.get(args.targetUserId);
      const firstName = args.firstName ?? user?.firstName;
      const lastName = args.lastName ?? user?.lastName;
      
      updates.name = firstName && lastName
        ? `${firstName} ${lastName}`
        : firstName || lastName || undefined;
    }

    await ctx.db.patch(args.targetUserId, updates);

    return { success: true };
  },
});

