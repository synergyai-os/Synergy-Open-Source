# Design Principles

> **Visual Philosophy**: Functional, calm, and purposeful—designed for focus, clarity, and accessibility. Every design decision prioritizes user outcomes over aesthetic trends.

> **See Also**:
>
> - [Component Architecture](component-architecture.md) - Implementation strategy (Tokens → Utilities → Patterns → Components)
> - [Design Tokens](design-tokens.md) - System reference (spacing, colors, typography)

---

## Core Design Values (In Order of Priority)

### 1. 🧘 Clarity Over Decoration

**Remove the unnecessary, keep the essential.**

- Every element serves a purpose
- No decoration for decoration's sake
- Visual hierarchy guides attention
- White space is intentional

**Why First**: If it's not clear, it's not usable.

**In Practice**:

- ✅ Use semantic spacing tokens (not arbitrary pixel values)
- ✅ Limit visual elements to functional ones
- ✅ Clear labels, no jargon
- ❌ Don't add gradients, shadows, or effects unless solving a problem

---

### 2. ♿ Accessible by Default

**Design for the edges, benefit the middle.**

- WCAG 2.1 AA minimum (AAA where possible)
- Optimized for ADHD and focus-challenged users
- Keyboard navigation first-class
- Screen reader friendly

**Why This Matters**: Accessibility isn't a feature—it's foundational.

**In Practice**:

- ✅ Sufficient color contrast (4.5:1 text, 3:1 UI)
- ✅ ADHD-friendly readability (line-height 1.75, max-width 42rem)
- ✅ Keyboard shortcuts for all actions
- ✅ Proper ARIA labels and roles
- ❌ Don't rely on color alone for meaning
- ❌ Don't trap keyboard focus

