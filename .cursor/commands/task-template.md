# task-template

**Purpose**: Generate detailed pre-coding technical analysis documents. Forces AI to think through multiple approaches before coding.

---

## When to Use

**Before implementing any feature/fix:**

- Complex features requiring architectural decisions
- Multiple implementation approaches possible
- Need to document thinking process
- Want to compare approaches before coding

**Workflow**: `/task-template` → Review → `/go` → Execute

---

## Command Usage

```text
/task-template [SYOS-XXX] or [description]
```

**Examples:**

- `/task-template SYOS-123` - Generate from Linear ticket
- `/task-template Add image uploads to chat` - Generate from description

---

## Task Document Structure

Generate a complete task document with these sections:

### 1. Title & Goal

**One-line title** + **Clear outcome statement**

Example:

```markdown
# Add Image Uploads to Chat

**Goal**: Users can upload and attach images in chat conversations. Images display inline with messages.
```

---

### 2. Problem Analysis

**What's the problem? Why does it need solving?**

- Current state (what exists now)
- Pain points (what's missing/broken)
- User impact (why this matters)

**Investigate first:**

- Check existing code (`codebase_search`)
- Check patterns (`dev-docs/2-areas/patterns/INDEX.md`)
- Check reference code (`ai-docs/reference/`) if relevant
- Understand dependencies

---

### 3. Approach Options (2-3 Different Ways)

**MANDATORY**: Consider at least 2-3 different approaches. Don't jump to first solution.

For each approach:

**Approach A: [Name]**

- **How it works**: Brief description
- **Pros**: Benefits
- **Cons**: Drawbacks, complexity, limitations
- **Complexity**: Low/Medium/High
- **Dependencies**: What's needed

**Approach B: [Name]**

- [Same structure]

**Approach C: [Name]** (if applicable)

- [Same structure]

**Why multiple approaches matter:**

- Prevents rushing to first solution
- Forces thinking through trade-offs
- Documents decision process
- Helps identify best fit

---

### 4. Recommendation

**Which approach is best and why?**

- **Selected**: Approach X
- **Reasoning**: Why this approach over others
- **Trade-offs accepted**: What we're giving up
- **Risk assessment**: What could go wrong

**Be explicit**: Don't just pick one - explain why.

---

### 5. Current State

**What exists now?**

- **Existing code**: Files/components that exist
- **Dependencies**: Libraries, modules, APIs needed
- **Patterns**: Relevant patterns from `dev-docs/2-areas/patterns/`
- **Reference code**: Any reference projects that apply (`ai-docs/reference/`)
- **Constraints**: Technical limitations, requirements

**Investigation checklist:**

- [ ] Searched codebase for existing implementations
- [ ] Checked patterns (`INDEX.md`)
- [ ] Reviewed reference code (if applicable)
- [ ] Identified dependencies
- [ ] Understood constraints

---

### 6. Technical Requirements

**What needs to be built?**

- **Components**: New components to create
- **APIs**: Backend functions/queries needed
- **Data model**: Schema changes (if any)
- **Integrations**: External services/APIs
- **Testing**: Test requirements

**Be specific**: File paths, function names, data structures.

---

### 7. Success Criteria

**How do we know it's done?**

- **Functional**: What works
- **Performance**: Speed/scale requirements
- **UX**: User experience goals
- **Quality**: Code quality standards

**Measurable**: Clear pass/fail criteria.

---

### 8. Implementation Checklist

**Step-by-step implementation plan**

- [ ] Step 1: [Description]
- [ ] Step 2: [Description]
- [ ] Step 3: [Description]
- ...

### Order Matters

Dependencies first, then build.

---

## File Naming & Location

**Save to**: `ai-docs/tasks/[ticket-id]-[slug].md`

**Examples:**

- `ai-docs/tasks/SYOS-123-image-uploads-chat.md`
- `ai-docs/tasks/SYOS-456-fix-auth-redirect.md`

**Naming convention**:

- Use ticket ID if available (SYOS-XXX)
- Use descriptive slug (kebab-case)
- Make it searchable

---

## AI Instructions

**When user invokes `/task-template`:**

1. **Get context**:
   - If ticket ID provided → Load Linear ticket (`mcp_Linear_get_issue`)
   - If description provided → Use description

2. **Investigate** (MANDATORY):
   - Search codebase for existing implementations
   - Check patterns (`dev-docs/2-areas/patterns/INDEX.md`)
   - Check reference code (`ai-docs/reference/`) if relevant
   - Understand dependencies and constraints

3. **Generate task document**:
   - Follow structure above (all 8 sections)
   - **CRITICAL**: Include 2-3 approach options (don't skip this)
   - Be thorough in analysis
   - Be specific in requirements

4. **Save file**:
   - Create `ai-docs/tasks/` folder if needed
   - Save as `[ticket-id]-[slug].md`
   - Use proper markdown formatting

5. **Present to user**:
   - Show generated document
   - Highlight key decisions (recommended approach)
   - Wait for confirmation before proceeding

---

## Example Output

```markdown
# Add Image Uploads to Chat

**Goal**: Users can upload and attach images in chat conversations. Images display inline with messages.

## Problem Analysis

**Current State**: Chat supports text messages only. No file upload capability exists.

**Pain Points**: Users want to share screenshots, diagrams, photos in conversations. Currently must use external tools.

**User Impact**: Reduces friction in team communication. Enables richer context sharing.

**Investigation**:

- ✅ Checked existing file upload patterns (none found)
- ✅ Reviewed Vercel AI SDK reference code (`ai-docs/reference/vercel-ai-sdk-chat/`)
- ✅ Checked Convex file storage patterns (`convex-integration.md#L...`)

## Approach Options

### Approach A: Direct Convex File Storage

**How it works**: Upload directly to Convex file storage, store file ID in message.
**Pros**: Simple, native integration, no external service
**Cons**: Convex file storage limits, no image optimization
**Complexity**: Low
**Dependencies**: Convex file storage API

### Approach B: Vercel Blob Storage + Convex Reference

**How it works**: Upload to Vercel Blob, store URL in Convex message.
**Pros**: Better performance, image optimization, CDN
**Cons**: Additional service, more complex setup
**Complexity**: Medium
**Dependencies**: Vercel Blob SDK, Convex

### Approach C: Base64 Inline Encoding

**How it works**: Encode images as base64, store in message text.
**Pros**: No external storage needed
**Cons**: Large payloads, performance issues, database bloat
**Complexity**: Low
**Dependencies**: None

## Recommendation

**Selected**: Approach B (Vercel Blob Storage)

**Reasoning**:

- Better user experience (fast loading, CDN)
- Scalable (doesn't bloat database)
- Image optimization built-in
- Matches reference code pattern

**Trade-offs accepted**: Additional service complexity, setup overhead

**Risk assessment**: Low - Vercel Blob is well-documented, reference code exists

## Current State

**Existing Code**:

- `src/lib/components/chat/ChatWindow.svelte` - Chat UI exists
- `convex/chat.ts` - Message mutations exist
- No file upload components exist

**Dependencies**:

- `@vercel/blob` package (need to install)
- Convex file storage (already available)
- Image preview component (need to create)

**Patterns**:

- Convex file upload: `convex-integration.md#L...`
- Reference code: `ai-docs/reference/vercel-ai-sdk-chat/` (has image upload example)

**Constraints**:

- Must work with existing chat UI
- Must support common image formats (PNG, JPG, GIF)
- Max file size: 10MB

## Technical Requirements

**Components**:

- `src/lib/components/chat/ImageUpload.svelte` - Upload button/dropzone
- `src/lib/components/chat/ImagePreview.svelte` - Image display component

**APIs**:

- `convex/chat.ts:uploadImage()` - Upload mutation
- `convex/chat.ts:getImageUrl()` - Get signed URL query

**Data Model**:

- Add `imageUrl?: string` to `messages` table schema

**Integrations**:

- Vercel Blob Storage API
- Convex file storage (fallback)

**Testing**:

- Upload flow (success/error)
- Image display in messages
- File size validation
- Format validation

## Success Criteria

**Functional**:

- ✅ Users can upload images via button or drag-drop
- ✅ Images display inline with messages
- ✅ Upload progress shown
- ✅ Error handling for failed uploads

**Performance**:

- ✅ Images load within 2 seconds
- ✅ Upload doesn't block UI

**UX**:

- ✅ Clear upload feedback
- ✅ Image preview before sending
- ✅ Mobile-friendly

**Quality**:

- ✅ TypeScript types
- ✅ Error boundaries
- ✅ Accessibility (alt text)

## Implementation Checklist

- [ ] Install `@vercel/blob` package
- [ ] Create `ImageUpload.svelte` component
- [ ] Create `ImagePreview.svelte` component
- [ ] Add `uploadImage` mutation in `convex/chat.ts`
- [ ] Update message schema (add `imageUrl` field)
- [ ] Integrate upload component into `ChatWindow.svelte`
- [ ] Add image display in message list
- [ ] Add error handling
- [ ] Test upload flow
- [ ] Test image display
- [ ] Add loading states
- [ ] Verify accessibility
```

---

## Integration with Workflow

**Current workflow**: `/start` → Investigation → User Confirms → `/go` → Execute

**With task template**: `/start` → `/task-template` → Review → `/go` → Execute

**When to use task template**:

- Complex features (architectural decisions)
- Multiple approaches possible
- Need documentation of thinking

**When to skip**:

- Simple bug fixes
- Straightforward features
- Clear single approach

---

## Key Principles

1. **Think First**: Don't jump to implementation - analyze approaches
2. **Document Decisions**: Why this approach over others
3. **Investigate Thoroughly**: Check patterns, reference code, existing implementations
4. **Be Specific**: Clear requirements, file paths, function names
5. **Measure Success**: Clear pass/fail criteria

---

**Last Updated**: 2025-11-20  
**Purpose**: Force pre-coding analysis to improve code quality and reduce rewrites
