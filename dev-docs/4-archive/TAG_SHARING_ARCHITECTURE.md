# Tag Sharing Architecture - Copy Model

## 🎯 Core Principle: "Share by Copy, Not Transfer"

**Marketing Message**:

> "Share your knowledge with your team. When you share a collection, it becomes team knowledge - forever accessible, even if members leave."

**Technical Implementation**:
When a user shares a tag with an organization/team, we:

1. **Copy the tag** to the organization (new tag entity, org-owned)
2. **Copy all linked content** to the organization (new highlight/flashcard entities, org-owned)
3. **Preserve original** in user's personal workspace (unchanged)
4. **Diverge from that point** - updates to personal vs org copies are independent

---

## 🏗️ Architecture Decision

### **Why Copy Instead of Transfer?**

1. **Scalability**: Works with any content type (highlights, flashcards, notes, sources, etc.)
   - We don't need to track "1000 different types"
   - We just copy the tag and its direct associations
   - Each content type has its own junction table (`highlightTags`, `flashcardTags`, etc.)

2. **Simplicity**: Clear ownership model
   - Personal tag → Personal content (user owns)
   - Org tag → Org content (org owns)
   - No shared ownership complexity

3. **Data Integrity**: No orphaned content
   - User leaves org? Their shared knowledge stays
   - User deletes personal version? Org version unaffected

4. **Future-Proof**: Supports any entity type
   - Pattern: Copy tag + copy all `{entityType}Tags` junction records
   - New entity type? Just add its junction table to the copy logic

---

## 📊 Data Model

### **Before Share (Personal Workspace)**

```
User's Personal Workspace:
  Tag: "Product Ideas" (userId: user123)
    ├─ Highlight A (userId: user123)
    ├─ Highlight B (userId: user123)
    └─ Flashcard C (userId: user123)
```

### **After Share (Organization Workspace)**

```
User's Personal Workspace:
  Tag: "Product Ideas" (userId: user123)  ← UNCHANGED
    ├─ Highlight A (userId: user123)      ← UNCHANGED
    ├─ Highlight B (userId: user123)      ← UNCHANGED
    └─ Flashcard C (userId: user123)      ← UNCHANGED

Organization Workspace:
  Tag: "Product Ideas" (orgId: org456)    ← NEW COPY
    ├─ Highlight A' (orgId: org456)       ← NEW COPY
    ├─ Highlight B' (orgId: org456)       ← NEW COPY
    └─ Flashcard C' (orgId: org456)       ← NEW COPY
```

**Key Points**:

- ✅ User retains their personal collection
- ✅ Organization gets independent copy
- ✅ Future edits don't affect each other
- ✅ User can leave org, knowledge stays

---

## 🔧 Technical Implementation

### **High-Level Algorithm**

```typescript
async function shareTagToOrganization(tagId, organizationId) {
	// 1. Copy the tag
	const originalTag = await db.get(tagId);
	const newTagId = await db.insert('tags', {
		...originalTag,
		userId: null, // Org owns it, not a specific user
		organizationId: organizationId,
		ownershipType: 'organization',
		displayName: originalTag.displayName,
		color: originalTag.color,
		parentId: null, // Don't copy hierarchy (or do we?)
		createdAt: Date.now()
	});

	// 2. Find all content linked to this tag
	const highlightLinks = await db
		.query('highlightTags')
		.withIndex('by_tag', (q) => q.eq('tagId', tagId))
		.collect();

	const flashcardLinks = await db
		.query('flashcardTags')
		.withIndex('by_tag', (q) => q.eq('tagId', tagId))
		.collect();

	// Add more content types here as needed...

	// 3. Copy each linked highlight
	for (const link of highlightLinks) {
		const originalHighlight = await db.get(link.highlightId);

		// Check if org already has this highlight (avoid duplicates)
		const existingOrgHighlight = await findOrgHighlight(
			organizationId,
			originalHighlight.sourceId,
			originalHighlight.location
		);

		let orgHighlightId;
		if (existingOrgHighlight) {
			// Org already has this highlight, just link to tag
			orgHighlightId = existingOrgHighlight._id;
		} else {
			// Copy highlight to org
			orgHighlightId = await db.insert('highlights', {
				...originalHighlight,
				userId: null, // Org-owned
				organizationId: organizationId,
				ownershipType: 'organization',
				createdAt: Date.now()
			});
		}

		// Link copied highlight to copied tag
		await db.insert('highlightTags', {
			highlightId: orgHighlightId,
			tagId: newTagId,
			userId: null,
			organizationId: organizationId,
			createdAt: Date.now()
		});
	}

	// 4. Copy each linked flashcard (same pattern)
	for (const link of flashcardLinks) {
		// ... same logic as highlights
	}

	// 5. Return summary
	return {
		newTagId,
		itemsCopied: {
			highlights: highlightLinks.length,
			flashcards: flashcardLinks.length
		}
	};
}
```

