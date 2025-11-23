# Color System Architecture

**Purpose**: Document how colors are structured in our design system and how to add brand colors (e.g., orange as primary).

**Status**: Current system uses hardcoded values. Recommended: Base palette + semantic references.

---

## Current Architecture (Direct Values)

**Current approach**: Semantic tokens have hardcoded OKLCH values.

```json
{
  "color": {
    "accent": {
      "primary": {
        "$value": "oklch(55.4% 0.218 251.813)",
        "$description": "blue-600 - for selected states"
      }
    }
  }
}
```

**Limitation**: Changing brand color requires updating multiple semantic tokens manually.

---

## Recommended Architecture (Base Palette + References)

**Best practice** (per DTCG): Base color palette → semantic colors reference base.

### Structure

```json
{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "oklch(65% 0.15 60)",
        "$description": "Brand primary color (orange) - base palette"
      },
      "primaryHover": {
        "$type": "color",
        "$value": "oklch(55% 0.15 60)",
        "$description": "Brand primary hover state"
      }
    },
    "palette": {
      "orange": {
        "400": {
          "$type": "color",
          "$value": "oklch(75% 0.15 60)",
          "$description": "orange-400 - lighter shade"
        },
        "500": {
          "$type": "color",
          "$value": "oklch(65% 0.15 60)",
          "$description": "orange-500 - base shade"
        },
        "600": {
          "$type": "color",
          "$value": "oklch(55% 0.15 60)",
          "$description": "orange-600 - darker shade"
        }
      }
    },
    "accent": {
      "primary": {
        "$value": "{color.brand.primary}",
        "$description": "Primary accent - references brand primary"
      },
      "hover": {
        "$value": "{color.brand.primaryHover}",
        "$description": "Accent hover - references brand primary hover"
      }
    },
    "bg": {
      "selected": {
        "$value": "{color.brand.primary}",
        "$description": "Selected state - references brand primary"
      }
    }
  }
}
```

### Benefits

✅ **Cascade behavior**: Change `color.brand.primary` once → all semantic tokens update automatically  
✅ **Scalable**: Add color scales (400, 500, 600) for variations  
✅ **Maintainable**: Single source of truth for brand colors  
✅ **DTCG compliant**: Follows industry-standard token structure  

---

## Migration Path: Adding Orange as Primary

### Step 1: Add Base Brand Colors

```json
{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "oklch(65% 0.15 60)",
        "$description": "Brand primary color (orange) - base palette"
      },
      "primaryHover": {
        "$type": "color",
        "$value": "oklch(55% 0.15 60)",
        "$description": "Brand primary hover state (darker orange)"
      }
    }
  }
}
```

### Step 2: Update Semantic Tokens to Reference Base

```json
{
  "color": {
    "accent": {
      "primary": {
        "$value": "{color.brand.primary}",
        "$description": "Primary accent - references brand primary"
      },
      "hover": {
        "$value": "{color.brand.primaryHover}",
        "$description": "Accent hover - references brand primary hover"
      }
    },
    "bg": {
      "selected": {
        "$value": "{color.brand.primary}",
        "$description": "Selected state - references brand primary"
      }
    }
  }
}
```

### Step 3: Build Tokens

```bash
npm run tokens:build
```

**Result**: All semantic tokens (`--color-accent-primary`, `--color-bg-selected`) now use orange automatically.

---

## Color Scale System (Optional)

For more control, add color scales:

```json
{
  "color": {
    "palette": {
      "orange": {
        "400": {
          "$type": "color",
          "$value": "oklch(75% 0.15 60)",
          "$description": "orange-400 - lighter shade"
        },
        "500": {
          "$type": "color",
          "$value": "oklch(65% 0.15 60)",
          "$description": "orange-500 - base shade"
        },
        "600": {
          "$type": "color",
          "$value": "oklch(55% 0.15 60)",
          "$description": "orange-600 - darker shade"
        }
      }
    },
    "brand": {
      "primary": {
        "$value": "{color.palette.orange.500}",
        "$description": "Brand primary - references orange-500"
      }
    }
  }
}
```

**Use case**: When you need multiple shades (light backgrounds, dark text, hover states).

---

## Validation

**Context7 Validation**: ✅ Recommended approach aligns with DTCG best practices:

- Base tokens (palette/brand) → hardcoded values ✅
- Semantic tokens → reference base tokens ✅
- Cascade behavior → change once, update everywhere ✅

**Our Docs Validation**: ✅ Aligns with `design-tokens.md`:

- Base tokens can have hardcoded values ✅
- Semantic tokens should reference base tokens ✅
- Follows semantic token reference rules ✅

---

## Decision: Current vs Recommended

**Current (Direct Values)**:
- ✅ Simple, works now
- ❌ No cascade (change brand color = update multiple tokens)
- ❌ Not scalable for color variations

**Recommended (Base Palette)**:
- ✅ Cascade behavior (change once, update everywhere)
- ✅ Scalable (add color scales easily)
- ✅ DTCG compliant (industry standard)
- ⚠️ Requires migration (one-time effort)

**Recommendation**: Migrate to base palette system for scalability.

---

## Next Steps

1. **Add base brand colors** (`color.brand.primary`, `color.brand.primaryHover`)
2. **Update semantic tokens** to reference base (`{color.brand.primary}`)
3. **Test cascade** (change brand color, verify semantic tokens update)
4. **Document** in `design-tokens.md` color section

---

**Last Updated**: 2025-11-23  
**Status**: Recommended architecture documented, migration pending

