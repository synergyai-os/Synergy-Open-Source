# save

**Purpose**: Capture knowledge and commit work session changes through intelligent pattern auditing and updates.

## Workflow

### 1. **Analyze Work Session**
   - Review all changes made in this chat
   - Identify key issues fixed, patterns discovered, or lessons learned
   - Note symptoms, root causes, and solutions
   - Extract keywords/tags for pattern matching

### 2. **Audit Existing Patterns** ⭐ CRITICAL STEP

   **Search Strategy** (in order):
   
   a. **Search by Symptoms** (Quick Diagnostic table)
      - Check `dev-docs/patterns-and-lessons.md` Quick Diagnostic table
      - Match symptoms from this session to existing patterns
      - Note any related pattern links
   
   b. **Search by Keywords**
      - Search for keywords related to issues fixed (e.g., "use node", "mutation", "Convex", "runtime")
      - Use grep/search in patterns-and-lessons.md
      - Look for technology tags, issue types, or pattern names
   
   c. **Search by Technology/Issue Type**
      - Check Index by Technology for related patterns
      - Check Index by Issue Type for similar issues
      - Review related patterns mentioned in existing patterns

   **Decision Logic**:
   - **If pattern exists and is related**: Update existing pattern (see step 3a)
   - **If pattern exists but is different**: Add new pattern with link to related (see step 3b)
   - **If no pattern exists**: Create new pattern (see step 3c)

### 3. **Update patterns-and-lessons.md** ⭐ DO THIS FIRST

   **CRITICAL**: Always update `dev-docs/patterns-and-lessons.md` BEFORE committing

   #### 3a. **Update Existing Pattern** (if related pattern found)
   
   When updating an existing pattern:
   - **Add new insights** to relevant sections (Problem, Root Cause, Solution)
   - **Enhance examples** with additional ❌ WRONG / ✅ CORRECT cases
   - **Update Key Takeaway** if new learnings discovered
   - **Add to Related Patterns** if connections found
   - **Update date** if significant new information added
   - **Keep existing content** - enhance, don't replace
   
   Example update scenarios:
   - Found edge case → Add to Problem section
   - Better solution discovered → Update Solution with both approaches
   - Related issue found → Add to Related Patterns
   - Common mistake → Add to Key Takeaway

   #### 3b. **Add New Pattern** (if no related pattern exists)
   
   When creating a new pattern:
   - Use [Pattern Template](#pattern-template) from patterns-and-lessons.md
   - Add at end of "Patterns" section (chronological order)
   - Include all required sections: Problem, Root Cause, Solution, Key Takeaway
   - Add ❌ WRONG and ✅ CORRECT code examples
   - Include relevant tags (lowercase, kebab-case)
   - Add date (YYYY-MM-DD)

   #### 3c. **Update Indexes** (for both new and updated patterns)
   
   Update all relevant indexes:
   - **Index by Technology**: Add/update technology entries
   - **Index by Issue Type**: Add/update issue type entries
   - **Index by Pattern Name**: Add/update pattern name (numbered list)
   - **Quick Diagnostic**: Add if pattern solves a common symptom
   
   **Index Update Rules**:
   - Only add if truly relevant (don't over-index)
   - Use consistent formatting
   - Link to pattern using anchor format: `[#pattern-name](#pattern-name)`
   - Update pattern number in Index by Pattern Name

### 4. **Commit Changes**

   - Review what was changed in this session
   - Create clear commit message describing changes
   - Commit only files worked on in this chat
   - **Do NOT** push to GitHub (local commit only)

## Pattern Audit Checklist

Before updating/adding patterns:

- [ ] **Searched Quick Diagnostic table** for symptom matches
- [ ] **Searched by keywords** (technology, issue type, error messages)
- [ ] **Checked Index by Technology** for related patterns
- [ ] **Checked Index by Issue Type** for similar issues
- [ ] **Reviewed Related Patterns** in existing patterns
- [ ] **Determined if update or new pattern** needed
- [ ] **Updated existing pattern** (if found) with new insights
- [ ] **Created new pattern** (if needed) using template
- [ ] **Updated all indexes** (Technology, Issue Type, Pattern Name)
- [ ] **Added to Quick Diagnostic** (if common symptom)
- [ ] **Included code examples** (❌ WRONG / ✅ CORRECT)
- [ ] **Added relevant tags** (lowercase, kebab-case)
- [ ] **Linked related patterns** (if connections found)

## Pattern Update vs. New Pattern Decision

### Update Existing Pattern When:
- Same root cause, different symptom
- Same technology, different edge case
- Same issue type, additional solution
- Related problem with shared solution approach
- Enhancement to existing pattern (better examples, clearer explanation)

### Create New Pattern When:
- Completely different root cause
- Different technology stack
- Different issue category
- No existing pattern covers this scenario
- New architectural pattern discovered

### Example Decision Process:

**Scenario**: Fixed "use node" error with mutations in flashcards.ts

**Audit Steps**:
1. Search Quick Diagnostic: "InvalidModules" → No match
2. Search keywords: "use node", "mutation", "Node.js runtime" → Found "Convex File System Access" (mentions "use node" but different issue)
3. Check Index by Technology → "Convex" section exists
4. Check Index by Issue Type → "File System / Serverless" exists
5. **Decision**: Related to Convex runtime, but different issue (runtime restrictions vs file system)
6. **Action**: Create new pattern "Convex Node.js Runtime Restrictions" and link to "Convex File System Access" as related

## Commit Message Format

```
[Area] Brief description

- What was changed
- Why it was changed
- Patterns/lessons learned (reference pattern name if added/updated)
```

Example:
```
[Convex] Fix Node.js runtime restrictions in flashcards.ts

- Removed "use node" from flashcards.ts (contained mutations/queries)
- Moved decryptApiKey to use existing cryptoActions.decryptApiKey
- Updated generateFlashcard to use internal.cryptoActions.decryptApiKey

Pattern: Added "Convex Node.js Runtime Restrictions" pattern
```

## Quality Standards

### Pattern Updates Must:
- Preserve existing valuable content
- Add new insights without redundancy
- Maintain clear structure
- Keep examples relevant and concise
- Update dates only for significant changes

### New Patterns Must:
- Follow template exactly
- Include all required sections
- Have clear, actionable takeaways
- Include working code examples
- Be properly indexed
- Link to related patterns

### Index Updates Must:
- Use consistent formatting
- Link correctly to patterns
- Be placed in correct section
- Not duplicate entries
- Be alphabetically/logically ordered

## Anti-Patterns to Avoid

- ❌ **Don't create duplicate patterns** - Update existing instead
- ❌ **Don't skip the audit** - Always search for related patterns first
- ❌ **Don't remove valuable content** - Enhance, don't replace
- ❌ **Don't forget indexes** - Always update relevant indexes
- ❌ **Don't add to Quick Diagnostic** unless it's a common symptom
- ❌ **Don't commit before updating patterns** - Knowledge capture comes first

## Success Criteria

A successful `/save` should result in:
- ✅ All relevant patterns audited and updated/created
- ✅ Indexes properly maintained
- ✅ Knowledge captured for future sessions
- ✅ Clear commit message with pattern references
- ✅ No duplicate or redundant patterns
- ✅ Future `/root-cause` searches will find the pattern