---

## 🤔 Design Decisions to Make

### **1. Should we copy tag hierarchy (parent/child)?**

**Option A: Flatten on copy** (Recommended)

- Shared tag has no parent in org workspace
- Simpler, avoids missing parent issues
- User can re-organize in org workspace

**Option B: Copy entire hierarchy**

- If tag has parent, copy parent too (recursively)
- Maintains organization structure
- More complex, could copy unintended tags

**Recommendation**: Start with **Option A (Flatten)**, add Option B later if needed.

---

### **2. What if org already has content with same source?**

**Scenario**: User shares "Product Ideas" tag with 3 highlights from same book. Org already has 2 of those highlights (from another member).

**Option A: Skip duplicates** (Recommended)

- Check if org has highlight from same source + location
- If yes, just link existing org highlight to new tag
- Avoids duplicate content in org

**Option B: Always create new copy**

- Simpler logic
- But creates duplicate highlights in org
- Could be confusing

**Recommendation**: **Option A (Skip duplicates)** for better UX.

---

### **3. What about content updates after sharing?**

**Scenario**: User shares tag, then later edits a highlight in their personal workspace. Does it update in org?

**Answer**: **NO - Copies are independent**

- Personal edits stay personal
- Org edits stay in org
- Clean separation of concerns

**Marketing Message**:

> "When you share, you give your team a snapshot of your knowledge. They can build on it independently, and you can keep evolving your personal collection."

---

### **4. Can users re-share if they update their collection?**

**Option A: Allow re-share** (Recommended)

- "Update shared collection" button
- Copies new items added since last share
- Doesn't remove items deleted from personal

**Option B: One-time share only**

- Simpler
- But less flexible

**Recommendation**: **Option A** - but implement later (not MVP).

---

## 📋 Implementation Checklist

### **Phase 1: Core Copy Logic**

- [ ] Rename `shareTag` to `copyTagToOrganization`
- [ ] Update mutation to copy tag (not transfer)
- [ ] Implement content copy logic for highlights
- [ ] Implement duplicate detection for highlights
- [ ] Add flashcard copy logic when ready
- [ ] Update junction table records

### **Phase 2: UI Updates**

- [ ] Change "Transfer" → "Share" in UI
- [ ] Update modal copy:
  - "Share [Tag Name] with Organization"
  - "This will create a copy of this collection in the organization"
  - "Your personal collection will remain unchanged"
  - Show item counts: "This will share: • The collection • X highlights • Y flashcards"
- [ ] Update tags page to show both personal and shared versions

### **Phase 3: Analytics**

- [ ] Update `TAG_SHARED` event properties
  - Add `copy_method: "snapshot"`
  - Add `items_copied` instead of `items_transferred`
  - Add `source_workspace: "personal"`
  - Add `target_workspace: "organization"`

### **Phase 4: Edge Cases**

- [ ] Handle naming conflicts (org already has tag with same name)
- [ ] Handle permission errors (user not member of org)
- [ ] Handle partial failures (some items copy, some fail)
- [ ] Add rollback logic for failed copies

