# 2-areas/

**Ongoing responsibilities and domains we maintain**

---

## Core Areas

### Product & Strategy

- [Product Vision & Plan](product/product-vision-and-plan.md) - Vision, strategy, roadmap ⭐ START HERE
- [Product Principles](product/product-principles.md) - How we make decisions
- [Metrics](product/metrics.md) - Public dashboard (revenue, OKRs, AARRR)
- [Flow Metrics](product/flow-metrics.md) - Development flow tracking
- [Validation Framework](product/validation-framework.md) - Product validation approach

### Architecture

- [Architecture](architecture/architecture.md) - Tech stack, auth, project structure
- [Auth Architecture](architecture/auth/) - Authentication & session management
  - [WorkOS + Convex Auth](architecture/auth/workos-convex-auth-architecture.md) - Complete auth system
  - [Auth Decision](architecture/auth/auth-decision-convex-vs-workos.md) - ADR: Convex vs WorkOS
  - [Multi-Session Architecture](architecture/auth/multi-session-architecture.md) - Session handling
- [Multi-Tenancy](architecture/multi-tenancy/) - Organizations & teams
  - [Migration Plan](architecture/multi-tenancy/multi-tenancy-migration.md) - Implementation roadmap
  - [Analytics](architecture/multi-tenancy/multi-tenancy-analytics.md) - Multi-tenancy metrics
- [Data Models](architecture/data-models/) - Database schema & models

### Design

- [Design Principles](design/design-principles.md) - Visual philosophy & UX
- [Design Tokens](design/design-tokens.md) - Design system reference 🎨 **MANDATORY**
- [Component Architecture](design/component-architecture.md) - Tokens → Utilities → Patterns → Components
- [Component Library](design/component-library/) - Component catalog _(Coming Soon)_
- [Navigation Philosophy](design/navigation-philosophy.md) - UX psychology + 10-item nav strategy 🧠
- [Theme Sync](design/theme-sync.md) - Light/dark mode synchronization

### Development

- [Git Workflow](development/git-workflow.md) - Git, GitHub, Vercel, IDE guide ⚡
- [Start Me Guide](development/start-me.md) - Initial setup
- [Secrets Management](development/secrets-management.md) - `.env.local` & secret management 🔐
- [Composables Analysis](development/composables-analysis.md) - Svelte 5 composables
- [Development Tools](development/tools/) - Integrations & tools
  - [CodeRabbit Integration](development/tools/coderabbit-integration.md) - AI-powered PR reviews 🤖
  - [Linear Integration](development/tools/linear-integration.md) - Issue tracking integration
  - [GitHub Open Source Setup](development/tools/github-open-source-setup.md) - OSS configuration

### Patterns

- [Pattern Index](patterns/INDEX.md) - Fast symptom lookup ⭐ DEBUG HERE
- [Svelte Reactivity](patterns/svelte-reactivity.md) - Svelte 5 patterns
- [Convex Integration](patterns/convex-integration.md) - Backend patterns
- [UI Patterns](patterns/ui-patterns.md) - UI/UX patterns
- [Analytics](patterns/analytics.md) - PostHog tracking
- [Auth Deployment](patterns/auth-deployment.md) - Auth deployment patterns
- [Feature Flags](patterns/feature-flags.md) - Feature flag patterns
- [Ticket Writing](patterns/ticket-writing.md) - Linear ticket writing guide

### Value Streams

- [Overview](value-streams/README.md) - Value stream mapping
- [Documentation System](value-streams/documentation-system/START-HERE.md) - This system
- [How to Document](value-streams/HOW-TO-DOCUMENT.md) - Documentation guide

### Other Areas

- [RBAC](rbac/) - Role-Based Access Control
  - [RBAC Architecture](rbac/rbac-architecture.md) - Permission system design
  - [Quick Reference](rbac/rbac-quick-reference.md) - Permission checks
  - [Visual Overview](rbac/rbac-visual-overview.md) - System diagrams
- [User Journeys](user-journeys/) - User experience flows _(Coming Soon)_
- [PostHog](posthog.md) - Analytics & AARRR tracking
- [Activity Tracker](activity-tracker.md) - Activity tracking system
- [Confidentiality Guidelines](confidentiality-guidelines.md) - Privacy & security policies
- [Settings Todos](settings-todos.md) - Ongoing settings improvements

---

## What Goes in 2-areas/?

**Areas** are ongoing responsibilities with no end date. As long as the product exists, these need maintenance.

**Examples:**

- Product vision & strategy (always evolving)
- Architecture decisions (living documentation)
- Design system (maintained & expanded)
- Patterns library (grows with learnings)
- Value streams (active initiatives)
- Development workflow (continuously improved)

**Not Areas:**

- Time-bound projects with deadlines → 1-projects/
- Reference material we didn't create → 3-resources/
- Completed/deprecated work → 4-archive/

---

## Organization Structure

```
2-areas/
├── product/          # Product vision, principles, metrics
├── architecture/     # System architecture (auth, multi-tenancy, data models)
├── design/          # Design system, tokens, components
├── development/     # Git workflow, tools, setup
├── patterns/        # Code patterns & solutions
├── rbac/            # Role-Based Access Control
├── value-streams/   # Value stream mapping
└── user-journeys/   # User experience flows
```
