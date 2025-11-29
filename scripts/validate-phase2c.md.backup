# Phase 2C Validation Checklist

## ✅ Test Results Summary

1. ✅ **Schema Deployment**: Yes
2. ✅ **Test Branding Set**: Yes
3. ✅ **SSR Class Injection**: CONFIRMED (`org-mx7ecpdw61qbsfj3488xaxtd7x7veq2w` present)
4. ⚠️ **CSS Injection**: Need to verify `<head>` contains `<style>` tag
5. ⚠️ **Color Application**: "Everything is orange" - Need to verify it's using `--color-brand-primary`
6. ⚠️ **Multi-Org Switching**: "I think so but I'm not sure"

---

## 🔍 Test #4: CSS Injection in `<head>`

**How to Check:**

1. Open DevTools → Elements tab
2. Expand `<head>` section
3. Look for: `<style>` tag containing:
   ```css
   .org-mx7ecpdw61qbsfj3488xaxtd7x7veq2w {
   	--color-brand-primary: oklch(...);
   	--color-brand-secondary: oklch(...);
   }
   ```

**Expected Result:**

- ✅ `<style>` tag exists in `<head>`
- ✅ Contains `.org-{your-org-id}` selector
- ✅ Contains `--color-brand-primary` and `--color-brand-secondary` CSS variables

**If Missing:**

- Check browser console for errors
- Verify `orgBranding` is loaded in `+layout.server.ts`
- Check `orgBrandingCSS` is generated in `+layout.svelte`

---

## 🎨 Test #5: Color Application (Why "Everything is Orange")

**Question**: Is the orange color actually using `--color-brand-primary`?

**How to Verify:**

1. Open DevTools → Elements tab
2. Find a button or accent element (e.g., "Create" button, sidebar accent)
3. Inspect the element → Computed styles
4. Check `background-color` or `color` value
5. Verify it references: `var(--color-brand-primary)` or `var(--color-accent-primary)`

**OR Use Console:**

```javascript
// Check if CSS variable is set
getComputedStyle(document.documentElement).getPropertyValue('--color-brand-primary');

// Should return: "oklch(...)" (your org's primary color)
```

**Expected Result:**

- ✅ Buttons use `var(--color-brand-primary)` or `var(--color-accent-primary)`
- ✅ Accent colors use org brand colors
- ✅ Console shows org's primary color value

**If Wrong:**

- Check if components use `bg-accent-primary` utility class
- Verify `--color-accent-primary` references `--color-brand-primary` in `app.css`
- Check if Phase 1 light/dark mode tokens are correctly referencing brand colors

---

## 🔄 Test #6: Multi-Org Switching

**How to Test:**

1. **Switch Organizations:**
   - Click workspace menu (top left)
   - Select different organization
   - Wait for page to reload/switch

2. **Verify Class Change:**
   - Open DevTools → Elements
   - Check `<html>` tag `class` attribute
   - Should change: `org-{old-id}` → `org-{new-id}`

3. **Verify Colors Update:**
   - Colors should change to new org's brand colors
   - No page reload needed (if client-side switching works)

**Expected Result:**

- ✅ `<html>` class changes from `org-{old-id}` to `org-{new-id}`
- ✅ Colors update to new org's brand colors
- ✅ No FOUC (flash of unstyled content)

**If Not Working:**

- Check `previousOrgId` tracking in `+layout.svelte`
- Verify `$effect` runs on org switch
- Check if `organizationId` updates when switching orgs

---

## 🎯 Quick Validation Commands

**Check CSS Variable Value:**

```javascript
// In browser console
getComputedStyle(document.documentElement).getPropertyValue('--color-brand-primary');
```

**Check Org Class:**

```javascript
// In browser console
document.documentElement.className.includes('org-');
```

**Check CSS Injection:**

```javascript
// In browser console
document.head.querySelector('style[data-org-branding]') ||
	Array.from(document.head.querySelectorAll('style')).find((s) =>
		s.textContent.includes('--color-brand-primary')
	);
```

---

## 📋 Final Checklist

- [ ] Test #4: CSS injection in `<head>` verified
- [ ] Test #5: Colors using `--color-brand-primary` verified
- [ ] Test #6: Multi-org switching works verified
- [ ] No FOUC on page load
- [ ] Colors work in both light and dark mode

---

**Status**: Phase 2C is **85% complete** - Need to verify CSS injection and color application.
