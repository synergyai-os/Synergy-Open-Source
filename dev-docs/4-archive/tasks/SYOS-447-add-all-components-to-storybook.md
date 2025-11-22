# Add All Components to Storybook

**Linear Ticket**: [SYOS-447](https://linear.app/younghumanclub/issue/SYOS-447)

**Goal**: Create Storybook stories for all design system components to enable comprehensive visual regression testing, component documentation, and design system validation.

## Problem Analysis

**Current State**: 
- 7 components have stories (Button, Badge, Card, Chip, FormInput, Dialog, InboxCard)
- ~60+ components exist without stories
- Visual regression testing only covers 8 components (from SYOS-433)
- No comprehensive component documentation in Storybook

**Pain Points**:
- Can't catch visual regressions for most components
- Developers don't have component playground for testing variants
- Design system changes can't be validated across all components
- No centralized component documentation
- Hard to onboard new developers without component examples

**User Impact**: 
- Design system changes may break components without detection
- Slower development (no component playground)
- Inconsistent component usage across codebase
- Missing documentation for component variants and props

**Investigation**:

- ✅ Checked existing Storybook setup (`.storybook/main.ts`, `.storybook/preview.ts`)
- ✅ Reviewed existing story patterns (`ui-patterns.md#L4850`)
- ✅ Identified all component locations:
  - Atoms: 30+ components
  - Molecules: 20+ components  
  - Organisms: 15+ components
  - Module components: Various (InboxCard already done)
- ✅ Validated Storybook 10 + SvelteKit story format (`.svelte` files with snippets)

## Approach Options

### Approach A: Batch Creation by Priority (High → Low)

**How it works**: 
- Prioritize components by usage frequency and criticality
- Create stories in batches: Critical (8h) → High (16h) → Medium (8h) → Low (8h)
- Focus on most-used components first (Button, FormInput, Card already done)

**Pros**: 
- Delivers value incrementally
- Can validate approach early
- Focuses effort on high-impact components
- Easier to estimate and track progress

**Cons**: 
- Some components may never get stories
- Requires prioritization decisions
- May miss edge cases in less-used components

**Complexity**: Medium
**Dependencies**: Component usage analysis, prioritization criteria

**Estimated Time**: 40h total (8h batches)

### Approach B: Complete Coverage (All Components)

**How it works**: 
- Create stories for every component systematically
- Organize by layer (Atoms → Molecules → Organisms)
- Ensure 100% coverage

**Pros**: 
- Complete documentation
- Catches regressions everywhere
- No gaps in coverage
- Future-proof

**Cons**: 
- Large upfront time investment
- May include rarely-used components
- Harder to maintain if components change
- May create stories for components that get deprecated

**Complexity**: High
**Dependencies**: Complete component inventory, time allocation

**Estimated Time**: 60-80h total

### Approach C: Usage-Based Creation (Track Usage, Create Stories)

**How it works**: 
- Add usage tracking to components
- Create stories for components with >N usages
- Automatically prioritize based on actual usage

**Pros**: 
- Data-driven prioritization
- Focuses on components that matter
- Can evolve over time

**Cons**: 
- Requires usage tracking infrastructure
- Delays story creation
- May miss new components
- More complex setup

**Complexity**: High
**Dependencies**: Usage tracking system, analytics

**Estimated Time**: 20h setup + 40h story creation

## Recommendation

**Selected**: Approach A (Batch Creation by Priority)

**Reasoning**:

- **Incremental value**: Can deliver value after each batch
- **Validated approach**: We know `.svelte` story format works (from SYOS-433)
- **Pragmatic**: Focuses on components that matter most
- **Manageable**: 8h batches are easier to estimate and complete
- **Flexible**: Can adjust priorities based on feedback

**Trade-offs accepted**: 
- Not all components get stories immediately
- Requires prioritization decisions
- May need to revisit low-priority components later

**Risk assessment**: 
- **Low risk**: Story format is proven (SYOS-433)
- **Medium risk**: Prioritization may miss important components
- **Mitigation**: Review component usage in codebase before prioritizing

## Current State

**Existing Code**:

**Stories Already Created** (7 components):
- ✅ `Button.stories.svelte` - 6 variants
- ✅ `Badge.stories.svelte` - 3 variants
- ✅ `Card.stories.svelte` - 5 variants
- ✅ `Chip.stories.svelte` - 3 variants
- ✅ `FormInput.stories.svelte` - 6 variants
- ✅ `Dialog.stories.svelte` - 1 variant (needs more)
- ✅ `InboxCard.stories.svelte` - 6 variants (module component)

**Story Format**:
- Using `.svelte` files with `{#snippet template(args)}` syntax
- Pattern documented: `ui-patterns.md#L4850`
- Storybook 10 + SvelteKit compatible

**Component Inventory**:

**Atoms** (30+ components, ~15 need stories):
- ✅ Button, Badge, Card, Chip, FormInput (done)
- ⚠️ Tabs (has `.stories.ts` placeholder, needs conversion)
- ⚠️ Accordion (has `.stories.ts` placeholder, needs conversion)
- ❌ Text, Heading, Avatar, Icon, Loading, LoadingOverlay
- ❌ FormTextarea, PinInput, Checkbox, RadioGroup, Switch, Toggle
- ❌ Slider, Progress, Meter, Separator, ScrollArea, AspectRatio
- ❌ Tooltip, IconButton, SplitButton, StatusPill, KeyboardShortcut

**Molecules** (20+ components, all need stories):
- ❌ Form: DateField, DatePicker, DateRangeField, TimeField, Select, Combobox
- ❌ Menus: DropdownMenu, ContextMenu, Popover, ActionMenu
- ❌ Selectors: PrioritySelector, AssigneeSelector, ProjectSelector, ContextSelector
- ❌ Navigation: Pagination, PanelBreadcrumbs
- ❌ Other: MetadataBar, LinkPreview, RatingGroup, AttachmentButton, ToggleSwitch

**Organisms** (15+ components, ~13 need stories):
- ✅ Dialog (done, but needs more variants)
- ⚠️ Accordion (placeholder exists)
- ❌ AlertDialog, NavigationMenu, Menubar, Calendar, RangeCalendar
- ❌ Command, Collapsible, Toolbar, StackedPanel
- ❌ ErrorBoundary, RateLimitError, ResizableSplitter, SidebarToggle, ThemeToggle

**Module Components** (various, prioritize by usage):
- ✅ InboxCard (done)
- ❌ MeetingCard, Flashcard, QuickCreateModal, TagSelector, etc.

**Dependencies**:

- Storybook 10.0.8 (already installed)
- `@storybook/addon-svelte-csf` (already installed)
- `@storybook/addon-docs` (already installed)
- Design tokens (`src/app.css`) - already loaded in preview.ts
- Tailwind CSS - already configured

**Patterns**:

- Story format: `ui-patterns.md#L4850` - Use `.svelte` files with native snippets
- Component structure: Follow existing story examples (Button, Badge, etc.)
- Variant coverage: Include all variants, sizes, states per component

**Constraints**:

- Must use `.svelte` story format (not `.ts`)
- Must follow existing story structure
- Must include proper argTypes for Controls
- Must cover all component variants
- Complex components (Command, Calendar) may need multiple stories

## Technical Requirements

**Story Creation**:

For each component, create `ComponentName.stories.svelte` with:

1. **Meta configuration**:
   - Component reference
   - Title (e.g., `Atoms/Button`, `Molecules/DropdownMenu`)
   - Tags: `['autodocs']`
   - argTypes for all props

2. **Story variants**:
   - Default/primary variant
   - All size variants (if applicable)
   - All state variants (disabled, loading, error, etc.)
   - Edge cases (empty states, long text, etc.)

3. **Snippet template**:
   - Use `{#snippet template(args)}` syntax
   - Pass props via `{...args}`
   - Include children/snippets directly in template

**Priority Tiers**:

**Tier 1 - Critical** (8h estimate):
- Text, Heading (typography foundation)
- FormTextarea, PinInput (form inputs)
- Checkbox, RadioGroup, Switch (form controls)
- Loading, LoadingOverlay (loading states)
- Tooltip (interactive help)

**Tier 2 - High** (16h estimate):
- Avatar, Icon, IconButton (visual elements)
- Select, Combobox (form selectors)
- DropdownMenu, ContextMenu (menus)
- AlertDialog (modals)
- Accordion (convert existing placeholder)

**Tier 3 - Medium** (8h estimate):
- DateField, DatePicker, TimeField (date/time)
- Pagination, PanelBreadcrumbs (navigation)
- MetadataBar, LinkPreview (content)
- Calendar, RangeCalendar (complex forms)
- Command (command palette)

**Tier 4 - Low** (8h estimate):
- Remaining atoms (Slider, Progress, Meter, etc.)
- Remaining molecules (RatingGroup, AttachmentButton, etc.)
- Remaining organisms (Collapsible, Toolbar, etc.)
- Module components (as needed)

**File Structure**:

```
src/lib/components/
├── atoms/
│   ├── Text.stories.svelte (NEW)
│   ├── Heading.stories.svelte (NEW)
│   ├── Avatar.stories.svelte (NEW)
│   └── ...
├── molecules/
│   ├── Select.stories.svelte (NEW)
│   ├── DropdownMenu.stories.svelte (NEW)
│   └── ...
└── organisms/
    ├── AlertDialog.stories.svelte (NEW)
    ├── Accordion.stories.svelte (CONVERT from .ts)
    └── ...
```

**Testing**:

- Visual regression: Stories automatically tested via test-runner (SYOS-433)
- Manual validation: Check each story renders correctly
- Controls: Verify all props are controllable
- Variants: Verify all variants display correctly

## Success Criteria

**Functional**:

- ✅ All Tier 1 components have stories (10 components)
- ✅ All Tier 2 components have stories (10 components)
- ✅ Stories render correctly with proper styling
- ✅ All component variants covered
- ✅ Controls work for all props
- ✅ Visual regression tests pass

**Documentation**:

- ✅ Component props documented via argTypes
- ✅ Variant examples clear and comprehensive
- ✅ Usage examples in story descriptions
- ✅ Design token usage visible

**Quality**:

- ✅ Consistent story structure across all components
- ✅ Follows `.svelte` story format pattern
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Stories match component API

**Coverage**:

- ✅ Tier 1: 100% coverage
- ✅ Tier 2: 100% coverage
- ✅ Tier 3: 80%+ coverage
- ✅ Tier 4: As time permits

## Code Quality & Validation Strategy

**Svelte-specific validation** (implementing `.svelte` story files):

- ✅ Run `svelte-check` (type checking)
- ✅ Run ESLint (syntax rules)
- ✅ Run `svelte-autofixer` via Svelte MCP (best practices) ⭐
- ✅ Check Context7 for Storybook 10 + SvelteKit patterns (if <95% confident)
- ✅ Match against `ui-patterns.md#L4850` pattern

**Validation timing**:

- During `/go` implementation: Run after each story file
- Before commit: Run `/svelte-validate` on changed files
- During `/code-review`: Include validation findings

**Quality gates**:

- Critical issues: Must fix before merge
- Best practice suggestions: Should fix (non-blocking)
- Pattern matches: Document existing solutions used

**Story-specific checks**:

- ✅ Story file uses `.svelte` extension
- ✅ Uses `{#snippet template(args)}` syntax
- ✅ All variants render correctly
- ✅ Controls work for all props
- ✅ Design tokens applied correctly

## Implementation Checklist

### Phase 1: Tier 1 - Critical Components (8h)

- [ ] Convert `Tabs.stories.ts` → `Tabs.stories.svelte`
- [ ] Convert `Accordion.stories.ts` → `Accordion.stories.svelte`
- [ ] Create `Text.stories.svelte` (all variants: body, caption, label, etc.)
- [ ] Create `Heading.stories.svelte` (all sizes: h1-h6)
- [ ] Create `FormTextarea.stories.svelte` (default, required, disabled, error)
- [ ] Create `PinInput.stories.svelte` (verification code input)
- [ ] Create `Checkbox.stories.svelte` (default, checked, disabled, indeterminate)
- [ ] Create `RadioGroup.stories.svelte` (single select, multiple options)
- [ ] Create `Switch.stories.svelte` (on/off, disabled, labeled)
- [ ] Create `Loading.stories.svelte` (spinner, sizes)
- [ ] Create `LoadingOverlay.stories.svelte` (overlay with message)
- [ ] Create `Tooltip.stories.svelte` (positions, triggers)

### Phase 2: Tier 2 - High Priority (16h)

- [ ] Create `Avatar.stories.svelte` (sizes, fallbacks, images)
- [ ] Create `Icon.stories.svelte` (sizes, variants)
- [ ] Create `IconButton.stories.svelte` (sizes, variants, icon-only)
- [ ] Create `Select.stories.svelte` (single, multi, searchable)
- [ ] Create `Combobox.stories.svelte` (autocomplete, search)
- [ ] Create `DropdownMenu.stories.svelte` (menu items, submenus, separators)
- [ ] Create `ContextMenu.stories.svelte` (right-click menu)
- [ ] Create `AlertDialog.stories.svelte` (confirm, alert, destructive)
- [ ] Enhance `Dialog.stories.svelte` (add more variants: wide, fullscreen)
- [ ] Create `Separator.stories.svelte` (horizontal, vertical)

### Phase 3: Tier 3 - Medium Priority (8h)

- [ ] Create `DateField.stories.svelte` (date input, validation)
- [ ] Create `DatePicker.stories.svelte` (calendar popup)
- [ ] Create `TimeField.stories.svelte` (time input)
- [ ] Create `Pagination.stories.svelte` (page navigation)
- [ ] Create `PanelBreadcrumbs.stories.svelte` (navigation trail)
- [ ] Create `MetadataBar.stories.svelte` (badges, icons, metadata)
- [ ] Create `LinkPreview.stories.svelte` (URL preview cards)
- [ ] Create `Calendar.stories.svelte` (date selection)
- [ ] Create `RangeCalendar.stories.svelte` (date range)
- [ ] Create `Command.stories.svelte` (command palette)

### Phase 4: Tier 4 - Low Priority (8h, as time permits)

- [ ] Create remaining atom stories (Slider, Progress, Meter, etc.)
- [ ] Create remaining molecule stories (RatingGroup, AttachmentButton, etc.)
- [ ] Create remaining organism stories (Collapsible, Toolbar, etc.)
- [ ] Create module component stories (as needed)

### Validation & Cleanup

- [ ] Run visual regression tests on all new stories
- [ ] Verify all stories render correctly in Storybook
- [ ] Check Controls work for all props
- [ ] Remove any placeholder `.stories.ts` files
- [ ] Update Storybook navigation structure if needed
- [ ] Document any component-specific story patterns

## Design System Validation

**Source**: `design-system.json` (if exists)
**Implementation**: `src/app.css` (design tokens)

**Validation Steps**:

1. **Check token usage**: Verify stories use design tokens (not hardcoded values)
2. **Verify variants**: Ensure all component variants match design system spec
3. **Check spacing**: Verify padding/margins use semantic tokens
4. **Validate colors**: Ensure color variants match design system palette

**Findings**: (To be filled during implementation)

- ✅ Design tokens loaded in `.storybook/preview.ts`
- ⚠️ Need to verify component variants match design system spec
- ⚠️ Need to check if all tokens are available in Storybook context

## Notes

- **Story format**: Must use `.svelte` files with `{#snippet template(args)}` (proven in SYOS-433)
- **Complex components**: Some components (Command, Calendar) may need multiple stories for different use cases
- **Module components**: Prioritize by actual usage in codebase
- **Placeholder stories**: Convert existing `.stories.ts` placeholders first (Tabs, Accordion)
- **Visual regression**: Stories automatically tested via test-runner configured in SYOS-433

