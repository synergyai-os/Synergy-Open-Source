# Chromatic Setup Guide - SYOS-531

**Status**: In Progress  
**Ticket**: SYOS-531 - Phase 2: Create Chromatic Project

---

## Overview

This guide walks you through setting up Chromatic for visual regression testing with Storybook.

**What's Already Done**:

- ✅ Chromatic packages installed (`@chromatic-com/storybook@^4.1.3`, `chromatic@^13.3.4`)
- ✅ Chromatic addon configured in `.storybook/main.ts`
- ✅ Configuration files created (`chromatic.config.json`, `.github/workflows/chromatic.yml`)

**What You Need to Do**:

1. Create Chromatic project (browser)
2. Get project token
3. Add token to GitHub Secrets
4. Update `chromatic.config.json` with project ID
5. Test connection locally

---

## Step 1: Create Chromatic Project

1. **Visit Chromatic**: https://www.chromatic.com
2. **Sign in** with your GitHub account (you mentioned you have an account)
3. **Create New Project**:
   - Click "Create Project" or "New Project"
   - Select "Storybook" as the integration type
   - Choose your GitHub repository: `randyhereman/SynergyOS` (or your repo name)
   - Project name: `SynergyOS` (or your preferred name)
   - **Important**: Select **"Open Source"** tier (5000 snapshots/month free)

4. **After Project Creation**:
   - Chromatic will show you a **Project Token** (looks like: `chr_xxxxxxxxxxxxx`)
   - **Copy this token** - you'll need it for Step 2
   - Chromatic will also show a **Project ID** (looks like: `Project:xxxxxxxxxxxxx`)
   - **Copy this Project ID** - you'll need it for Step 4

---

## Step 2: Add Token to GitHub Secrets

1. **Go to GitHub Repository**: https://github.com/randyhereman/SynergyOS (or your repo)
2. **Navigate to Settings**:
   - Click "Settings" tab
   - Go to "Secrets and variables" → "Actions"
3. **Add New Secret**:
   - Click "New repository secret"
   - Name: `CHROMATIC_PROJECT_TOKEN`
   - Value: Paste the Project Token from Step 1
   - Click "Add secret"

**Verification**: You should see `CHROMATIC_PROJECT_TOKEN` in your secrets list.

---

## Step 3: Update Configuration File

1. **Open** `chromatic.config.json` in the project root
2. **Replace** `YOUR_PROJECT_ID_HERE` with your actual Project ID from Step 1
3. **Save** the file

**Example**:

```json
{
	"$schema": "https://www.chromatic.com/config-file.schema.json",
	"projectId": "Project:abc123def456",
	"onlyChanged": true,
	"zip": true,
	"buildScriptName": "build-storybook"
}
```

---

## Step 4: Test Connection Locally

1. **Set environment variable** (temporary for testing):

   ```bash
   export CHROMATIC_PROJECT_TOKEN="chr_your_token_here"
   ```

2. **Run Chromatic CLI**:

   ```bash
   npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN
   ```

3. **Expected Output**:
   - Chromatic will build Storybook
   - Upload snapshots to Chromatic
   - Show a URL to view results in Chromatic dashboard
   - First run will establish baseline snapshots

4. **Verify in Chromatic Dashboard**:
   - Visit the URL shown in terminal output
   - You should see all Storybook stories as snapshots
   - Baseline is now established ✅

**Note**: After testing, you can remove the environment variable. GitHub Actions will use the secret automatically.

---

## Step 5: Verify GitHub Actions Integration

1. **Push changes** to a branch:

   ```bash
   git add chromatic.config.json .github/workflows/chromatic.yml CHROMATIC_SETUP.md
   git commit -m "feat: Add Chromatic visual testing setup (SYOS-531)"
   git push origin your-branch-name
   ```

2. **Create Pull Request** (or push to main)

3. **Check GitHub Actions**:
   - Go to "Actions" tab in GitHub
   - You should see "Chromatic Visual Testing" workflow running
   - Chromatic will comment on your PR with visual diff results

---

## Success Criteria Checklist

- [ ] Chromatic project created (open-source tier)
- [ ] Project token added to GitHub Secrets (`CHROMATIC_PROJECT_TOKEN`)
- [ ] `chromatic.config.json` updated with Project ID
- [ ] Local test connection successful (snapshots uploaded)
- [ ] GitHub Actions workflow runs successfully on PR
- [ ] Chromatic dashboard shows project and snapshots

---

## Troubleshooting

### "Project token not found"

- Verify `CHROMATIC_PROJECT_TOKEN` is set in GitHub Secrets
- Check secret name matches exactly (case-sensitive)

### "Project ID not found"

- Verify `chromatic.config.json` has correct Project ID
- Project ID format: `Project:xxxxxxxxxxxxx`

### "Build failed"

- Ensure `npm run build-storybook` works locally first
- Check Storybook configuration is correct

### "No snapshots uploaded"

- Verify Storybook stories exist and are valid
- Check `.storybook/main.ts` includes Chromatic addon

---

## Next Steps (Future Tickets)

- **SYOS-532**: Configure TurboSnap (only test changed stories)
- **SYOS-533**: Set up visual diff review workflow
- **SYOS-534**: Integrate Chromatic into PR review process

---

## Reference

- [Chromatic Storybook Docs](https://www.chromatic.com/docs/storybook)
- [Chromatic GitHub Action](https://github.com/chromaui/chromatic-cli-action)
- [TurboSnap Documentation](https://www.chromatic.com/docs/turbosnap)

---

**Last Updated**: 2025-11-23  
**Ticket**: SYOS-531
