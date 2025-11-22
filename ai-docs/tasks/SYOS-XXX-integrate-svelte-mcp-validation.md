# Integrate Svelte MCP for Automated Svelte Code Quality Validation

**Goal**: Integrate Svelte MCP (`svelte-autofixer`) into our development workflow to catch Svelte 5 anti-patterns and best practice violations in real-time, ensuring AI-generated code follows latest Svelte 5 patterns and reducing "AI code slop".

---

## Problem Analysis

**Current State**:

- We have `svelte-check` (type checking), ESLint (syntax rules), and Prettier (formatting)
- Validation happens **after** code is written (during `/validate` or CI)
- No real-time feedback during code generation
- No Svelte-specific best practice validation (ESLint catches syntax, not patterns)
- AI agents may write outdated Svelte 5 code patterns

**Pain Points**:

- AI agents don't know latest Svelte 5 best practices (e.g., `$effect` vs `$derived` misuse)
- Code quality issues discovered late (during review/CI, not during generation)
- No automated pattern discovery from validation findings
- Manual pattern creation required (reactive process, not proactive)

**User Impact**:

- Reduces code quality issues before they reach review
- Ensures code follows latest Svelte 5 patterns automatically
- Builds knowledge base over time (patterns from validation findings)
- Faster iteration cycles (catch issues during `/go`, not after)

**Investigation**:

