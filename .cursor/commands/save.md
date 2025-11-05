# save

**Purpose**: Capture knowledge and commit work session changes.

## Workflow

1. **Analyze work session**
   - Review all changes made in this chat
   - Identify new patterns, lessons, or fixes discovered
   - Note any anti-patterns or mistakes to avoid

2. **Update patterns-and-lessons.md FIRST**
   - **CRITICAL**: Always update `dev-docs/patterns-and-lessons.md` BEFORE committing
   - Check if similar pattern already exists (search by symptom/issue)
   - If new pattern: Add using template at end of "Patterns" section
   - If existing pattern: Update with new insights or refinements
   - Update all three indexes (Technology, Issue Type, Pattern Name)
   - If solves common symptom: Add to Quick Diagnostic table

3. **Commit changes**
   - Review what was changed in this session
   - Create clear commit message describing changes
   - Commit only files worked on in this chat
   - **Do NOT** push to GitHub (local commit only)

## Pattern Addition Checklist

When adding a new pattern:
- [ ] Used pattern template format
- [ ] Added to Index by Technology
- [ ] Added to Index by Issue Type  
- [ ] Added to Index by Pattern Name
- [ ] Added to Quick Diagnostic (if common symptom)
- [ ] Included ❌ WRONG and ✅ CORRECT examples
- [ ] Included Root Cause analysis
- [ ] Included Key Takeaway section
- [ ] Added relevant tags (lowercase, kebab-case)

## Commit Message Format

```
[Area] Brief description

- What was changed
- Why it was changed
- Any patterns/lessons learned
```