---

## 🎯 Ownership Model

### **Content Ownership Rules**

**Personal Content** (owned by user):

```typescript
{
  userId: "user123",
  organizationId: null,
  teamId: null,
  ownershipType: "user"
}
```

**Organization Content** (owned by org):

```typescript
{
  userId: null,  // No specific user owner
  organizationId: "org456",
  teamId: null,
  ownershipType: "organization"
}
```

**Team Content** (owned by team):

```typescript
{
  userId: null,  // No specific user owner
  organizationId: "org456",  // Parent org
  teamId: "team789",
  ownershipType: "team"
}
```

### **Access Rules**

**Personal Content**:

- Only the user can view/edit

**Organization Content**:

- All org members can view
- Only admins can edit/delete (configurable)
- Persists even if original sharer leaves

**Team Content**:

- Only team members can view
- Only team admins can edit/delete
- Persists even if original sharer leaves

---

## 💬 Marketing Copy

### **Feature Name**: "Share Collections"

### **Tagline**:

> "Turn personal knowledge into team knowledge"

### **Feature Description**:

> When you share a collection with your team, we create a permanent copy that everyone can access and build upon - even if you leave the team. Your personal collection stays with you, unchanged.

### **Benefits**:

- ✅ **Preserve Personal Work**: Your collection remains yours
- ✅ **Build Team Knowledge**: Shared collections become team assets
- ✅ **No Lock-In**: Leave anytime, team keeps the knowledge
- ✅ **Independent Evolution**: Personal and team versions evolve separately

### **Use Cases**:

1. **Onboarding**: Share your "Getting Started" collection with new team members
2. **Research**: Share "Market Insights" with product team
3. **Learning**: Share "Best Practices" with engineering team
4. **Collaboration**: Each team member shares their expertise, team builds comprehensive knowledge base

---

## 🔮 Future Enhancements

### **Phase 2: Sync Options** (Post-MVP)

- [ ] "Keep synced" toggle: Updates in personal also update in org
- [ ] "One-way sync": Personal updates push to org, but not vice versa
- [ ] "Two-way sync": Both stay in sync (complex, maybe never)

### **Phase 3: Advanced Sharing**

- [ ] Share specific items from a tag (not entire collection)
- [ ] Share with specific teams (not entire org)
- [ ] Share with permission levels (view-only vs edit)
- [ ] Bulk share multiple tags at once

### **Phase 4: Knowledge Graph**

- [ ] Show "Shared by [User]" attribution in org workspace
- [ ] Track sharing history (who shared what, when)
- [ ] Show which personal collections have been shared
- [ ] "Re-share" to update org copy with new items

---

## 🏗️ Code Notes (for developers)

```typescript
/**
 * IMPORTANT: Tag Sharing uses COPY model, not TRANSFER
 *
 * When a user shares a tag:
 * 1. Original tag + content stays in user's personal workspace (UNCHANGED)
 * 2. New tag + content copies are created in target organization (NEW)
 * 3. Copies are INDEPENDENT - edits don't sync
 *
 * Marketing message: "Share your knowledge with your team. When you share,
 * it becomes team knowledge - forever accessible, even if members leave."
 *
 * Why copy instead of transfer?
 * - User retains ownership of their personal work
 * - Organization gets permanent knowledge base
 * - Clean separation - no complex sync logic
 * - Scales to any content type (just copy junction tables)
 *
 * Owner Transitions:
 * - Content created by user → owned by user
 * - Content shared to org → owned by org (not specific user)
 * - If user leaves org → org content stays (becomes "public knowledge" of org)
 *
 * @see dev-docs/multi-tenancy-analytics.md for analytics patterns
 * @see TAGGING_SYSTEM_ANALYSIS.md (same directory) for tagging architecture
 */
```

---

**Last Updated**: 2025-11-07  
**Status**: Architecture defined, ready for implementation  
**Next Step**: Update `shareTag` mutation to implement copy logic
