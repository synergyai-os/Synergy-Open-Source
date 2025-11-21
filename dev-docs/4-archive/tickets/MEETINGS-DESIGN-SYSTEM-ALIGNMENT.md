# Meetings Module Design System Alignment Analysis

**Goal**: Align the Meetings module with the design system described in `design-system-test.json` while following the semantic token system in `app.css`.

---

## Current State Analysis

### ✅ What's Already Correct

The meetings module already follows many design system patterns:

1. **Semantic Color Tokens** (from `app.css`):
   - ✅ `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
   - ✅ `bg-surface-base`, `bg-surface-secondary`, `bg-surface-hover`
   - ✅ `border-border-base`, `border-border-subtle`
   - ✅ `bg-accent-primary`, `bg-accent-hover`

2. **Semantic Spacing Tokens** (from `app.css`):
   - ✅ `gap-inbox-list`, `gap-icon`
   - ✅ `px-inbox-card`, `py-inbox-card`
   - ✅ Some spacing follows the 8px base unit

3. **Dark Mode Support**:
   - ✅ All colors use CSS custom properties that adapt to `.dark` class

---

## 🔴 Design System Gaps

### 1. **Card Component Patterns** (from `design-system-test.json`)

**Design System Spec**:

```json
"cards": {
  "background": "white with subtle shadow",
  "borderRadius": "12-16px",
  "padding": "20-32px",
  "shadow": "0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  "hover": "subtle lift with increased shadow"
}
```

**Current Implementation** (`TodayMeetingCard.svelte`):

- ❌ Uses `rounded-lg` (8px) instead of 12-16px
- ❌ Uses `shadow-sm` instead of custom card shadow
- ❌ Uses `hover:shadow-md` instead of custom hover shadow
- ✅ Uses semantic padding tokens (`px-inbox-card`, `py-inbox-card`)

**Required Changes**:

1. Add card-specific tokens to `app.css`:

   ```css
   /* Card Component Tokens */
   --border-radius-card: 0.875rem; /* 14px - between 12-16px */
   --shadow-card: 0 2px 8px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.04);
   --shadow-card-hover: 0 4px 16px rgb(0 0 0 / 0.12), 0 2px 4px rgb(0 0 0 / 0.06);
   --spacing-card-padding-x: 1.25rem; /* 20px */
   --spacing-card-padding-y: 1.25rem; /* 20px */
   ```

2. Add utility classes to `app.css`:

   ```css
   @utility rounded-card {
   	border-radius: var(--border-radius-card);
   }
   @utility shadow-card {
   	box-shadow: var(--shadow-card);
   }
   @utility shadow-card-hover {
   	box-shadow: var(--shadow-card-hover);
   }
   @utility px-card {
   	padding-inline: var(--spacing-card-padding-x);
   }
   @utility py-card {
   	padding-block: var(--spacing-card-padding-y);
   }
   ```

3. Update components:

   ```svelte
   <!-- Before -->
   <div class="rounded-lg shadow-sm hover:shadow-md px-inbox-card py-inbox-card">

   <!-- After -->
   <div class="rounded-card shadow-card hover:shadow-card-hover px-card py-card">
   ```

---

### 2. **Button Component Patterns** (from `design-system-test.json`)

**Design System Spec**:

```json
"buttons": {
  "primary": {
    "borderRadius": "8px",
    "padding": "12px 24px",
    "fontSize": "14-16px",
    "fontWeight": "500-600"
  }
}
```

**Current Implementation** (`+page.svelte` line 262):

```svelte
<button class="flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2">
```

**Issues**:

- ❌ Uses `rounded-md` (6px) instead of 8px
- ✅ Uses semantic spacing (close: `px-4 py-2` = 16px x 8px)
- ❌ Missing semantic button tokens

**Required Changes**:

1. Add button tokens to `app.css`:

   ```css
   /* Button Component Tokens */
   --border-radius-button-primary: 0.5rem; /* 8px */
   --spacing-button-primary-x: 1.5rem; /* 24px */
   --spacing-button-primary-y: 0.75rem; /* 12px */
   --font-size-button: 0.875rem; /* 14px */
   --font-weight-button: 600;
   ```

2. Add utility classes:

   ```css
   @utility rounded-button-primary {
   	border-radius: var(--border-radius-button-primary);
   }
   @utility px-button-primary {
   	padding-inline: var(--spacing-button-primary-x);
   }
   @utility py-button-primary {
   	padding-block: var(--spacing-button-primary-y);
   }
   @utility text-button {
   	font-size: var(--font-size-button);
   	font-weight: var(--font-weight-button);
   }
   ```

3. Update all buttons:

   ```svelte
   <!-- Before -->
   <button class="rounded-md px-4 py-2 text-sm font-medium">

   <!-- After -->
   <button class="rounded-button-primary px-button-primary py-button-primary text-button">
   ```

---

### 3. **Badge Component Patterns** (from `design-system-test.json`)

**Design System Spec**:

```json
"badges": {
  "borderRadius": "4-6px",
  "padding": "4px 8px",
  "fontSize": "12px",
  "fontWeight": "500"
}
```

**Current Implementation**:

- ⚠️ Not consistently applied
- ❌ Missing badge-specific tokens

**Required Changes**:

1. Add badge tokens to `app.css` (already partially exist):

   ```css
   /* Badge Component Tokens */
   --border-radius-badge: 0.25rem; /* 4px */
   --spacing-badge-x: 0.5rem; /* 8px */
   --spacing-badge-y: 0.25rem; /* 4px */
   --font-size-badge: 0.75rem; /* 12px */
   --font-weight-badge: 500;
   ```

2. Add utility classes:
   ```css
   @utility rounded-badge {
   	border-radius: var(--border-radius-badge);
   }
   @utility px-badge {
   	padding-inline: var(--spacing-badge-x);
   }
   @utility py-badge {
   	padding-block: var(--spacing-badge-y);
   }
   @utility text-badge {
   	font-size: var(--font-size-badge);
   	font-weight: var(--font-weight-badge);
   }
   ```

---

### 4. **Spacing Consistency** (from `design-system-test.json`)

**Design System Spec**:

```json
"spacing": {
  "scale": "8px base unit (0.5rem)",
  "containerPadding": {
    "mobile": "16px",
    "tablet": "24px",
    "desktop": "32px"
  }
}
```

**Current Implementation** (`+page.svelte`):

- ✅ Uses `max-w-6xl` for container
- ❌ Uses `px-6` (24px) - hardcoded, not responsive
- ❌ Uses `py-6` (24px) - hardcoded, not responsive
- ❌ Inconsistent spacing values (px-4, px-6, py-4, py-6)

**Required Changes**:

1. Add container tokens to `app.css`:

   ```css
   /* Container Spacing Tokens - Responsive */
   --spacing-container-x: 1rem; /* 16px mobile */
   --spacing-container-y: 1rem; /* 16px mobile */
   --max-width-container: 72rem; /* 1152px - 6xl */

   @media (min-width: 768px) {
   	--spacing-container-x: 1.5rem; /* 24px tablet */
   	--spacing-container-y: 1.5rem; /* 24px tablet */
   }

   @media (min-width: 1024px) {
   	--spacing-container-x: 2rem; /* 32px desktop */
   	--spacing-container-y: 2rem; /* 32px desktop */
   }
   ```

2. Add utility classes:

   ```css
   @utility px-container {
   	padding-inline: var(--spacing-container-x);
   }
   @utility py-container {
   	padding-block: var(--spacing-container-y);
   }
   @utility max-w-container {
   	max-width: var(--max-width-container);
   }
   ```

3. Update page layout:

   ```svelte
   <!-- Before -->
   <div class="mx-auto max-w-6xl px-6 py-6">

   <!-- After -->
   <div class="mx-auto max-w-container px-container py-container">
   ```

---

### 5. **Typography Scale** (from `design-system-test.json`)

**Design System Spec**:

```json
"typography": {
  "h1": { "size": "36-48px", "weight": "700" },
  "h2": { "size": "28-36px", "weight": "600-700" },
  "h3": { "size": "20-24px", "weight": "600" },
  "body": { "size": "16px", "weight": "400" },
  "small": { "size": "14px", "weight": "400-500" }
}
```

**Current Implementation**:

- ✅ Uses Tailwind size classes (`text-2xl`, `text-lg`, `text-sm`)
- ❌ Not using semantic typography tokens

**Required Changes**:

1. Add typography tokens to `app.css`:

   ```css
   /* Typography Scale Tokens */
   --font-size-h1: 2.25rem; /* 36px */
   --font-size-h2: 1.75rem; /* 28px */
   --font-size-h3: 1.25rem; /* 20px */
   --font-size-body: 1rem; /* 16px */
   --font-size-small: 0.875rem; /* 14px */
   --font-weight-h1: 700;
   --font-weight-h2: 600;
   --font-weight-h3: 600;
   ```

2. Add utility classes:
   ```css
   @utility text-h1 {
   	font-size: var(--font-size-h1);
   	font-weight: var(--font-weight-h1);
   }
   @utility text-h2 {
   	font-size: var(--font-size-h2);
   	font-weight: var(--font-weight-h2);
   }
   @utility text-h3 {
   	font-size: var(--font-size-h3);
   	font-weight: var(--font-weight-h3);
   }
   ```

---

### 6. **Icon Sizing** (from `design-system-test.json`)

**Design System Spec**:

```json
"icons": {
  "sizes": ["16px", "20px", "24px", "32px"]
}
```

**Current Implementation**:

- ❌ Inconsistent icon sizes: `h-4 w-4` (16px), `h-5 w-5` (20px), `h-6 w-6` (24px), `h-12 w-12` (48px)
- ❌ Not using semantic icon tokens

**Required Changes**:

1. Add icon tokens to `app.css`:

   ```css
   /* Icon Size Tokens */
   --size-icon-sm: 1rem; /* 16px */
   --size-icon-md: 1.25rem; /* 20px */
   --size-icon-lg: 1.5rem; /* 24px */
   --size-icon-xl: 2rem; /* 32px */
   ```

2. Add utility classes:
   ```css
   @utility icon-sm {
   	width: var(--size-icon-sm);
   	height: var(--size-icon-sm);
   }
   @utility icon-md {
   	width: var(--size-icon-md);
   	height: var(--size-icon-md);
   }
   @utility icon-lg {
   	width: var(--size-icon-lg);
   	height: var(--size-icon-lg);
   }
   @utility icon-xl {
   	width: var(--size-icon-xl);
   	height: var(--size-icon-xl);
   }
   ```

---

### 7. **Transition/Animation Patterns** (from `design-system-test.json`)

**Design System Spec**:

```json
"transitions": {
  "default": "all 0.2s ease",
  "slow": "all 0.3s ease-in-out",
  "fast": "all 0.15s ease"
}
```

**Current Implementation**:

- ✅ Uses `transition-colors` in some places
- ❌ Not using semantic transition tokens
- ❌ Inconsistent transition durations

**Required Changes**:

1. Add transition tokens to `app.css`:

   ```css
   /* Transition Tokens */
   --transition-default: all 0.2s ease;
   --transition-slow: all 0.3s ease-in-out;
   --transition-fast: all 0.15s ease;
   --transition-colors: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
   ```

2. Add utility classes:
   ```css
   @utility transition-default {
   	transition: var(--transition-default);
   }
   @utility transition-slow {
   	transition: var(--transition-slow);
   }
   @utility transition-fast {
   	transition: var(--transition-fast);
   }
   @utility transition-colors-token {
   	transition: var(--transition-colors);
   }
   ```

---

## 📋 Implementation Checklist

### Phase 1: Add Missing Tokens to `app.css`

- [ ] **Card Component Tokens**
  - [ ] `--border-radius-card: 0.875rem`
  - [ ] `--shadow-card`, `--shadow-card-hover`
  - [ ] `--spacing-card-padding-x`, `--spacing-card-padding-y`
  - [ ] Utility classes: `rounded-card`, `shadow-card`, `px-card`, `py-card`

- [ ] **Button Component Tokens**
  - [ ] `--border-radius-button-primary: 0.5rem`
  - [ ] `--spacing-button-primary-x`, `--spacing-button-primary-y`
  - [ ] `--font-size-button`, `--font-weight-button`
  - [ ] Utility classes: `rounded-button-primary`, `px-button-primary`, `text-button`

- [ ] **Badge Component Tokens** (enhance existing)
  - [ ] `--border-radius-badge: 0.25rem`
  - [ ] `--font-size-badge`, `--font-weight-badge`
  - [ ] Utility classes: `rounded-badge`, `text-badge`

- [ ] **Container Spacing Tokens** (responsive)
  - [ ] `--spacing-container-x`, `--spacing-container-y` (with media queries)
  - [ ] `--max-width-container`
  - [ ] Utility classes: `px-container`, `py-container`, `max-w-container`

- [ ] **Typography Scale Tokens**
  - [ ] `--font-size-h1/h2/h3`, `--font-weight-h1/h2/h3`
  - [ ] Utility classes: `text-h1`, `text-h2`, `text-h3`

- [ ] **Icon Size Tokens**
  - [ ] `--size-icon-sm/md/lg/xl`
  - [ ] Utility classes: `icon-sm`, `icon-md`, `icon-lg`, `icon-xl`

- [ ] **Transition Tokens**
  - [ ] `--transition-default/slow/fast/colors`
  - [ ] Utility classes: `transition-default`, `transition-colors-token`

### Phase 2: Update Meetings Page Components

- [ ] **`+page.svelte`** (Main meetings page)
  - [ ] Replace `px-6 py-6` with `px-container py-container`
  - [ ] Replace `max-w-6xl` with `max-w-container`
  - [ ] Replace `rounded-md` buttons with `rounded-button-primary px-button-primary py-button-primary`
  - [ ] Replace `h-X w-X` icon classes with `icon-sm/md/lg/xl`
  - [ ] Replace `text-2xl` with `text-h1`, `text-lg` with `text-h2`
  - [ ] Replace `transition-colors` with `transition-colors-token`

- [ ] **`MeetingCard.svelte`**
  - [ ] Replace custom spacing with semantic tokens
  - [ ] Replace `hover:bg-surface-hover` with proper transition token
  - [ ] Replace icon sizes with `icon-sm/md/lg`

- [ ] **`TodayMeetingCard.svelte`**
  - [ ] Replace `rounded-lg` with `rounded-card`
  - [ ] Replace `shadow-sm hover:shadow-md` with `shadow-card hover:shadow-card-hover`
  - [ ] Replace `px-inbox-card py-inbox-card` with `px-card py-card`
  - [ ] Replace icon sizes with `icon-sm/md/lg`

- [ ] **`CreateMeetingModal.svelte`**
  - [ ] Apply modal-specific tokens (if needed)
  - [ ] Replace buttons with semantic button tokens

### Phase 3: Validate & Test

- [ ] **Visual Regression Testing**
  - [ ] Compare before/after screenshots
  - [ ] Verify dark mode support
  - [ ] Test responsive breakpoints (mobile, tablet, desktop)

- [ ] **Token Coverage Audit**
  - [ ] Grep for hardcoded values: `px-[0-9]`, `py-[0-9]`, `h-[0-9] w-[0-9]`, `rounded-[a-z]`, `text-[a-z]xl`
  - [ ] Ensure all spacing, colors, sizes use semantic tokens

- [ ] **Design System Compliance**
  - [ ] Cards match spec (12-16px border radius, proper shadows)
  - [ ] Buttons match spec (8px border radius, 12px x 24px padding)
  - [ ] Badges match spec (4-6px border radius, 12px font size)
  - [ ] Typography matches scale (h1: 36px, h2: 28px, h3: 20px)
  - [ ] Icons use standard sizes (16px, 20px, 24px, 32px)

---

## 🎯 Expected Outcome

After completing this alignment:

1. **Consistency**: All meetings components use the same design system tokens as the rest of the app
2. **Maintainability**: Changes to the design system (e.g., updating card shadows) only require editing `app.css`
3. **Scalability**: New components can easily adopt the same patterns
4. **Design System Compliance**: Meetings module matches the patterns described in `design-system-test.json`
5. **Dark Mode**: All components continue to work perfectly in light/dark modes
6. **Responsive**: Spacing adapts properly to mobile, tablet, and desktop breakpoints

---

## 💡 Key Design System Principles

From `design-system-test.json`:

1. **8px Base Unit**: All spacing should be multiples of 8px (0.5rem)
2. **Semantic Naming**: Use descriptive names (`px-card` not `px-5`)
3. **Consistent Shadows**: Cards use `shadow-card`, hover uses `shadow-card-hover`
4. **Proper Transitions**: All interactive elements use `transition-colors-token` or `transition-default`
5. **Icon Consistency**: Stick to 16px, 20px, 24px, 32px sizes
6. **Typography Hierarchy**: Use `text-h1/h2/h3` for headings, not `text-2xl/lg/xl`

---

## 📚 Related Documentation

- **Design System**: `design-system-test.json` - Complete design system specification
- **Design Tokens**: `src/app.css` - Token definitions and utility classes
- **Coding Standards**: `dev-docs/2-areas/development/coding-standards.md` - Token usage rules
- **Component Architecture**: `dev-docs/2-areas/component-architecture.md` - Design system layers

---

**Status**: Ready for implementation
**Priority**: Medium (improves consistency and maintainability)
**Estimated Effort**: 4-6 hours (1-2 hours tokens, 2-3 hours component updates, 1 hour testing)
