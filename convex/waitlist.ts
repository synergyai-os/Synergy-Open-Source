import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Add someone to the waitlist
 */
export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    reason: v.optional(v.string()),
    referralSource: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Email already on waitlist");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Add to waitlist
    const waitlistId = await ctx.db.insert("waitlist", {
      email: args.email,
      name: args.name,
      company: args.company,
      role: args.role,
      reason: args.reason,
      referralSource: args.referralSource,
      joinedAt: Date.now(),
      status: "pending",
    });

    return { success: true, waitlistId };
  },
});

/**
 * Get waitlist count (public)
 */
export const getWaitlistCount = query({
  args: {},
  handler: async (ctx) => {
    const count = await ctx.db
      .query("waitlist")
      .collect()
      .then((results) => results.length);

    return count;
  },
});

/**
 * Get all waitlist entries (admin only - for future)
 */
export const listWaitlist = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("invited"), v.literal("converted"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      const results = await ctx.db
        .query("waitlist")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
      
      return results;
    }

    const results = await ctx.db
      .query("waitlist")
      .order("desc")
      .collect();

    return results;
  },
});

