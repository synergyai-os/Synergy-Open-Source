# Vertical Slices - Shape Up Style

> **Methodology**: Build end-to-end features that work immediately, not layers.

Each slice delivers **working functionality** that Randy can test right away.

---

## 🥖 Slice 1: Workspace Context & Indicator

**Goal**: Store workspace context and show it in the UI

**Value**: Foundation for everything else + immediate visual feedback

### What We're Building

**Backend:**
- Update session cookie structure to include `activeWorkspace`
- Helper functions to get/set active workspace

**Frontend:**
- Header shows current workspace name
- "Private workspace" for personal
- Organization name for orgs

### Acceptance Criteria

- [ ] Session stores `activeWorkspace: { type: 'personal' | 'organization', id: null | string }`
- [ ] Header component reads from session
- [ ] Shows "Private workspace" by default
- [ ] Page refresh keeps workspace context

### Files Changed

- `src/app.d.ts` - TypeScript types
- `src/hooks.server.ts` - Session management
- `src/routes/+layout.server.ts` - Load workspace data
- `src/lib/components/Header.svelte` - Display workspace

### Test Plan

1. Load app → See "Private workspace" in header
2. Refresh page → Still shows "Private workspace"
3. Check session cookie → Contains `activeWorkspace`

---

## 🥖 Slice 2: Create First Organization

**Goal**: Create one organization (SynergyAI) and see it in database

**Value**: Randy can create orgs via UI, not Convex dashboard

### What We're Building

**Backend:**
- `convex/organizations.ts` - New file
- `createOrganization` mutation
- `listUserOrganizations` query

**Frontend:**
- "Create organization" button in workspace switcher
- Simple modal with name + slug fields
- Success feedback

### Acceptance Criteria

- [ ] Click "Create organization" opens modal
- [ ] Enter "SynergyAI" + slug "synergyai"
- [ ] Submit creates org in Convex
- [ ] User is automatically added as admin/owner
- [ ] Organization appears in Convex dashboard

### Files Changed

- `convex/schema.ts` - Already has organizations table
- `convex/organizations.ts` - New mutations/queries
- `src/lib/components/WorkspaceSwitcher.svelte` - New component
- `src/lib/components/CreateOrganizationModal.svelte` - New component

### Test Plan

1. Click "Create organization"
2. Fill: Name="SynergyAI", Slug="synergyai"
3. Submit
4. Check Convex dashboard → Org exists
5. Check `organizationMembers` → You're a member

---

## 🥖 Slice 3: Switch Between Personal & One Org

**Goal**: Toggle between personal workspace and SynergyAI

**Value**: Core workspace switching functionality

### What We're Building

**Backend:**
- `switchWorkspace` mutation
- Update session with new active workspace
- Queries filter by active workspace

**Frontend:**
- Workspace switcher menu (dropdown)
- Shows Personal + SynergyAI
- ✓ indicator on active workspace
- Click to switch

### Acceptance Criteria

- [ ] Workspace switcher shows:
  - "Private workspace" (checkmark if active)
  - "SynergyAI" (checkmark if active)
- [ ] Click SynergyAI → Header updates to "SynergyAI"
- [ ] Session cookie updates
- [ ] Content filters by workspace:
  - Personal: `organizationId = null`
  - SynergyAI: `organizationId = "org_synergyai"`

### Files Changed

- `convex/organizations.ts` - Add `switchWorkspace` mutation
- `src/lib/components/WorkspaceSwitcher.svelte` - Full implementation
- `src/lib/composables/useWorkspace.svelte.ts` - New composable
- `src/routes/(authenticated)/inbox/+page.svelte` - Filter by workspace

### Test Plan

1. Create note in Personal workspace
2. Switch to SynergyAI
3. Note disappears (filtered out)
4. Switch back to Personal
5. Note reappears
6. Refresh page → Stays in last workspace

---

## 🥖 Slice 4: Keyboard Shortcuts (CMD+1/2)

**Goal**: Fast workspace switching with keyboard

**Value**: Power user feature, Linear-style

### What We're Building

**Frontend:**
- Global keyboard event listeners
- `CMD+1` → Switch to workspace 1 (Personal)
- `CMD+2` → Switch to workspace 2 (SynergyAI)
- Visual feedback on switch

### Acceptance Criteria

- [ ] Press CMD+1 → Switches to Personal
- [ ] Press CMD+2 → Switches to SynergyAI
- [ ] Works from any page
- [ ] Doesn't interfere with input fields
- [ ] Toast notification on switch

### Files Changed

- `src/lib/composables/useKeyboardShortcuts.svelte.ts` - New composable
- `src/routes/+layout.svelte` - Register global shortcuts
- `src/lib/utils/keyboardShortcuts.ts` - Shortcut registry

### Test Plan

