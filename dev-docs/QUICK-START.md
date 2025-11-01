# Quick Start Guide for New Chat Sessions

## 🎯 What is Axon?

Knowledge retention app using the CODE framework (Collect → Organise → Distill → Express) to transform diverse content sources into study materials (flashcards, notes, templates).

## 📋 Essential Reading (In Order)

1. **`dev-docs/product-vision-and-plan.md`** - START HERE
   - Complete product vision, strategy, original plan
   - What we've accomplished
   - Current state
   - Next steps broken into focused tasks

2. **`.cursor/rules/way-of-working.mdc`** - CRITICAL RULES
   - Design token system (MANDATORY)
   - How to use spacing, colors, typography tokens
   - Never use hardcoded values

3. **`dev-docs/design-tokens.md`** - Token Reference
   - All available semantic tokens
   - Usage examples
   - Migration guides

4. **`dev-docs/architecture.md`** - Technical Details
   - Tech stack
   - Authentication architecture
   - Convex setup

5. **`dev-docs/production-checklist.md`** - Production Readiness
   - Critical security items
   - Recommended improvements
   - Tracking checklist

## 🚀 Recommended Next Task

**Task 1: Convex Schema Design** (from product-vision-and-plan.md)

## ⚠️ Critical Reminders

- **ALWAYS use semantic tokens** - Check way-of-working.mdc
- **Never hardcode** - `px-2`, `bg-gray-900`, `text-[10px]` are FORBIDDEN
- **User reviews first** - Never auto-process inbox items (save tokens)
- **Scalable design** - Inbox handles 100+ content types

## 📁 Key Files

- **Tokens**: `src/app.css` (all token definitions)
- **Components**: `src/lib/components/` (reusable components)
- **Routes**: `src/routes/inbox/`, `src/routes/flashcards/`
- **Schema**: `convex/schema.ts` (needs expansion)

## 💡 Starting a New Session?

1. Read `dev-docs/product-vision-and-plan.md`
2. Check `.cursor/rules/way-of-working.mdc`
3. Pick a focused task from the plan
4. Reference `dev-docs/design-tokens.md` when building UI

