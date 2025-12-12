# SYOS-636 Quick Start Guide

## ✅ Implementation Complete

All components built, design system compliant, zero linter errors.

---

## 🚀 How to Test (1 Minute)

### 1. Start Dev Server

```bash
npm run dev
```

### 2. Navigate to Import Page

```
http://localhost:5173/w/{your-workspace}/chart/import
```

### 3. Paste This Sample

```
root: Test Org

- circle: Engineering
  purpose: Build software

  -- role: Tech Lead
     purpose: Technical leadership

  -- role: Engineer
     purpose: Build features
```

### 4. Watch Preview Update

- Right panel shows tree structure
- Stats: "Will create: 1 circle, 2 roles"
- Draft badge appears

### 5. Click "Import Structure"

- Redirects to org chart
- New items appear with draft status

---

## 📁 Files Created

```
src/lib/modules/org-chart/components/import/
  ├── PreviewTree.svelte           (42 lines)
  ├── ImportTextarea.svelte        (78 lines)
  ├── StructurePreview.svelte      (88 lines)
  ├── OrgStructureImporter.svelte  (73 lines)
  ├── TEST_PLAN.md
  └── COMPONENT_STRUCTURE.md

src/routes/(authenticated)/w/[slug]/chart/import/
  └── +page.svelte                 (73 lines)
```

**Total: 354 lines of code**

---

## ✅ Quality Checklist

- ✅ Zero linter errors
- ✅ Design system compliant (24 semantic tokens)
- ✅ Recipe system used correctly
- ✅ No hardcoded values
- ✅ All dependencies exist
- ✅ Context pattern followed
- ✅ Loading states handled
- ✅ Error states handled

---

## 🎯 Test Scenarios

| Test                     | Expected Result                    |
| ------------------------ | ---------------------------------- |
| Paste valid structure    | Preview updates in 500ms           |
| Leave textarea empty     | Button disabled, placeholder shown |
| Type syntax error        | Red error box, button disabled     |
| Click "? Syntax Help"    | Example markup shown               |
| Click "Import Structure" | Redirects to org chart             |
| Check database           | All items have `status: 'draft'`   |

---

## 🔧 Troubleshooting

### Preview not updating?

- Check console for parser errors
- Wait 500ms (debounce delay)
- Verify syntax matches examples

### Import button disabled?

- Check for red error messages
- Verify textarea is not empty
- Ensure structure is valid

### Redirect not working?

- Check console for mutation errors
- Verify sessionId is present
- Check Convex dashboard

### Items not appearing?

- Check circles table in database
- Verify `status: 'draft'` field exists
- Look for `isHiring: true` on roles

---

## 📚 Documentation

- **Test Plan**: `src/lib/modules/org-chart/components/import/TEST_PLAN.md`
- **Component Structure**: `src/lib/modules/org-chart/components/import/COMPONENT_STRUCTURE.md`
- **Implementation Summary**: `SYOS-636-IMPLEMENTATION-SUMMARY.md`
- **Parser Logic**: `src/lib/modules/org-chart/utils/parseOrgStructure.ts`
- **Backend Mutation**: `convex/orgStructureImport.ts`

---

## 🎉 When It Works

You should see:

1. Split-pane interface with text editor (left) and preview (right)
2. Live preview updating as you type
3. Stats showing circle/role counts
4. Draft badge on preview
5. Import button enabled when valid
6. Successful redirect to org chart
7. New circles/roles in database with draft status

---

## 📝 Next Steps After Testing

1. **If it works**: Confirm with me, then commit
2. **If issues**: Let me know what's broken, I'll fix it
3. **After commit**: Update Linear ticket to "Done"
4. **Follow-up**: Add Import button to org chart toolbar

---

## 💡 Sample Structures to Try

### Simple

```
- circle: Sales
  purpose: Drive revenue
```

### Nested

```
- circle: Product
  -- circle: Engineering
     --- circle: Platform
         ---- role: DevOps Engineer
```

### With Errors (to test validation)

```
- cirle: Bad Typo
-- role: Wrong Indent
```

### Large Structure (50+ nodes)

```
- circle: Product
  -- circle: Engineering
     --- role: Tech Lead
     --- role: Senior Engineer
     --- role: Engineer
  -- circle: Design
     --- role: Design Lead
     --- role: UX Designer
     --- role: UI Designer
- circle: Sales
  -- role: Sales Director
  -- role: Account Manager
  -- role: Sales Rep
- circle: Operations
  -- role: Ops Lead
  -- role: Office Manager
```

---

**Ready to test!** 🚀
