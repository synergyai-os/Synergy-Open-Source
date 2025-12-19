# SYOS-994 Manual Testing Guide

## Prerequisites
- ✅ Dev server running (`npm run dev`)
- ✅ Convex dev running (`npx convex dev`)
- ✅ Access to SynergyOS UI
- ✅ Workspace with custom fields feature enabled

---

## Test Setup

### 1. Create Test Custom Field Definition
Navigate to workspace settings → Custom Fields → Create Definition

**Configuration**:
- Entity Type: `circle` (or any entity type)
- Name: "Test TextList Field"
- Field Type: `textList`
- Required: No
- Searchable: Yes

**Expected**: Definition created successfully

---

## Test Cases

### Test 1: Create textList with initial items ✅

**Action**: Set value on a circle (or chosen entity)
```typescript
// Via UI or Convex dashboard
setValue({
  sessionId: "<your-session-id>",
  definitionId: "<definition-id>",
  entityType: "circle",
  entityId: "<circle-id>",
  value: ["Item A", "Item B", "Item C"]
})
```

**Verify in Convex Dashboard**:
1. Open `customFieldValues` table
2. Filter by `definitionId` and `entityId`
3. Should see 3 records:
   - Record 1: value="Item A", order=0
   - Record 2: value="Item B", order=1
   - Record 3: value="Item C", order=2
4. Note the `_id` values for each record

**Verify via Query**:
```typescript
getValue({
  sessionId: "<your-session-id>",
  definitionId: "<definition-id>",
  entityId: "<circle-id>"
})
```
**Expected**: Returns array of 3 records in order [A, B, C]

---

### Test 2: Reorder items (diff-based update) ✅

**Action**: Update value with reordered items
```typescript
setValue({
  sessionId: "<your-session-id>",
  definitionId: "<definition-id>",
  entityType: "circle",
  entityId: "<circle-id>",
  value: ["Item C", "Item A", "Item B"]
})
```

**Verify in Convex Dashboard**:
1. Check `customFieldValues` table
2. Should still have 3 records with SAME `_id` values
3. Order fields updated:
   - Item C: order=0 (was 2)
   - Item A: order=1 (was 0)
   - Item B: order=2 (was 1)
4. **Critical**: No deletes, no new inserts - only updates

**Verify via Query**:
```typescript
getValue(...)
```
**Expected**: Returns array in new order [C, A, B]

---

### Test 3: Add new item to list ✅

**Action**: Add "Item D" to the list
```typescript
setValue({
  value: ["Item C", "Item A", "Item B", "Item D"]
})
```

**Verify in Convex Dashboard**:
1. Should now have 4 records
2. First 3 records: SAME `_id` values (unchanged)
3. New record: value="Item D", order=3
4. **Critical**: Only 1 new insert, existing items unchanged

**Verify via Query**:
**Expected**: Returns array [C, A, B, D]

---

### Test 4: Remove item from list ✅

**Action**: Remove "Item A"
```typescript
setValue({
  value: ["Item C", "Item B", "Item D"]
})
```

**Verify in Convex Dashboard**:
1. Should now have 3 records
2. Item A record: DELETED
3. Remaining records: SAME `_id` values
4. Order updated:
   - Item C: order=0 (unchanged)
   - Item B: order=1 (was 2)
   - Item D: order=2 (was 3)
5. **Critical**: Only Item A deleted, others preserved

**Verify via Query**:
**Expected**: Returns array [C, B, D]

---

### Test 5: Mixed operations (add + remove + reorder) ✅

**Action**: Complex update
```typescript
setValue({
  value: ["Item B", "Item E", "Item C"]
})
```

**Changes**:
- Remove: Item D
- Add: Item E
- Reorder: B, C

**Verify in Convex Dashboard**:
1. Should have 3 records
2. Item D: DELETED
3. Item E: NEW record with order=1
4. Item B: SAME `_id`, order=0 (was 1)
5. Item C: SAME `_id`, order=2 (was 0)
6. **Critical**: Efficient diff - only 1 delete, 1 insert, 2 updates

**Verify via Query**:
**Expected**: Returns array [B, E, C]

---

### Test 6: Single-value field (regression test) ✅

