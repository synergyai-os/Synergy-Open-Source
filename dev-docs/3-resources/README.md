# 3-resources/

**Reference material and external knowledge**

---

## Available Resources

### Testing

- **[Testing Strategy](testing/testing-strategy.md)** - Testing approach & philosophy
- **[Testing Organization](testing/testing-organization.md)** - Test structure & organization
- **[Testing Priorities](testing/testing-priorities.md)** - What to test first
- **[Testing Quick Reference](testing/testing-quick-reference.md)** - Quick lookup guide
- **[Test Automation](testing/test-automation.md)** - Automated testing setup
- **[Phase 2 Test Instructions](testing/PHASE_2_TEST_INSTRUCTIONS.md)** - Phase 2 testing guide
- **[PostHog Test Plan](testing/POSTHOG_TEST_PLAN.md)** - Analytics testing
- **[Testing Quick Start](testing/TESTING-QUICK-START.md)** - Get started with testing

### Deployment & Operations

- **[Trunk-Based Deployment Summary](deployment/trunk-based-deployment-implementation-summary.md)** ⭐ **START HERE** - Complete implementation overview
- **[Deployment Procedures](deployment/deployment-procedures.md)** - CI/CD, monitoring, rollback playbooks
- **[Progressive Rollout Checklist](deployment/progressive-rollout-checklist.md)** - Phased feature rollout guide
- **[Production Checklist](deployment/production-checklist.md)** - Pre-launch verification
- **[Error Handling & Monitoring](deployment/error-handling-monitoring.md)** - Error boundaries, PostHog integration
- **[Mobile Strategy](deployment/mobile-strategy.md)** - iOS/Android deployment

### Guides & Quick References

- **[Git Cheat Sheet](guides/git-cheat-sheet.md)** - Quick Git reference
- **[Linear + GitHub Integration](guides/linear-github-integration.md)** - Issue tracking workflow
- **[Legacy Code Cleanup Guide](guides/legacy-code-cleanup-guide.md)** - Identify and remove unused code

### Setup

- **[Install Dependencies](setup/INSTALL_DEPS.md)** - Initial setup instructions
- **[WorkOS Setup](setup/WORKOS_SETUP.md)** - WorkOS configuration

### Security & Configuration

- **[Encryption Setup](encryption/ENCRYPTION-SETUP.md)** - Encryption configuration

---

## What Goes in 3-resources/?

**Resources** are reference materials that:

- 📚 We reference but didn't necessarily create
- 📚 External documentation and guides
- 📚 Checklists and templates
- 📚 Standards and best practices
- 📚 Library documentation links

**Examples:**

- Production deployment checklists
- Testing frameworks documentation
- Security audit guidelines
- API reference docs
- Tool configuration templates

**Not Resources:**

- Our own patterns → 2-areas/patterns/
- Our strategy docs → 2-areas/
- Active work → 1-projects/
- Old docs → 4-archive/

---

## Resources vs Areas vs Patterns

| Category              | Purpose            | Example                        |
| --------------------- | ------------------ | ------------------------------ |
| **3-resources/**      | External reference | "Jest Testing Guide"           |
| **2-areas/patterns/** | Our learnings      | "Svelte 5 Reactivity Patterns" |
| **2-areas/**          | Our ongoing work   | "Product Vision"               |

**Rule of thumb:** If we wrote it and learned from doing it → **patterns**. If we're referencing external knowledge → **resources**.

---

## Organization Structure

```
3-resources/
├── testing/         # All testing documentation
├── deployment/      # CI/CD, operations, production
├── guides/          # Quick references & cheat sheets
├── setup/           # Initial setup instructions
└── encryption/      # Security & configuration
```
