# Enhance /save Command with Pattern Lifecycle Management

**Linear Ticket**: [SYOS-481](https://linear.app/younghumanclub/issue/SYOS-481)

**Goal**: Add explicit lifecycle states to pattern system, enabling clear communication about pattern evolution, deprecation, and superseding.

## Problem Analysis

**Current State**:

- Pattern system supports adding/updating patterns
- `/save` command has decision tree: "Exact match exists → Update existing pattern"
- No explicit lifecycle states (Active, Deprecated, Superseded, Historical)
- Evidence of evolution exists (`grep` found "superseded", "deprecated", "replaced by" keywords) but no formal system

**Pain Points**:

- Patterns evolve (Svelte 4 → Svelte 5, library updates) but no clear lifecycle management
- Users don't know if pattern is current, deprecated, or replaced
- No migration guidance when patterns supersede others
- Pattern updates may fundamentally change approach (not just enhance)

**User Impact**:

- **Developers**: Clear guidance on which patterns to use (no guessing if pattern is current)
- **AI Agents**: Better decision-making (know when to use deprecated patterns vs new ones)
- **Contributors**: Structured approach to pattern evolution (not ad-hoc)

**Investigation**:

- ✅ Checked existing `/save` command (272 lines) - Decision tree exists but no lifecycle states
- ✅ Reviewed pattern files - Found evidence of "superseded" usage but inconsistent
- ✅ Reviewed INDEX.md format - No status column currently
- ✅ Checked Context7 ADR standards - Industry-standard lifecycle: Proposed, Accepted, Deprecated, Superseded, Rejected
- ✅ Reviewed Log4brains implementation - Supports status filtering, well-established tooling

## Approach Options

### Approach A: Full ADR-Inspired Lifecycle (5 States)

**How it works**: Adopt complete ADR standard with 5 lifecycle states:

- **Proposed** - Pattern under consideration (experimental)
- **Accepted** - Current best practice
- **Deprecated** - Discouraged but still works (migration path provided)
- **Superseded** - Replaced by another pattern (link to replacement)
- **Rejected** - Decided against using this pattern

**Pros**:

- Industry standard (ADR community, Log4brains)
- Complete lifecycle coverage (proposal → rejection)
- Clear semantics for each state
- Tooling exists (Log4brains for filtering)

**Cons**:

- More states = more complexity
- "Proposed" and "Rejected" rarely needed for our use case (we mostly document proven patterns)
- Overkill for current needs

**Complexity**: Medium  
**Dependencies**: Update `/save` command, INDEX.md format, pattern template, documentation

### Approach B: Simplified Lifecycle (4 States)

**How it works**: Adapt ADR standard to our needs with 4 practical states:

- **Active** - Current best practice (default)
- **Deprecated** - Discouraged, migration path provided
- **Superseded** - Replaced by #LXXX (explicit link)
- **Historical** - Archived for reference (version X.X only)

**Pros**:

- Covers 95% of real-world cases
- Simpler than full ADR (removes rarely-used "Proposed" and "Rejected")
- Clear distinction between "Deprecated" (still works) vs "Superseded" (replaced)
- "Historical" useful for version-specific patterns (Svelte 4 vs 5)

**Cons**:

- Less comprehensive than ADR standard
- Custom format (not standard)

**Complexity**: Low-Medium  
**Dependencies**: Update `/save` command, INDEX.md format, pattern template, documentation

### Approach C: Minimal Lifecycle (2 States + Migration Path)

**How it works**: Simplest approach with just 2 states:

- **Active** - Current best practice (default)
- **Deprecated** - With mandatory migration path to replacement pattern

**Pros**:

- Extremely simple (binary: active or deprecated)
- Forces migration guidance (can't deprecate without explaining alternative)
- Minimal changes to existing system

**Cons**:

- No distinction between "still works but discouraged" vs "replaced completely"
- No "Historical" marker for version-specific patterns
- Less expressive (can't communicate nuance)
- Doesn't handle library version changes well (Svelte 4 → 5)

**Complexity**: Low  
**Dependencies**: Update `/save` command, INDEX.md format, pattern template

## Recommendation

**Selected**: Approach A (Full ADR-Inspired Lifecycle - 5 States)

**Reasoning**:

- **Pre-training advantage**: AI has extensive training on ADR terminology (Proposed, Accepted, Deprecated, Superseded, Rejected)
- **"Accepted" > "Active"**: Standard ADR term with deep pre-trained understanding
- **"Rejected" is useful**: Anti-patterns, "why NOT to do X" documentation
- **Complete lifecycle**: Covers experimental patterns (Proposed) through rejection
- **Industry standard**: ADR community, Log4brains, widely adopted
- **Better AI comprehension**: Leverages standard terminology from pre-training data

**Trade-offs accepted**:

- Slightly more complexity (5 states vs 4)
- "Proposed" and "Rejected" less frequently used (but valuable when needed)

**Risk assessment**: Low

- Enhances existing system (no breaking changes)
- Clear upgrade path for existing patterns
- Validated approach (ADR industry standard)
- Better AI understanding through pre-trained knowledge

## Current State

**Existing Code**:

- `.cursor/commands/save.md` - `/save` command (272 lines)
- `dev-docs/2-areas/patterns/INDEX.md` - Pattern index with symptom tables
- Domain files (svelte-reactivity.md, convex-integration.md, ui-patterns.md, analytics.md)
- `.cursor/commands/README.md` - Command optimization docs

**Dependencies**:

- No external libraries needed
- Uses existing search_replace tool
- References Context7 for validation (already used)

**Patterns**:

- Pattern format template exists (INDEX.md #L284-300)
- Severity levels defined (🔴 Critical, 🟡 Important, 🟢 Reference)
- Line number system established (#L10, #L50, etc.)

**Reference code**:

- ADR examples from Context7 (lifecycle states, status management)
- Log4brains implementation (status filtering)

**Constraints**:

- Must preserve existing line numbers (don't break #L references)
- Must maintain INDEX.md compatibility (symptom tables)
- Must be backward compatible (existing patterns default to "Active")

## Technical Requirements

**Components to Update**:

1. **`.cursor/commands/save.md`** (~100 line addition):
   - Add Section 2.5: "Determine Pattern Action" (between Step 2 and Step 3)
   - Enhance decision tree with lifecycle actions
   - Add templates for Deprecating/Superseding patterns
   - Update Quick AI Workflow

2. **Domain file pattern template** (in `/save` command):
   - Add STATUS field: `[STATUS: ACTIVE|DEPRECATED|SUPERSEDED|HISTORICAL]`
   - Add deprecation template
   - Add superseded template
   - Add historical template

3. **`dev-docs/2-areas/patterns/INDEX.md`** (~20 line addition):
   - Add status column to symptom tables (optional - can defer)
   - Update "Adding New Patterns" section with lifecycle guidance
   - Update pattern template to show STATUS field

4. **`.cursor/commands/README.md`** (~10 line addition):
   - Document `/save` enhancement
   - Add entry to "Recent Enhancements" section

5. **`dev-docs/2-areas/development/ai-development-workflow-v2.md`** (~50 line addition):
   - Add section on pattern lifecycle management
   - Update `/save` workflow description
   - Add examples of deprecated/superseded patterns

**APIs**: None (file-based system)

**Data model**: None (markdown-based)

**Integrations**: Context7 (already used for validation)

**Testing**: Manual testing of `/save` command workflow

## Success Criteria

**Functional**:

- ✅ `/save` command supports lifecycle actions (Enhance, Deprecate, Supersede, Historical)
- ✅ Templates provided for each lifecycle state
- ✅ Decision tree guides AI to choose correct action
- ✅ Existing patterns default to "Active" (backward compatible)

**Performance**:

- ✅ No performance impact (text-based, no additional processing)

**UX**:

- ✅ Clear guidance for AI agents (when to deprecate vs supersede)
- ✅ Migration paths provided when deprecating/superseding
- ✅ Users know immediately if pattern is current

**Quality**:

- ✅ Follows ADR industry standard principles
- ✅ Backward compatible (existing patterns work as-is)
- ✅ Documented in command optimization docs

## Code Quality & Validation Strategy

**Documentation validation**:

- Review generated templates with user (example patterns)
- Validate decision tree clarity (can AI choose correctly?)
- Test with real pattern evolution scenario (Svelte 4 → 5 example)

**Validation timing**:

- During implementation: Review templates after each addition
- Before completion: User reviews full workflow
- After implementation: Test with actual pattern deprecation

**Quality gates**:

- Critical: Decision tree must be clear (no ambiguity)
- Critical: Templates must include migration paths
- Important: Examples must be realistic
- Important: Documentation must reference ADR standards

## Implementation Checklist

- [ ] **Step 1**: Update `/save` command (add Section 2.5: "Determine Pattern Action")
  - Add decision tree enhancement
  - Add lifecycle action descriptions
  - Add templates (Deprecate, Supersede, Historical)
- [ ] **Step 2**: Update pattern template in `/save` command
  - Add STATUS field format
  - Add deprecation template example
  - Add superseded template example
  - Add historical template example
- [ ] **Step 3**: Update `INDEX.md` (add lifecycle guidance)
  - Update "Adding New Patterns" section
  - Update pattern template to show STATUS
  - (Optional) Add status column to tables
- [ ] **Step 4**: Update `.cursor/commands/README.md`
  - Document `/save` enhancement
  - Add to "Recent Enhancements" section
- [ ] **Step 5**: Update `ai-development-workflow-v2.md`
  - Add pattern lifecycle section
  - Update `/save` workflow description
  - Add examples
- [ ] **Step 6**: Test with user
  - Review templates and examples
  - Validate decision tree clarity
  - Test with real deprecation scenario

---

**Last Updated**: 2025-11-22  
**Status**: Ready for implementation  
**Estimated Effort**: ~2-3 hours (180 lines total across 5 files)
