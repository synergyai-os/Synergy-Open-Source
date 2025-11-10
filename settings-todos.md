# Settings Implementation TODOs

## ✅ Completed

- [x] Created `organizationSettings` schema
- [x] Created `organizationSettings.ts` module with queries/mutations
- [x] Added admin permission checks
- [x] Updated settings page to show workspace context banner

## 🚧 In Progress (Minimal Working Version)

### API Keys - Workspace Scoping

**Personal Workspace:**

- [ ] Show Readwise API key input (user-owned)
- [ ] Show Claude API key input (personal, optional)
- [ ] Keep existing validation logic

**Organization Workspace:**

- [ ] Show Readwise API key input (user's personal key for org imports)
  - [ ] Add "Use my personal key" button (copies from personal settings)
  - [ ] Show message: "Your personal Readwise account - imports will be shared with org"
- [ ] Show Claude API key input (org-owned, admin-controlled)
  - [ ] Show "Admin only" badge if user is admin
  - [ ] Show "Contact admin" message if user is not admin
  - [ ] Disable input if not admin
- [ ] Load organization settings on mount
- [ ] Wire up org Claude key validation/save/delete

### Theme Setting

- [ ] Make theme work in personal workspace (current behavior)
- [ ] **Disable** theme in org workspace (show as "Coming soon")
- [ ] Add helpful message: "Theme preferences are personal. Switch to personal workspace to change."

## 📋 Future Enhancements (Not Now)

### Phase 1: Complete Workspace-Scoped Settings

- [ ] Implement "Use my personal key" button for Readwise
  - Query personal settings
  - Copy Readwise key to current workspace input
  - Show success message
- [ ] Add proper loading states for org settings
- [ ] Add error handling for org settings
- [ ] Test admin vs non-admin views
- [ ] Add visual indicators:
  - [ ] "👤 Personal" badge for user-owned settings
  - [ ] "🏢 Organization" badge for org-owned settings
  - [ ] "🔒 Admin Only" for admin-controlled settings

### Phase 2: Advanced Features

- [ ] Readwise sync history per workspace
  - Show last sync time per workspace
  - Separate sync state for personal vs org
- [ ] Claude API key usage tracking
  - Show org API usage if admin
  - Show personal API usage
- [ ] Organization billing settings (admin only)
  - API usage limits
  - Cost tracking
  - Member quotas
- [ ] Team-specific settings
  - Team API keys (if needed)
  - Team preferences

### Phase 3: Settings Management

- [ ] Settings export/import
- [ ] Audit log for org settings changes
- [ ] Bulk settings management for admins
- [ ] Settings templates

## 🎨 UI/UX Improvements

### Organization Settings Page

- [ ] Add tabbed interface:
  - "API Keys" tab
  - "Preferences" tab (theme, etc.)
  - "Billing" tab (admin only)
  - "Members" tab (admin only)
- [ ] Add org settings sidebar
- [ ] Improve mobile responsiveness
- [ ] Add keyboard shortcuts

### Personal Settings Page

- [ ] Keep clean, simple layout
- [ ] Add "Quick Actions" section
- [ ] Add settings search

## 🔐 Security Enhancements

- [ ] Add API key rotation feature
- [ ] Add API key expiration warnings
- [ ] Add audit log for API key changes
- [ ] Add 2FA for sensitive settings changes
- [ ] Add API key usage alerts

## 📊 Analytics Integration

- [ ] Track settings changes in PostHog
  - `setting_changed` event with workspace context
  - Track which settings are most used
  - Track admin actions
- [ ] Track API key validation attempts
- [ ] Track settings errors

## 🧪 Testing Checklist

### Manual Testing

- [ ] Personal workspace - all settings work
- [ ] Org workspace - admin can edit
- [ ] Org workspace - non-admin sees read-only/disabled
- [ ] Switching workspaces updates settings correctly
- [ ] "Use personal key" button works
- [ ] All validation still works
- [ ] Delete keys works in both contexts

### Automated Testing

- [ ] Unit tests for permission helpers
- [ ] Integration tests for settings queries
- [ ] E2E tests for settings flow
- [ ] Test error handling

## 📖 Documentation

- [ ] Document API key scoping model
- [ ] Document admin permissions
- [ ] Add settings architecture diagram
- [ ] Update user guide
- [ ] Add admin guide

## 🐛 Known Issues

### Critical

- None yet

### Important

- Settings page is 693 lines - needs refactoring into components
- No loading states between workspace switches
- No optimistic updates

### Nice to Have

- Add settings version/migration system
- Add settings validation UI (show which settings are incomplete)

## 💡 Future Ideas

### Smart Features

- [ ] Auto-detect if Readwise key is same across workspaces
- [ ] Suggest Claude API key for org if user has personal key
- [ ] Settings recommendations based on usage
- [ ] Settings presets (e.g., "Recommended for teams")

### Integration Features

- [ ] Connect multiple Readwise accounts (different sources)
- [ ] Support other import sources (Kindle, etc.)
- [ ] Support other AI providers (GPT-4, etc.)

### Organization Features

- [ ] Organization-wide settings policies
- [ ] Force certain settings for all members
- [ ] Settings inheritance (org → team → user)

---

## 📝 Implementation Notes

### Current Architecture

**Personal Settings**:

```typescript
userSettings: {
  userId: Id<"users">,
  theme: "light" | "dark",
  claudeApiKey: string (encrypted),
  readwiseApiKey: string (encrypted),
  lastReadwiseSyncAt: number
}
```

**Organization Settings**:

```typescript
organizationSettings: {
  organizationId: Id<"organizations">,
  claudeApiKey: string (encrypted),
  createdAt: number,
  updatedAt: number
}
```

### Key Decisions

1. **Readwise is always user-scoped**
   - User owns their Readwise account
   - Can use same key in multiple workspaces
   - Each workspace tracks its own sync state

2. **Claude is workspace-scoped**
   - Personal workspace: optional personal key
   - Org workspace: org-owned key (admin controlled)
   - Clear cost attribution

3. **Theme is personal-only**
   - Applies across all workspaces
   - Not org-configurable (users choose their preference)

### Permission Model

**Personal Settings**:

- User can edit all their own settings

**Organization Settings**:

- Members: Can view (but not edit) org settings
- Admins: Can edit all org settings
- Owners: Can edit all org settings + delete org

---

**Last Updated**: 2025-11-07
**Status**: Minimal working version in progress
