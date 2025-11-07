import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { captureAnalyticsEvent } from "./posthog";
import { AnalyticsEventName } from "../src/lib/analytics/events";

type OrganizationRole = "owner" | "admin" | "member";

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) || "org";
}

function initialsFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || name.slice(0, 2).toUpperCase();
}

async function resolveDistinctId(ctx: QueryCtx | MutationCtx, userId: Id<'users'>): Promise<string> {
  const user = await ctx.db.get(userId);
  const email = (user as unknown as { email?: string } | undefined)?.email;
  return typeof email === 'string' ? email : userId;
}

async function getOrganizationSummary(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<'organizations'>
) {
  const organization = await ctx.db.get(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }
  return organization;
}

async function countOwnedOrganizations(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
  const memberships = await ctx.db
    .query('organizationMembers')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();
  return memberships.filter((membership) => membership.role === 'owner').length;
}

function generateInviteCode(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  const randomTrailing = Math.random().toString(10).slice(2, 6);
  return `${prefix}-${random}-${randomTrailing}`;
}

async function ensureUniqueOrganizationSlug(
  ctx: MutationCtx,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${suffix++}`;
  }
}

async function getUserEmail(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  const emailField = (user as unknown as { email?: string } | undefined)?.email;
  return typeof emailField === "string" ? emailField : null;
}

export const listOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const memberships = await ctx.db
      .query("organizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const organization = await ctx.db.get(membership.organizationId);
        if (!organization) {
          return null;
        }

        const memberCount = await ctx.db
          .query("organizationMembers")
          .withIndex("by_organization", (q) => q.eq("organizationId", membership.organizationId))
          .collect();

        const teamCount = await ctx.db
          .query("teams")
          .withIndex("by_organization", (q) => q.eq("organizationId", membership.organizationId))
          .collect();

        return {
          organizationId: membership.organizationId,
          name: organization.name,
          initials: initialsFromName(organization.name),
          slug: organization.slug,
          plan: organization.plan,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
          role: membership.role,
          joinedAt: membership.joinedAt,
          memberCount: memberCount.length,
          teamCount: teamCount.length,
        };
      })
    );

    return organizations.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});

export const listOrganizationInvites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const email = await getUserEmail(ctx, userId);

    const invitesByUser = await ctx.db
      .query("organizationInvites")
      .withIndex("by_user", (q) => q.eq("invitedUserId", userId))
      .collect();

    const invitesByEmail = email
      ? await ctx.db
          .query("organizationInvites")
          .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
          .collect()
      : [];

    const inviteMap = new Map<string, Doc<"organizationInvites">>();
    for (const invite of invitesByUser) {
      inviteMap.set(invite._id, invite);
    }
    for (const invite of invitesByEmail) {
      inviteMap.set(invite._id, invite);
    }

    const invites = await Promise.all(
      Array.from(inviteMap.values()).map(async (invite) => {
        const organization = await ctx.db.get(invite.organizationId);
        if (!organization) return null;

        const inviter = await ctx.db.get(invite.invitedBy);
        const inviterName = (inviter as unknown as { name?: string; email?: string } | undefined)?.name ??
          (inviter as unknown as { email?: string } | undefined)?.email ??
          "Member";

        return {
          inviteId: invite._id,
          organizationId: invite.organizationId,
          organizationName: organization.name,
          role: invite.role,
          invitedBy: invite.invitedBy,
          invitedByName: inviterName,
          code: invite.code,
          createdAt: invite.createdAt,
        };
      })
    );

    return invites.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Organization name is required");
    }

    const slugBase = slugifyName(trimmedName);
    const slug = await ensureUniqueOrganizationSlug(ctx, slugBase);
    const now = Date.now();

    const organizationId = await ctx.db.insert("organizations", {
      name: trimmedName,
      slug,
      createdAt: now,
      updatedAt: now,
      plan: "starter",
    });

    await ctx.db.insert("organizationMembers", {
      organizationId,
      userId,
      role: "owner",
      joinedAt: now,
    });

    const distinctId = await resolveDistinctId(ctx, userId);
    const totalOwned = await countOwnedOrganizations(ctx, userId);

    await captureAnalyticsEvent({
      name: AnalyticsEventName.ORGANIZATION_CREATED,
      distinctId,
      groups: { organization: organizationId },
      properties: {
        scope: "organization",
        organizationId,
        organizationName: trimmedName,
        plan: "starter",
        createdVia: "dashboard",
        totalOrganizationsOwned: totalOwned,
      },
    });

    return {
      organizationId,
      slug,
    };
  },
});

export const createOrganizationInvite = mutation({
  args: {
    organizationId: v.id("organizations"),
    email: v.optional(v.string()),
    invitedUserId: v.optional(v.id("users")),
    role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const membership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", userId)
      )
      .first();

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      throw new Error("You do not have permission to invite members");
    }

    if (!args.email && !args.invitedUserId) {
      throw new Error("Either email or invitedUserId must be provided");
    }

    const normalizedEmail = args.email?.trim().toLowerCase();

    if (normalizedEmail) {
      const existingEmailInvite = await ctx.db
        .query("organizationInvites")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();

      if (existingEmailInvite && existingEmailInvite.organizationId === args.organizationId) {
        throw new Error("An invite for this email already exists");
      }
    }

    if (args.invitedUserId) {
      const existingUserInvite = await ctx.db
        .query("organizationInvites")
        .withIndex("by_user", (q) => q.eq("invitedUserId", args.invitedUserId))
        .first();

      if (existingUserInvite && existingUserInvite.organizationId === args.organizationId) {
        throw new Error("This user already has an invite");
      }

      const alreadyMember = await ctx.db
        .query("organizationMembers")
        .withIndex("by_organization_user", (q) =>
          q.eq("organizationId", args.organizationId).eq("userId", args.invitedUserId!)
        )
        .first();

      if (alreadyMember) {
        throw new Error("User is already a member of this organization");
      }
    }

    const code = generateInviteCode("ORG");
    const inviteId = await ctx.db.insert("organizationInvites", {
      organizationId: args.organizationId,
      invitedUserId: args.invitedUserId,
      email: normalizedEmail,
      role: args.role ?? "member",
      invitedBy: userId,
      code,
      createdAt: Date.now(),
    });

    return {
      inviteId,
      code,
    };
  },
});

export const acceptOrganizationInvite = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db
      .query("organizationInvites")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!invite) {
      throw new Error("Invite not found or already used");
    }

    if (invite.invitedUserId && invite.invitedUserId !== userId) {
      throw new Error("This invite is addressed to a different user");
    }

    const email = invite.email ? invite.email.toLowerCase() : null;
    const userEmail = await getUserEmail(ctx, userId);
    if (email && userEmail && email !== userEmail.toLowerCase()) {
      throw new Error("This invite is addressed to a different email");
    }

    const existingMembership = await ctx.db
      .query("organizationMembers")
      .withIndex("by_organization_user", (q) =>
        q.eq("organizationId", invite.organizationId).eq("userId", userId)
      )
      .first();

    if (!existingMembership) {
      await ctx.db.insert("organizationMembers", {
        organizationId: invite.organizationId,
        userId,
        role: invite.role,
        joinedAt: Date.now(),
      });
    }

    const organization = await getOrganizationSummary(ctx, invite.organizationId);
    const distinctId = await resolveDistinctId(ctx, userId);
    const inviteChannel = invite.email ? "email" : invite.invitedUserId ? "manual" : "link";

    await captureAnalyticsEvent({
      name: AnalyticsEventName.ORGANIZATION_JOINED,
      distinctId,
      groups: { organization: invite.organizationId },
      properties: {
        scope: "organization",
        organizationId: invite.organizationId,
        organizationName: organization.name,
        role: invite.role,
        inviteChannel,
      },
    });

    await ctx.db.delete(invite._id);

    return {
      organizationId: invite.organizationId,
    };
  },
});

export const declineOrganizationInvite = mutation({
  args: {
    inviteId: v.id("organizationInvites"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      return;
    }

    if (invite.invitedUserId && invite.invitedUserId !== userId) {
      throw new Error("Cannot decline invite for another user");
    }

    if (invite.email) {
      const userEmail = await getUserEmail(ctx, userId);
      if (userEmail && userEmail.toLowerCase() !== invite.email.toLowerCase()) {
        throw new Error("Cannot decline invite for another email");
      }
    }

    await ctx.db.delete(args.inviteId);
  },
});

export const recordOrganizationSwitch = mutation({
  args: {
    fromOrganizationId: v.optional(v.id("organizations")),
    toOrganizationId: v.id("organizations"),
    availableTeamCount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const distinctId = await resolveDistinctId(ctx, userId);
    await captureAnalyticsEvent({
      name: AnalyticsEventName.ORGANIZATION_SWITCHED,
      distinctId,
      groups: { organization: args.toOrganizationId },
      properties: {
        scope: "organization",
        fromOrganizationId: args.fromOrganizationId ?? undefined,
        toOrganizationId: args.toOrganizationId,
        availableTeamCount: args.availableTeamCount,
      },
    });
  },
});

