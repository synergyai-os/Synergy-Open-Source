# Scripts Directory

Utility scripts for development, CI/CD, and maintenance tasks.

---

## Confidentiality Scripts

### Adding New Client Names

**When you need to add a new confidential client name:**

1. **Edit `confidentiality-config.ts`**:

   ```typescript
   export const CONFIDENTIAL_NAMES = ['Saprolab', 'ZDHC', 'NewClientName'];

   export const SANITIZATION_MAP: Record<string, string> = {
   	Saprolab: 'Agency Partner',
   	ZDHC: 'Client',
   	NewClientName: 'Generic Client Description',
   	newclientname: 'generic-client-description' // lowercase variant
   };
   ```

2. **Update `check-confidentiality.sh`** (keep in sync):

   ```bash
   CONFIDENTIAL_NAMES=(
     "Saprolab"
     "ZDHC"
     "NewClientName"
   )
   ```

3. **Test**:
   ```bash
   npm run check:confidentiality
   ```

**Why two files?**

- TypeScript config (`confidentiality-config.ts`) - Used by sanitization script
- Bash array (`check-confidentiality.sh`) - Used by bash check script
- Both must be kept in sync manually (bash can't import TypeScript)

---

## Available Scripts

### Confidentiality

- `check-confidentiality.sh` - Check for confidential client names
- `sanitize-docs.ts` - Sanitize documentation (replace client names)

### Other Scripts

- `check-sessionid-usage.sh` - Check for sessionId migration issues
- `seed-org-chart.ts` - Seed workspace chart test data
- See individual script files for usage

---

## Running Scripts

**Via npm:**

```bash
npm run check:confidentiality
npm run sanitize:docs
```

**Directly:**

```bash
./scripts/check-confidentiality.sh
npx tsx scripts/sanitize-docs.ts
```
