# root-cause

**Purpose**: Investigate issues and find root causes using documented patterns.

## Workflow

1. **Read patterns-and-lessons.md**
   - Start with [Quick Diagnostic](#-quick-diagnostic-common-issues--patterns) table
   - Search by symptom → find pattern link
   - If no match: Check indexes by Technology or Issue Type
   - Read full pattern: Problem → Root Cause → Solution

2. **Investigate the issue**
   - Gather error messages, symptoms, and context
   - Compare with documented patterns
   - Check related patterns via cross-references
   - Use Context7 if pattern references external docs

3. **Assess confidence level**
   - **95%+ confidence**: Proceed with fix
   - **<95% confidence**: Research and report back
     - Report confidence level (0-100%)
     - Explain what's unclear
     - Suggest next steps for investigation

4. **Don't build unless confident**
   - Only implement if 95%+ confident in solution
   - If uncertain: Research, document findings, report back
   - Use Context7 for latest docs/best practices when needed

## Search Strategy

1. **Quick lookup**: Check Quick Diagnostic table for symptom → pattern
2. **Technology search**: If issue involves specific tech (Svelte, Convex, TypeScript)
3. **Issue type search**: If issue type is known (reactivity, race condition, etc.)
4. **Pattern name search**: If pattern name is known
5. **Full text search**: Search document for keywords/error messages

## Confidence Assessment

When reporting confidence level, include:
- What you're confident about
- What's unclear or needs research
- Which patterns apply (if any)
- What additional information would help