- ✅ Checked existing validation tools (`svelte-check`, ESLint, Prettier)
- ✅ Reviewed current workflow (`/go`, `/validate`, `/code-review`)
- ✅ Checked patterns (`dev-docs/2-areas/patterns/INDEX.md`) - No Svelte MCP integration patterns found
- ✅ Reviewed Svelte MCP documentation (https://svelte.dev/docs/mcp/overview)
- ✅ Checked reference code (`ai-docs/reference/`) - No Svelte MCP examples found

---

## Approach Options

### Approach A: New `/svelte-validate` Command (Standalone)

**How it works**: Create dedicated command that runs comprehensive Svelte validation (svelte-check + ESLint + Svelte MCP autofixer). Can be invoked manually or integrated into workflows.

**Pros**:

- Clear separation of concerns (validation vs implementation)
- Can be run standalone for any file/ticket
- Easy to integrate into multiple workflows (`/go`, `/code-review`, CI)
- Explicit validation step (user controls when to run)

**Cons**:

- Additional command to remember
- May be forgotten if not integrated into workflow
- Requires manual invocation

**Complexity**: Medium
**Dependencies**: Svelte MCP setup (remote or local), command file creation

---

### Approach B: Integrate into `/go` Command (Automatic)

**How it works**: Add Svelte MCP validation step directly into `/go` workflow. Runs automatically after pattern check, before implementation.

**Pros**:

- Automatic validation (no manual step)
- Catches issues during implementation (earliest possible)
- Integrated into existing workflow (no new command)
- Ensures all Svelte code is validated

**Cons**:

- Less flexible (always runs, can't skip)
- May slow down `/go` workflow
- Harder to run standalone for specific files

**Complexity**: Low
**Dependencies**: Svelte MCP setup, modify `/go` command

---

### Approach C: Hybrid Approach (Command + Integration)

**How it works**: Create `/svelte-validate` command AND integrate into `/go` workflow. Command for standalone use, automatic integration for workflow.

**Pros**:

- Best of both worlds (standalone + automatic)
- Flexible (can run manually or automatically)
- Comprehensive coverage (all Svelte code validated)
- Future-proof (can add to other workflows easily)

**Cons**:

- More complex (two integration points)
- More maintenance (keep command and integration in sync)
- May be redundant (automatic integration makes command less needed)

**Complexity**: Medium-High
**Dependencies**: Svelte MCP setup, command file creation, modify `/go` command

---

## Recommendation

**Selected**: Approach C (Hybrid Approach)

**Reasoning**:

- **Comprehensive coverage**: Ensures all Svelte code is validated (automatic in `/go`)
- **Flexibility**: Can validate specific files/tickets standalone (`/svelte-validate`)
- **Future-proof**: Easy to add to other workflows (`/code-review`, `/bug-fix`, CI)
- **User control**: Can run validation manually when needed
- **Best practices**: Follows pattern of other commands (standalone + integrated)

**Trade-offs accepted**:

- Additional complexity (two integration points)
- More maintenance (keep command and integration aligned)
- Some redundancy (automatic integration reduces standalone use)

**Risk assessment**:

- **Low** - Svelte MCP is well-documented, official tool
- **Low** - Can start with remote MCP (no installation needed)
- **Medium** - Integration complexity (need to coordinate command and `/go` command)
- **Low** - Rollback easy (can disable integration fails)

---

## Current State

**Existing Code**:

- `.cursor/commands/go.md` - Implementation workflow (pattern-first approach)
- `.cursor/commands/validate.md` - Post-implementation validation
- `.cursor/commands/code-review.md` - Code review workflow
- `package.json` - Scripts: `check` (svelte-check), `lint` (ESLint), `format` (Prettier)
- `eslint.config.js` - ESLint configuration with Svelte plugin
- `.github/workflows/quality-gates.yml` - CI quality gates

**Dependencies**:

- Svelte MCP server (remote: `https://mcp.svelte.dev/mcp` OR local: `@sveltejs/mcp`)
- Cursor MCP configuration (to enable Svelte MCP tools)
- No new npm packages needed (if using remote MCP)

**Patterns**:

- Pattern-first approach: `dev-docs/2-areas/patterns/INDEX.md` - Fast lookup
- Svelte reactivity patterns: `dev-docs/2-areas/patterns/svelte-reactivity.md` - 100+ patterns
- CI/CD patterns: `dev-docs/2-areas/patterns/ci-cd.md` - Quality gate patterns
- **No Svelte MCP integration patterns found** (new pattern to create)

**Reference code**:

- No Svelte MCP reference projects found in `ai-docs/reference/`
- Svelte MCP documentation: https://svelte.dev/docs/mcp/overview

**Constraints**:

- Must work with existing workflow (`/go`, `/validate`, `/code-review`)
- Must not break existing validation (svelte-check, ESLint still run)
- Must be optional (can disable if issues arise)
- Must integrate with Cursor MCP system

---

## Technical Requirements

**Components**:

- `.cursor/commands/svelte-validate.md` - New command file (standalone validation)
- Modify `.cursor/commands/go.md` - Add Svelte MCP validation step (automatic integration)
- Modify `.cursor/commands/code-review.md` - Add Svelte MCP validation to review workflow (optional)

**APIs**:

- Svelte MCP tools (via Cursor MCP):
  - `svelte-autofixer` - Analyze Svelte code, return issues/suggestions
  - `get-documentation` - Get latest Svelte 5/SvelteKit docs (if needed)
  - `list-sections` - Discover documentation sections (if needed)

**Data model**:

- No schema changes needed

**Integrations**:

- Cursor MCP configuration (remote or local Svelte MCP server)
- Existing validation tools (svelte-check, ESLint) - run alongside, not replace

**Testing**:

- Test `/svelte-validate` command on existing `.svelte` files
- Test `/go` workflow with Svelte MCP integration
- Test `/code-review` with Svelte MCP validation
- Verify no regressions (existing validation still works)
- Test error handling (MCP unavailable, network issues)

---

## Success Criteria

**Functional**:

- ✅ `/svelte-validate` command validates Svelte files and reports issues
- ✅ `/go` workflow automatically runs Svelte MCP validation for `.svelte` files
- ✅ Validation catches Svelte 5 anti-patterns (`$effect` vs `$derived`, reactivity issues)
- ✅ Validation integrates with existing tools (svelte-check, ESLint)
- ✅ Error handling works (graceful degradation if MCP unavailable)

**Performance**:

- ✅ Validation completes within 5 seconds per file
- ✅ Doesn't significantly slow down `/go` workflow (< 10 seconds total)
- ✅ Can run in parallel with other validation tools

**UX**:

- ✅ Clear validation reports (critical vs suggestions)
- ✅ Actionable feedback (what to fix, how to fix)
- ✅ Pattern matches documented (links to INDEX.md)
- ✅ Non-blocking suggestions (critical issues block, suggestions don't)

**Quality**:

- ✅ Follows existing command patterns (structure, format)
- ✅ Documented in command file (usage, examples)
- ✅ Integrated into workflow documentation
- ✅ Pattern created for future reference

---

## Code Quality & Validation Strategy

**Svelte-specific validation** (implementing `.svelte` files):

- Run `svelte-check` (type checking) ✅ Existing
- Run ESLint (syntax rules) ✅ Existing
- Run `svelte-autofixer` via Svelte MCP (best practices) ⭐ **NEW**
- Check Context7 for latest Svelte 5 patterns (if <95% confident) ✅ Existing
- Match against INDEX.md patterns ✅ Existing

**Validation timing**:

- During `/go` implementation: Run after each component/file ⭐ **NEW**
- Before commit: Run `/svelte-validate` on changed files ⭐ **NEW**
- During `/code-review`: Include validation findings ⭐ **NEW**

**Quality gates**:

- Critical issues: Must fix before merge
- Best practice suggestions: Should fix (non-blocking)
- Pattern matches: Document existing solutions used

**Why this matters**: Ensures code follows latest Svelte 5 best practices, catches anti-patterns early, maintains consistency.

**Reference**: `.cursor/commands/svelte-validate.md` - Complete validation workflow (to be created)

---

## Implementation Checklist

- [ ] **Phase 1: Svelte MCP Setup**
  - [ ] Configure Cursor MCP to use Svelte MCP server (remote: `https://mcp.svelte.dev/mcp`)
  - [ ] Test Svelte MCP tools (`svelte-autofixer`, `get-documentation`)
  - [ ] Verify tools work in Cursor chat

- [ ] **Phase 2: Create `/svelte-validate` Command**
  - [ ] Create `.cursor/commands/svelte-validate.md` command file
  - [ ] Define workflow: svelte-check → ESLint → Svelte MCP autofixer → Context7 (if needed) → INDEX.md match
  - [ ] Define report format (critical issues, suggestions, pattern matches)
  - [ ] Add examples and usage instructions
  - [ ] Test command on existing `.svelte` files

- [ ] **Phase 3: Integrate into `/go` Command**
  - [ ] Modify `.cursor/commands/go.md` - Add Svelte MCP validation step
  - [ ] Add step after pattern check, before implementation
  - [ ] Run validation only for `.svelte` files
  - [ ] Auto-fix issues when possible
  - [ ] Document findings in implementation notes
  - [ ] Test `/go` workflow with Svelte MCP integration

- [ ] **Phase 4: Integrate into `/code-review` Command** (Optional)
  - [ ] Modify `.cursor/commands/code-review.md` - Add Svelte MCP validation step
  - [ ] Run validation on all changed `.svelte` files
  - [ ] Include findings in review report
  - [ ] Test `/code-review` workflow

- [ ] **Phase 5: Documentation & Patterns**
  - [ ] Create pattern in `dev-docs/2-areas/patterns/ci-cd.md` or new file
  - [ ] Document Svelte MCP integration workflow
  - [ ] Update INDEX.md with new pattern
  - [ ] Update workflow documentation (`ai-development-workflow-v2.md`)

- [ ] **Phase 6: Testing & Validation**
  - [ ] Test `/svelte-validate` on various `.svelte` files (components, pages, composables)
  - [ ] Test `/go` workflow with Svelte MCP integration
  - [ ] Test error handling (MCP unavailable, network issues)
  - [ ] Verify no regressions (existing validation still works)
  - [ ] Test with real AI-generated code (run `/go` on actual ticket)

- [ ] **Phase 7: CI/CD Integration** (Future)
  - [ ] Add to `package.json` scripts (if local MCP)
  - [ ] Add to CI workflow (optional, non-blocking initially)
  - [ ] Test CI integration

---

**Linear Ticket**: [SYOS-438](https://linear.app/younghumanclub/issue/SYOS-438) - Integrate Svelte MCP for Automated Svelte Code Quality Validation

**Last Updated**: 2025-11-21  
**Status**: Ticket Created → Ready for Implementation  
**Next Step**: Execute `/go` with SYOS-438