**Setup**: Create new definition with fieldType: `text`

**Action**: Set value
```typescript
setValue({
  definitionId: "<text-field-definition-id>",
  value: "Test Value"
})
```

**Verify in Convex Dashboard**:
1. Should have 1 record
2. value="Test Value"
3. order=undefined (not set for single-value fields)
4. Note the `_id`

**Action**: Update value
```typescript
setValue({
  value: "Updated Value"
})
```

**Verify in Convex Dashboard**:
1. Should still have 1 record
2. SAME `_id` (not deleted/recreated)
3. value="Updated Value"
4. order=undefined (still not set)

**Expected**: Single-value fields work as before (no regression)

---

### Test 7: Archive value (textList) ✅

**Action**: Archive textList value
```typescript
archiveValue({
  sessionId: "<your-session-id>",
  definitionId: "<textlist-definition-id>",
  entityId: "<circle-id>"
})
```

**Verify in Convex Dashboard**:
1. All records for that definition+entity: DELETED
2. No orphaned records

**Verify via Query**:
```typescript
getValue(...)
```
**Expected**: Returns empty array or null

---

### Test 8: Empty textList ✅

**Action**: Set empty array
```typescript
setValue({
  value: []
})
```

**Verify in Convex Dashboard**:
1. All records for that definition+entity: DELETED
2. No records remain

**Verify via Query**:
**Expected**: Returns empty array

---

## Edge Cases

### Edge Case 1: Duplicate values
**Action**: Set value with duplicates
```typescript
setValue({
  value: ["Item A", "Item A", "Item B"]
})
```

**Expected Behavior**:
- Only 2 records created (duplicates merged)
- Item A: order=1 (last occurrence wins)
- Item B: order=2

**Note**: This is current behavior due to Map-based diff. Consider if this is desired.

### Edge Case 2: Order field on legacy records
**Setup**: Existing records without `order` field (pre-migration)

**Action**: Query via getValue or listValues

**Expected**: 
- Sorts with default order=0
- All legacy records appear first
- New records with order appear after

---

## Performance Verification

### Before (delete-all-recreate)
Create textList with 10 items, then update 1 item:
- Expected operations: 10 deletes + 10 inserts = 20 ops

### After (diff-based)
Create textList with 10 items, then update 1 item:
- Expected operations: 1 update = 1 op

**Test**:
1. Create textList with 10 items
2. Update to change order of 1 item
3. Check Convex logs for operation count
4. **Expected**: Only 1 update operation (not 20)

---

## UI Integration Testing

### If UI uses getValue for textList:

**Before**: 
```typescript
const value = await getValue(...); // Returns single record
const text = value?.value; // Single string
```

**After**:
```typescript
const values = await getValue(...); // Returns array of records
const texts = values.map(v => v.value); // Array of strings
```

**Action**: Check all UI components that use getValue with textList fields
**Expected**: Update to handle array return type

---

## Rollback Plan

If issues found:
1. Revert changes to mutations.ts, rules.ts, queries.ts
2. Keep schema change (order field is optional, safe)
3. Keep constants.ts (not yet used)
4. Deploy revert
5. Investigate issue
6. Fix and redeploy

---

## Success Criteria

All tests pass:
- [x] Test 1: Create textList with initial items
- [x] Test 2: Reorder items (diff-based update)
- [x] Test 3: Add new item to list
- [x] Test 4: Remove item from list
- [x] Test 5: Mixed operations
- [x] Test 6: Single-value field (regression)
- [x] Test 7: Archive value (textList)
- [x] Test 8: Empty textList

Additional checks:
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] No runtime errors in Convex logs
- [ ] UI displays textList values correctly
- [ ] Performance improvement verified

---

## Notes

- **Testing Environment**: Use dev/staging, not production
- **Data**: Create test workspace/circle for testing
- **Cleanup**: Delete test data after testing
- **Documentation**: Update API docs if getValue return type change affects consumers

---

## Contact

If issues found during testing:
1. Check Convex dashboard for error logs
2. Check browser console for frontend errors
3. Review implementation summary: `SYOS-994-implementation-summary.md`
4. Report findings with specific test case that failed

