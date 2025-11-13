# Marketing Page Spacing Guide

**Quick Reference**: How to use marketing spacing tokens for consistent, scalable pages.

---

## 🎯 Two Approaches

### **Approach 1: Utility Classes (Recommended for Most Pages)**

✅ **Use this for:** Blog posts, documentation, simple marketing pages

**Example:**

```html
<section class="py-marketing-section bg-surface">
  <div class="mx-auto max-w-5xl px-marketing-container">
    <h2 class="mb-marketing-title-to-lead text-center text-2xl font-bold text-primary">
      Features
    </h2>
    <p class="mb-marketing-content text-center text-lg text-secondary">
      Everything you need to succeed
    </p>
    <div class="grid grid-cols-1 gap-marketing-card md:grid-cols-3">
      <div class="p-marketing-card bg-elevated rounded-lg border border-base">
        <h3 class="mb-marketing-text text-lg font-semibold text-primary">Feature 1</h3>
        <p class="text-secondary">Description here...</p>
      </div>
      <!-- More cards... -->
    </div>
  </div>
</section>
```

**Benefits:**
- ✅ No `<style>` block needed
- ✅ Spacing visible in HTML
- ✅ Works across all pages
- ✅ Easy to copy/paste between pages
- ✅ Faster to build

---

### **Approach 2: CSS Variables (For Complex Custom Sections)**

✅ **Use this for:** Highly custom landing pages, unique one-off sections with complex styling

**Example (like current `+page.svelte`):**

```svelte
<section class="hero-section">
  <!-- Complex custom layout -->
</section>

<style>
  .hero-section {
    padding: var(--spacing-marketing-hero-y) 0 var(--spacing-marketing-hero-bottom) 0;
    background: linear-gradient(...);
    /* Other custom styling */
  }
</style>
```

**When to use:**
- ❌ **Don't use** for simple content pages
- ✅ **Do use** when you have complex gradients, animations, or unique layouts
- ✅ **Do use** when you need responsive breakpoints with custom behavior
- ✅ **Do use** for the main landing page (lots of custom styling)

---

## 📋 Available Utility Classes

### Section Padding

```html
<section class="py-marketing-section">     <!-- 7rem (112px) top/bottom -->
<section class="py-marketing-hero">        <!-- 5rem (80px) top -->
<section class="pb-marketing-hero">        <!-- 8rem (128px) bottom -->
```

### Container Padding

```html
<div class="px-marketing-container">      <!-- 1.5rem (24px) left/right -->
```

### Spacing Hierarchy

```html
<h2 class="mb-marketing-title-to-lead">   <!-- 1.5rem (24px) below title -->
<p class="mb-marketing-content">          <!-- 3rem (48px) below lead -->
<h3 class="mb-marketing-text">            <!-- 1rem (16px) below subheading -->
```

### Card Padding & Gaps

```html
<div class="p-marketing-card">            <!-- 2.5rem (40px) all sides -->
<div class="gap-marketing-card">          <!-- 2rem (32px) between cards -->
```

### Element Gaps

```html
<div class="gap-marketing-element">       <!-- 1.5rem (24px) related elements -->
<div class="gap-marketing-text">          <!-- 1rem (16px) text elements -->
<div class="gap-marketing-cta">           <!-- 1rem (16px) CTA buttons -->
<div class="gap-marketing-badge">         <!-- 0.75rem (12px) badges -->
<div class="gap-marketing-list">          <!-- 0.875rem (14px) list items -->
```

---

## 🚀 Quick Start Templates

### Simple Content Page

```html
<section class="py-marketing-section bg-surface">
  <div class="mx-auto max-w-4xl px-marketing-container">
    <h2 class="mb-marketing-title-to-lead text-center text-2xl font-bold text-primary">
      Section Title
    </h2>
    <p class="mb-marketing-content text-center text-lg text-secondary">
      Lead paragraph explaining the section.
    </p>
    <!-- Content here -->
  </div>
</section>
```

### Feature Grid

```html
<section class="py-marketing-section">
  <div class="mx-auto max-w-6xl px-marketing-container">
    <h2 class="mb-marketing-title-to-lead text-center text-2xl font-bold text-primary">
      Features
    </h2>
    <div class="grid grid-cols-1 gap-marketing-card md:grid-cols-3">
      <div class="p-marketing-card bg-elevated rounded-lg">
        <div class="mb-marketing-text text-3xl">🚀</div>
        <h3 class="mb-marketing-text text-lg font-semibold text-primary">Fast</h3>
        <p class="text-secondary">Lightning quick performance.</p>
      </div>
      <!-- More features... -->
    </div>
  </div>
</section>
```

### Hero Section

```html
<section class="py-marketing-hero pb-marketing-hero bg-surface">
  <div class="mx-auto max-w-4xl px-marketing-container text-center">
    <h1 class="mb-marketing-title-to-lead text-4xl font-bold text-primary md:text-5xl">
      Welcome to SynergyOS
    </h1>
    <p class="mb-marketing-content text-lg text-secondary">
      The open-source product operating system
    </p>
    <div class="flex flex-wrap justify-center gap-marketing-cta">
      <a href="/signup" class="rounded-lg bg-accent-primary px-8 py-3 text-white">
        Get Started
      </a>
      <a href="/docs" class="rounded-lg border-2 border-accent-primary px-8 py-3">
        Learn More
      </a>
    </div>
  </div>
</section>
```

---

## 🎨 Consistent Spacing Hierarchy

Every marketing page follows this rhythm:

```
┌─────────────────────────────────────┐
│  Section (py-marketing-section)     │ 7rem (112px) padding
│  ┌───────────────────────────────┐  │
│  │ Container (max-w + px)         │  │
│  │                                │  │
│  │ H2 Title                       │  │
│  │ ↓ mb-marketing-title-to-lead   │  │ 1.5rem (24px)
│  │ Lead Paragraph                 │  │
│  │ ↓ mb-marketing-content         │  │ 3rem (48px)
│  │ Content (grid, cards, etc.)    │  │
│  │   ↳ gap-marketing-card         │  │ 2rem (32px) between
│  │                                │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## ⚡ Migration Tips

### For New Pages
- ✅ Use utility classes from the start
- ✅ Copy templates from this guide
- ✅ No `<style>` blocks needed

### For Existing Pages (like `+page.svelte`)
- ⏸️ Keep current CSS variable approach (already working)
- ✅ Use utility classes for new sections you add
- 🔄 Gradually migrate sections when redesigning

**Don't rewrite working pages just to use utilities** - the CSS variable approach is fine for custom sections!

---

## 📊 Decision Tree

```
Need marketing page spacing?
│
├─ Simple content page? (blog, docs, simple landing)
│  └─ ✅ Use utility classes in HTML
│
├─ Complex custom section? (gradients, animations)
│  └─ ✅ Use CSS variables in <style>
│
└─ Already working with CSS variables?
   └─ ⏸️ Keep it! Don't rewrite unnecessarily
```

---

**Remember**: Both approaches use the same underlying tokens, so spacing stays consistent either way! 🎯

