import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  // User settings - one per user
  userSettings: defineTable({
    userId: v.id("users"), // Reference to the authenticated user
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))), // Theme preference
    claudeApiKey: v.optional(v.string()), // Claude API key (encrypted/secure)
    readwiseApiKey: v.optional(v.string()), // Readwise API key (encrypted/secure)
    // Future: displayName, email preferences, etc.
  })
    .index("by_user", ["userId"]), // Index for quick lookup by user
});

export default schema;