1. On inbox page → Press CMD+1 → Switches to Personal
2. On notes page → Press CMD+2 → Switches to SynergyAI
3. Typing in input → CMD+1 does nothing (correct)
4. Toast shows "Switched to SynergyAI"

---

## 🥖 Slice 5: Multiple Organizations

**Goal**: Add 3 more orgs (Saprolab, ZDHC, PurposePilot)

**Value**: Full multi-org experience

### What We're Building

**Backend:**
- No changes needed (reuse existing)

**Frontend:**
- Create 3 more orgs via UI
- Workspace switcher lists all 4
- CMD+1/2/3/4/5 for switching

### Acceptance Criteria

- [ ] Create Saprolab org
- [ ] Create ZDHC org
- [ ] Create PurposePilot org
- [ ] Workspace switcher shows all 5 options:
  - CMD+1: Personal
  - CMD+2: SynergyAI
  - CMD+3: Saprolab
  - CMD+4: ZDHC
  - CMD+5: PurposePilot
- [ ] All keyboard shortcuts work

### Files Changed

- No code changes (just creating data)
- Update keyboard shortcut registration for CMD+3/4/5

### Test Plan

1. Create all 4 orgs via UI
2. Test CMD+1/2/3/4/5
3. Create content in each workspace
4. Verify isolation (content doesn't leak)

---

## 🥖 Slice 6: CMD+K Workspace Search

**Goal**: Search/filter workspaces via command palette

**Value**: Fast access when you have many workspaces

### What We're Building

**Frontend:**
- Integrate workspace switching into existing CMD+K
- Type "switch" or "workspace" → Shows all workspaces
- Type partial name "Sapr" → Filters to Saprolab
- Select to switch

### Acceptance Criteria

- [ ] CMD+K → Type "switch" → Shows workspace actions
- [ ] CMD+K → Type "Saprolab" → Filters to Saprolab
- [ ] Press Enter → Switches to workspace
- [ ] Fuzzy search works
- [ ] Shows current workspace indicator

### Files Changed

- `src/lib/components/CommandPalette.svelte` - Add workspace actions
- `src/lib/composables/useWorkspace.svelte.ts` - Workspace list helper

### Test Plan

1. Press CMD+K
2. Type "switch" → See all workspaces
3. Type "Sapr" → Filtered to Saprolab only
4. Press Enter → Switches to Saprolab
5. CMD+K → Type "ZDHC" → Switches to ZDHC

---

## 🥖 Slice 7: Account Linking (Stretch Goal)

**Goal**: Link multiple email accounts (personal + work)

**Value**: Switch between accounts without re-login

### What We're Building

**Backend:**
- `accountLinks` table (already in schema)
- `linkAccount` mutation
- `getLinkedAccounts` query

**Frontend:**
- "Add an account..." option in switcher
- Link account flow (login with second email)
- Prompt to link when detecting existing session
- Show all linked accounts in switcher

### Acceptance Criteria

- [ ] Click "Add an account..."
- [ ] Login with second email (e.g., `randy+work@synergyai.nl`)
- [ ] Prompt: "Link to randyhereman@gmail.com?"
- [ ] Confirm → Creates `accountLinks` record
- [ ] Workspace switcher shows accounts section:
  - "Accounts"
  - ● randyhereman@gmail.com (active)
  - ○ randy+work@synergyai.nl
- [ ] Click to switch accounts

### Files Changed

- `convex/users.ts` - Add account linking mutations
- `src/routes/auth/callback/+server.ts` - Detect existing session
- `src/lib/components/WorkspaceSwitcher.svelte` - Show linked accounts
- `src/lib/components/LinkAccountFlow.svelte` - New component

### Test Plan

1. Logged in as `randyhereman@gmail.com`
2. Click "Add an account..."
3. Login with `randy+work@synergyai.nl`
4. System prompts to link
5. Confirm link
6. See both accounts in switcher
7. Switch between accounts (no re-login needed)

---

## 📊 Progress Tracking

| Slice | Start Date | End Date | Status | Linear Ticket |
|-------|------------|----------|--------|---------------|
| 1 | 2025-11-10 | TBD | 🚧 In Progress | TBD |
| 2 | TBD | TBD | ⏳ Not Started | TBD |
| 3 | TBD | TBD | ⏳ Not Started | TBD |
| 4 | TBD | TBD | ⏳ Not Started | TBD |
| 5 | TBD | TBD | ⏳ Not Started | TBD |
| 6 | TBD | TBD | ⏳ Not Started | TBD |
| 7 | TBD | TBD | ⏳ Not Started | TBD |

---

## 🎯 Next Steps

**Current Focus**: Slice 1 - Workspace Context & Indicator

**After each slice:**
1. Test with Randy
2. Get feedback
3. Adjust if needed
4. Move to next slice

**Estimated Timeline**: 1-2 weeks (1-2 days per slice)

