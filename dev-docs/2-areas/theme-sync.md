# Theme Management & Cross-Device Sync

## Current Implementation

### Local Persistence ✅
- Theme preference is stored in `localStorage` as `'axon-theme'`
- Persists across browser sessions on the same device
- Applied immediately on page load (prevents FOUC)

### Theme Store
Located at `src/lib/stores/theme.ts`:
- Singleton reactive store accessible via `createThemeStore()`
- Applies theme class (`dark` or `light`) to `<html>` element
- All components using `createThemeStore()` share the same reactive state

### Usage in Components
```typescript
import { createThemeStore } from '$lib/stores/theme';

const theme = createThemeStore();

// Access current theme
theme.theme // 'light' | 'dark'
theme.isDark // boolean

// Change theme
theme.setTheme('light');
theme.toggleTheme();
```

## Future: Convex Integration for Cross-Device Sync

### Plan

1. **Add to User Settings Schema**
   ```typescript
   // convex/schema.ts
   userSettings: defineTable({
     userId: v.id('users'),
     theme: v.union(v.literal('light'), v.literal('dark')),
     // ... other settings
   })
   ```

2. **Create Convex Functions**
   - `getUserTheme()` - Query to fetch user's theme preference
   - `updateUserTheme(theme: 'light' | 'dark')` - Mutation to save theme

3. **Update Theme Store**
   - On user login: Load theme from Convex (with localStorage fallback)
   - On theme change: Update both localStorage AND Convex
   - On app load: Check authentication status
     - If authenticated: Fetch from Convex, fallback to localStorage
     - If not authenticated: Use localStorage only

4. **Sync Strategy**
   - Immediate localStorage update (for instant UI response)
   - Async Convex update (for cross-device persistence)
   - Conflict resolution: Convex preference wins when authenticated

### Implementation Steps

1. ✅ Create theme store with localStorage persistence
2. ✅ Add theme toggle UI (Switch component)
3. ⏳ Design Convex schema for userSettings
4. ⏳ Create Convex queries/mutations for theme
5. ⏳ Integrate Convex sync into theme store
6. ⏳ Test cross-device sync flow

