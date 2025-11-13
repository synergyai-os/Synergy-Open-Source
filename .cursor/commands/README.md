# Cursor Commands - Optimization Summary

**Purpose**: Summary of command optimizations based on Cursor rules best practices.

---

## 📊 Optimization Results

| Command | Before | After | Reduction | Status |
|---------|--------|-------|-----------|--------|
| `/start` | 220 lines | 168 lines | 24% (52 lines) | ✅ Optimized |
| `/start-new-project` | 755 lines | 594 lines | 21% (161 lines) | ✅ Optimized |
| `/save` | 666 lines | 668 lines | +2 lines | ✅ Reference added |
| `/root-cause` | 65 lines | 65 lines | 0% | ✅ Already optimal |

**Total Reduction**: ~213 lines removed, replaced with references

---

## 🎯 Optimization Strategy

### Key Principle: Remove Duplication, Add References

**Before:**
- Commands duplicated Linear constants and workflows
- Same information in multiple places
- Harder to maintain (update in multiple files)

**After:**
- Single source of truth: `/linear` command
- Commands reference `/linear` instead of duplicating
- Easier to maintain (update once in `/linear`)

---

## 📋 Changes Made

### `/start` Command

**Removed:**
- Linear ticket management section (~52 lines)
  - AI responsibilities checklist
  - User responsibilities checklist
  - Ticket template format
  - Update workflow examples

**Added:**
- Reference to `/linear` command
- Reference to `.cursor/rules/working-with-linear.mdc` rule

**Result:** 24% reduction, clearer structure

---

### `/start-new-project` Command

**Removed:**
- Hardcoded Linear constants block (~48 lines)
- Detailed ticket management rules (~113 lines)
  - AI responsibilities
  - User responsibilities
  - Update workflow examples
  - Labeling rules

**Added:**
- Quick reference (team ID, user ID, estimate mapping)
- References to `/linear` command for complete details
- Prerequisites updated to include `/linear` command

**Result:** 21% reduction, focused on project workflow

---

### `/save` Command

**Added:**
- Reference to `/linear` command for Linear workflow

**Result:** Minimal change, better integration

---

### `/root-cause` Command

**Status:** Already optimal (65 lines, focused workflow)

---

## ✅ Benefits

1. **Single Source of Truth**: Linear constants/workflows in `/linear` command only
2. **Easier Maintenance**: Update Linear info once, not in multiple files
3. **Clearer Structure**: Commands focus on their specific workflows
4. **Better Discoverability**: References guide users to complete information
5. **Reduced Context**: Less duplication = less to read

---

## 📚 Command Organization

### Universal Commands (Always Available)

- **`/start`** - Onboarding (168 lines)
- **`/root-cause`** - Debug workflow (65 lines)

### Project Workflow Commands

- **`/start-new-project`** - New project setup (594 lines)
- **`/save`** - Knowledge capture (668 lines)

### Reference Commands

- **`/linear`** - Complete Linear workflow (366 lines)

---

## 🔍 Best Practices Applied

1. **Commands can be long** - Only loaded when invoked (not in every chat)
2. **Remove duplication** - Reference other commands/docs instead
3. **Keep focused** - Each command does one thing well
4. **Add references** - Guide users to complete information
5. **Maintain single source** - Update info once, reference everywhere

---

## 📖 Related Documentation

- **Rules**: `.cursor/rules/README.md` - Rules optimization guide
- **Linear**: `.cursor/commands/linear.md` - Complete Linear reference
- **Rules**: `.cursor/rules/working-with-linear.mdc` - Critical Linear rules

---

**Last Updated**: 2025-11-13  
**Purpose**: Document command optimizations and best practices