**See**: [Readability Tokens](design-tokens.md#readability-tokens)

---

### 3. 🎨 Consistent Over Novel

**Same problems, same solutions.**

- Design system over one-offs
- Reuse patterns across contexts
- Predictable interactions
- Visual rhythm through repetition

**Why**: Consistency reduces cognitive load—users learn once, apply everywhere.

**In Practice**:

- ✅ Use design tokens (never hardcode)
- ✅ Reuse documented patterns
- ✅ Follow established component structure
- ❌ Don't create custom spacing for one component
- ❌ Don't introduce new interaction patterns without documenting

**See**: [Component Architecture](component-architecture.md)

---

### 4. 🚀 Performance is Design

**Fast feels better than pretty.**

- Optimistic UI updates (instant feedback)
- Progressive enhancement
- Minimal bundle size
- Perceived performance > actual performance

**Why**: A slow beautiful UI feels worse than a fast plain UI.

**In Practice**:

- ✅ Show loading states immediately
- ✅ Animate perceived progress (not just spinners)
- ✅ Use CSS over JavaScript for animations
- ✅ Lazy-load heavy components
- ❌ Don't block interactions during loading
- ❌ Don't use heavy libraries for simple effects

---

### 5. 🎯 Mobile-First, Desktop-Enhanced

**Design for constraints, enhance for space.**

- Touch targets 44x44px minimum
- Mobile gestures (swipe, pinch)
- Responsive breakpoints intentional
- Progressive disclosure on small screens

**Why**: Mobile usage is primary for many users—desktop shouldn't be an afterthought for mobile design.

**In Practice**:

- ✅ Start with mobile layout
- ✅ Test on real devices (not just DevTools)
- ✅ Touch-friendly targets and spacing
- ❌ Don't hide critical features on mobile
- ❌ Don't assume mouse/hover availability

---

## Visual Design Principles

### Typography

**Hierarchy Through Size & Weight**:

- H1 (Page Title): Bold, prominent (text-2xl or larger)
- H2 (Section): Medium weight (text-xl)
- H3 (Subsection): Normal weight, slightly larger (text-lg)
- Body: Readable (text-sm to text-base)
- Label: Small, uppercase, letterspaced (text-label)

**Readability First**:

- Line-height: 1.75 for long-form content (ADHD-friendly)
- Max-width: 42rem (65-75 characters per line)
- Generous padding around text blocks
- Never less than 14px for body text

**Font Stack**:

- System fonts (instant load, native feel)
- Fallbacks for consistency

**See**: [Design Tokens > Typography](design-tokens.md#typography)

---

### Color & Contrast

**Semantic Color System**:

- `text-primary`: Main content (high contrast)
- `text-secondary`: Supporting text (medium contrast)
- `text-tertiary`: Subtle hints (lower contrast)
- `accent-primary`: Interactive elements, CTAs
- `bg-elevated`: Layers and depth (not shadows)

**Dark Mode Support**:

- All colors defined as tokens with light/dark variants
- Automatic adaptation (no manual switching)
- OKLCH color space (perceptually uniform)

**Contrast Requirements**:

- Body text: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum
- Aim for AAA where possible (7:1 text, 4.5:1 UI)

**See**: [Design Tokens > Colors](design-tokens.md#colors)

---

### Spacing & Rhythm

**4px Base Grid**:

- All spacing multiples of 4px (0.25rem)
- Creates visual rhythm
- Predictable, harmonious layout

**Semantic Spacing**:

- `px-nav-item`, `py-nav-item`: Navigation elements
- `px-inbox-container`, `py-inbox-container`: Content padding
- `gap-icon`: Icon-to-text spacing
- `pl-indent`: Nested/hierarchical content

**Vertical Rhythm**:

- Consistent gaps between sections
- Breathing room around interactive elements
- Generous padding in control panels (12px+)

**Why Tokens?**:

- Change once, update everywhere
- Self-documenting (semantic names)
- Enforces consistency

**See**: [Design Tokens > Spacing](design-tokens.md#spacing)

---

### Layout & Structure

**Three-Column Pattern**:

- Left: Navigation/Sidebar (260px)
- Center: Main content (flexible)
- Right: Metadata/Actions (260px)

**Floating Panels**:

- Subtle glass effect (backdrop-filter: blur)
- Minimal borders (1px, subtle)
- Soft shadows (not heavy drop-shadows)
- Collapsible/expandable states

**Scrollable Containers**:

- Padding on outer, overflow on inner
- Scrollbar positioned inside padding (15-20px from edge)
- Never nest overflow containers

**See**: [Scrollable Container Pattern](design-tokens.md#scrollable-container-pattern)

---

### Motion & Animation

**Purposeful Motion Only**:

- Animations explain state changes
- Guide attention (not distract)
- Fast by default (200-300ms)
- Respect `prefers-reduced-motion`

**Animation Types**:

- **Micro-interactions**: Button hover, focus states (100-150ms)
- **Transitions**: Panel open/close, tab switching (200-300ms)
- **Feedback**: Success/error confirmations (300-400ms)
- **Loading**: Progressive states (not spinners only)

**Easing Functions**:

- `ease-out`: Element enters (decelerates)
- `ease-in`: Element exits (accelerates)
- `ease-in-out`: State changes (smooth)
- `cubic-bezier(0.34, 1.56, 0.64, 1)`: Bouncy feedback (sparingly)

**In Practice**:

- ✅ Fade in content (prevents jarring appearance)
- ✅ Slide panels from edge (reinforces directionality)
- ✅ Stagger list item entrance (visual rhythm)
- ❌ Don't animate everything
- ❌ Don't use slow animations (feels sluggish)

---

### Iconography

**Icon System**:

- 16x16px or 24x24px (consistent sizing)
- 2px stroke weight (medium)
- Round linecaps and joins (friendly)
- Align to 4px grid

**Usage**:

- Icons clarify, not decorate
- Always paired with labels (or ARIA labels)
- Color inherits from text (consistency)

**Icon-Text Spacing**:

- `gap-icon`: 8px standard
- `gap-icon-wide`: 10px generous

---

## User Experience Principles

### Progressive Disclosure

**Show what's needed now, reveal more on demand.**

- Primary actions prominent
- Secondary actions accessible but subtle
- Advanced features hidden until needed
- Collapsed states for panels/sidebars

**Example**: TOC panel—collapsed to stripes, expands on hover.

---

### Immediate Feedback

**Every action gets a reaction.**

- Optimistic UI updates (instant response)
- Loading states for async operations
- Success/error confirmations
- Undo/redo where possible

**In Practice**:

- ✅ Show loading skeleton immediately
- ✅ Disable button on click (prevent double-submit)
- ✅ Show success toast (confirm action)
- ❌ Don't leave users guessing if something worked

---

### Keyboard-First Interactions

**Mouse is optional, keyboard is required.**

- All features accessible via keyboard
- Visible focus indicators
- Logical tab order
- Keyboard shortcuts for power users (J/K navigation)

**In Practice**:

- ✅ Test entire flow with keyboard only
- ✅ Show focus rings (don't hide them)
- ✅ Document shortcuts in UI
- ❌ Don't trap focus in modals without escape

---

### Forgiving Errors

**Make it hard to break, easy to fix.**

- Confirmation for destructive actions
- Undo for reversible actions
- Clear error messages (what went wrong, how to fix)
- Prevent errors over handling errors

**In Practice**:

- ✅ Confirm before deleting
- ✅ Show what went wrong ("API key invalid" not "Error 400")
- ✅ Offer solutions ("Check your API key in Settings")
- ❌ Don't show cryptic error codes
- ❌ Don't lose user data on errors

---

## Component Design Checklist

**Before building a component:**

- [ ] Does it follow atomic design? (Single responsibility)
- [ ] Uses design tokens? (No hardcoded values)
- [ ] Accessible? (Keyboard, screen reader, contrast)
- [ ] Responsive? (Mobile-first layout)
- [ ] Consistent? (Matches existing patterns)

**When building a component:**

- [ ] Semantic HTML (buttons, not divs with onclick)
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Loading states defined
- [ ] Error states handled
- [ ] Animations respect `prefers-reduced-motion`

**After building a component:**

- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Test on mobile device
- [ ] Verify color contrast
- [ ] Document in component library

---

## Anti-Patterns

### ❌ Don't

1. **Hardcode Values**
   - `px-2`, `bg-gray-900`, `text-[14px]`
   - Breaks consistency, dark mode, maintainability

2. **Rely on Color Alone**
   - Red text for errors without icon/label
   - Inaccessible for colorblind users

3. **Hide Functionality**
   - Important features only on desktop
   - Critical actions hidden in menus

4. **Ignore Keyboard Users**
   - No focus indicators
   - Broken tab order
   - Mouse-only interactions

5. **Skimp on Contrast**
   - Light gray text on white background
   - Fails WCAG, hard to read

6. **Over-Animate**
   - Everything fades/slides
   - Slow animations (>300ms)
   - Ignores `prefers-reduced-motion`

### ✅ Do

1. **Use Semantic Tokens**
   - `px-nav-item`, `bg-elevated`, `text-primary`
   - Automatic dark mode, global updates

2. **Multi-Modal Feedback**
   - Icon + color + label for status
   - Accessible to all users

3. **Progressive Enhancement**
   - Core features work everywhere
   - Enhanced experience where supported

4. **Keyboard-First Design**
   - Visible focus states
   - Logical tab order
   - Shortcuts documented

5. **Sufficient Contrast**
   - 4.5:1 text, 3:1 UI (WCAG AA minimum)
   - Test with contrast checker

6. **Purposeful Motion**
   - Fast by default (200-300ms)
   - Respect motion preferences
   - Animate state changes only

---

## Quality Checklist

### Accessibility (Must-Have)

- [ ] Color contrast passes WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Keyboard navigation works for all interactions
- [ ] Focus indicators visible and clear
- [ ] ARIA labels on interactive elements
- [ ] Screen reader tested (basic flows)
- [ ] Touch targets 44x44px minimum

### Performance (Must-Have)

- [ ] Instant feedback on interactions
- [ ] Loading states shown immediately
- [ ] CSS animations over JavaScript
- [ ] Lazy-load heavy components
- [ ] Bundle size monitored

### Responsiveness (Must-Have)

- [ ] Mobile-first design tested on real devices
- [ ] Breakpoints intentional (not arbitrary)
- [ ] Touch-friendly spacing and targets
- [ ] No horizontal scrolling (unless intentional)

### Consistency (Must-Have)

- [ ] Design tokens used (no hardcoded values)
- [ ] Documented patterns followed
- [ ] Same problem, same solution
- [ ] Visual rhythm maintained

---

## Design Review Process

### Self-Review (Designer)

1. **Accessibility**: Contrast, keyboard, ARIA labels
2. **Consistency**: Tokens, patterns, existing components
3. **Responsiveness**: Mobile, tablet, desktop
4. **Performance**: Animation speed, bundle size

### Peer Review (Team)

1. **Usability**: Clear purpose, intuitive interactions
2. **Feasibility**: Can we build this with existing tools?
3. **Maintainability**: Will this scale? Easy to update?

### User Testing (Optional, for major features)

1. **Task completion**: Can users accomplish goals?
2. **Confusion points**: Where do they get stuck?
3. **Accessibility**: Test with assistive technology

---

## When Principles Conflict

**Priority Order**:

1. **Accessibility** > Everything else
2. **Clarity** > Aesthetics
3. **Consistency** > Novelty
4. **Performance** > Features
5. **Mobile** > Desktop

**Example Conflicts**:

**Conflict: "Beautiful animation vs. performance"**

- ❌ NO - Violates Performance is Design (principle #4)
- ✅ Simplify animation or use CSS over JavaScript

**Conflict: "Unique component vs. design system"**

- ❌ NO - Violates Consistent Over Novel (principle #3)
- ✅ Extend existing component or justify new pattern

**Conflict: "Desktop-first layout vs. mobile constraints"**

- ❌ NO - Violates Mobile-First (principle #5)
- ✅ Start with mobile, enhance for desktop

---

## Related

- **[Component Architecture](component-architecture.md)** - Implementation strategy (Tokens → Utilities → Patterns → Components)
- **[Design Tokens](design-tokens.md)** - System reference (spacing, colors, typography)
- **[UI Patterns](patterns/ui-patterns.md)** - Solved design problems
- **[Product Principles](product-principles.md)** - How we make product decisions
- **[Component Library](component-library/README.md)** - Component catalog _(coming soon)_

---

## Further Reading

### Accessibility

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- [ADHD-Friendly Design](https://uxdesign.cc/designing-for-adhd-5e4e1c16d5f3)

### Typography

- [Practical Typography](https://practicaltypography.com/)
- [The Elements of Typographic Style](http://webtypography.net/)

### Color

- [OKLCH Color Space](https://oklch.com/)
- [Color Contrast Checker](https://colourcontrast.cc/)

### Motion

- [Motion Design Principles](https://material.io/design/motion/understanding-motion.html)
- [Animation Timing](https://www.nngroup.com/articles/animation-usability/)

---

**Last Updated**: November 8, 2025  
**Status**: 🟢 Active  
**Owner**: Randy (Founder)
