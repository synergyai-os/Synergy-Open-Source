# Waitlist Feature

**Location:** `convex/features/waitlist/`

**Purpose:** Manages public waitlist signups for users interested in joining the platform.

---

## Tables

| Table      | Purpose                                                                           |
| ---------- | --------------------------------------------------------------------------------- |
| `waitlist` | Stores waitlist entries with email, name, company, role, and referral information |

## Key Functions

| Function           | Purpose                                                         |
| ------------------ | --------------------------------------------------------------- |
| `joinWaitlist`     | Adds a new email to the waitlist (public, auth-exempt)          |
| `getWaitlistCount` | Returns total count of waitlist entries (public)                |
| `listWaitlist`     | Lists all waitlist entries (admin only, optional status filter) |

## Dependencies

- Depends on: None (standalone feature)
- Used by: Public landing page, admin dashboard

## Status

**Active** — Public waitlist signup functionality with email validation and duplicate prevention.
