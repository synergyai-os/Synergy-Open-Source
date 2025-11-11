# GitHub Open Source Setup Guide

**Status**: ✅ Complete  
**Last Updated**: 2025-01-XX

This guide documents the GitHub repository setup for SynergyOS as an open-source project.

---

## Overview

When making a repository public on GitHub, there are several best practices to follow to ensure security, maintainability, and a welcoming community experience.

---

## ✅ Completed Setup

### 1. Repository Configuration

- [x] **License**: MIT License (`LICENSE`)
- [x] **Package.json**: Set `"private": false`
- [x] **README**: Comprehensive project documentation
- [x] **CONTRIBUTING.md**: Contribution guidelines

### 2. Community Health Files

- [x] **CODE_OF_CONDUCT.md**: Contributor Covenant Code of Conduct
- [x] **.github/SECURITY.md**: Security policy and vulnerability reporting
- [x] **.github/ISSUE_TEMPLATE/**: Bug report and feature request templates
- [x] **.github/pull_request_template.md**: PR template with checklist

### 3. Branch Protection (Manual Setup Required)

**⚠️ Action Required**: Set up branch protection rules in GitHub UI

**Why**: Protects the `main` branch from force pushes, accidental deletions, and requires code reviews before merging.

**Steps**:

1. Go to: `https://github.com/synergyai-os/Synergy-Open-Source/settings/branches`
2. Click **"Add branch protection rule"** or **"Add ruleset"**
3. Configure the following:

#### Recommended Settings for `main` Branch:

**Basic Protection**:
- ✅ **Block force pushes**: Prevent force pushes to matching branches
- ✅ **Block deletions**: Prevent deletion of matching branches
- ✅ **Require pull request reviews before merging**: 
  - Required approving reviews: `1`
  - Dismiss stale pull request approvals when new commits are pushed: `true`
  - Require review from Code Owners: `false` (optional, enable if you add CODEOWNERS)

**Status Checks**:
- ✅ **Require status checks to pass before merging**:
  - Require branches to be up to date before merging: `true`
  - Required status checks:
    - `Quality Checks` (from `.github/workflows/quality-gates.yml`)
    - Add any other required checks

**Additional Settings**:
- ✅ **Require conversation resolution before merging**: All comments must be resolved
- ✅ **Do not allow bypassing the above settings**: Even admins must follow rules
- ⚠️ **Allow force pushes**: `false` (keep disabled)
- ⚠️ **Allow deletions**: `false` (keep disabled)

**Alternative: Using Rulesets (Newer Feature)**

GitHub now offers "Rulesets" which provide more flexible branch protection:

1. Go to: `Settings` → `Rules` → `Rulesets` → `New branch ruleset`
2. Name: `main-branch-protection`
3. Enforcement: `Active`
4. Target branches: `main`
5. Configure rules:
   - ✅ **Block force pushes**
   - ✅ **Block deletions**
   - ✅ **Require pull request reviews** (1 approval)
   - ✅ **Require status checks** (`Quality Checks`)
   - ✅ **Require conversation resolution**

### 4. Security Features

**Enable in GitHub Settings**:

1. **Dependabot Alerts**:
   - Go to: `Settings` → `Code security and analysis`
   - Enable: **"Dependabot alerts"** and **"Dependabot security updates"**

2. **Secret Scanning**:
   - Enable: **"Secret scanning"** (automatically scans for exposed secrets)

3. **Code Scanning** (Optional):
   - Enable: **"Code scanning"** → Choose **"Set up this workflow"** → Select **"Default"**
   - This uses GitHub's CodeQL analysis

4. **Private Vulnerability Reporting**:
   - Enable: **"Private vulnerability reporting"** (allows users to report vulnerabilities privately)

### 5. Repository Settings

**General Settings** (`Settings` → `General`):

- ✅ **Features**:
  - Issues: Enabled
  - Projects: Enabled (optional)
  - Wiki: Disabled (we use docs in repo)
  - Discussions: Enabled (recommended for community)
  - Packages: Disabled (unless needed)

- ✅ **Pull Requests**:
  - Allow merge commits: Yes
  - Allow squash merging: Yes
  - Allow rebase merging: Yes
  - Automatically delete head branches: Yes (cleanup)

- ✅ **Archive this repository**: Disabled

---

## Branch Protection Best Practices

### Why Branch Protection Matters

1. **Prevents Accidents**: Blocks force pushes and deletions that could lose work
2. **Ensures Quality**: Requires code reviews and passing tests before merging
3. **Maintains History**: Prevents rewriting history on main branch
4. **Security**: Prevents unauthorized changes to critical branches

### What Gets Protected

- **`main` branch**: Production-ready code
- **`master` branch**: If you still use it (consider migrating to `main`)

### What Doesn't Need Protection

- Feature branches (`feature/*`)
- Bug fix branches (`fix/*`)
- Documentation branches (`docs/*`)

These are typically deleted after merging anyway.

---

## Security Best Practices

### For Repository Maintainers

1. **Enable 2FA**: Require two-factor authentication for all collaborators
2. **Review Access**: Regularly audit who has access to the repository
3. **Monitor Activity**: Review audit logs for suspicious activity
4. **Keep Dependencies Updated**: Use Dependabot to automate updates
5. **Scan for Secrets**: Never commit API keys, passwords, or tokens

### For Contributors

1. **Never Commit Secrets**: Use environment variables
2. **Keep Dependencies Updated**: Run `npm audit` regularly
3. **Follow Security Policy**: Report vulnerabilities responsibly
4. **Review Code Carefully**: Especially security-sensitive changes

---

## Community Health Checklist

Use GitHub's community health insights to track:

- [ ] **License**: Present and recognized
- [ ] **README**: Clear and comprehensive
- [ ] **Contributing Guidelines**: Present (`CONTRIBUTING.md`)
- [ ] **Code of Conduct**: Present (`CODE_OF_CONDUCT.md`)
- [ ] **Issue Templates**: Configured
- [ ] **Pull Request Template**: Configured
- [ ] **Security Policy**: Present (`.github/SECURITY.md`)

**View**: `https://github.com/synergyai-os/Synergy-Open-Source/community`

---

## Quick Reference

### Branch Protection Setup

```bash
# View current branch protection (requires GitHub CLI)
gh api repos/synergyai-os/Synergy-Open-Source/branches/main/protection

# Or visit in browser:
# https://github.com/synergyai-os/Synergy-Open-Source/settings/branches
```

### Security Features

- **Dependabot**: `Settings` → `Code security and analysis`
- **Secret Scanning**: Automatic (enabled by default for public repos)
- **Code Scanning**: Optional (CodeQL)

### Community Health

- **Insights**: `https://github.com/synergyai-os/Synergy-Open-Source/community`
- **Metrics**: Stars, forks, contributors, issues, PRs

---

## Troubleshooting

### "Your main branch isn't protected" Warning

**Solution**: Follow the branch protection setup steps above.

### Dependabot Not Running

**Check**:
1. `Settings` → `Code security and analysis` → Dependabot alerts enabled
2. `Settings` → `Secrets and variables` → `Actions` → Check for required secrets
3. Review `.github/dependabot.yml` (if exists)

### Status Checks Not Showing

**Check**:
1. Workflow file exists: `.github/workflows/quality-gates.yml`
2. Workflow runs successfully on PRs
3. Branch protection rule includes the check name exactly

---

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Open Source Guide](https://opensource.guide/)
- [Contributor Covenant](https://www.contributor-covenant.org/)

---

## Next Steps

1. ✅ **Set up branch protection** (manual step in GitHub UI)
2. ✅ **Enable security features** (Dependabot, secret scanning)
3. ✅ **Review community health** (check insights page)
4. ✅ **Monitor activity** (watch for issues, PRs, discussions)

**Status**: Ready for open source! 🎉

