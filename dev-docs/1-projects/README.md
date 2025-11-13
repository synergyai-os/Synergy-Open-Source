# 1-projects/

**Time-bound initiatives with specific outcomes and deadlines**

---

## 🚧 Active Projects (4)

| Project                                                       | Status         | Owner | Started      | Slices | Est     |
| ------------------------------------------------------------- | -------------- | ----- | ------------ | ------ | ------- |
| [Team Access & Permissions](./team-access-permissions/)       | 🚧 In Progress | Randy | Nov 10, 2025 | 0/7    | 28h     |
| [Multi-Workspace Auth](./multi-workspace-auth/)               | 🚧 In Progress | Randy | Nov 10, 2025 | 0/7    | -       |
| [Security Architecture Fixes](./security-architecture-fixes/) | 🚧 In Progress | Randy | Nov 12, 2025 | -      | 4 weeks |
| [AI Docs System](./ai-docs-system/)                           | 🚧 In Progress | Randy | -            | -      | -       |

**See Also**: [Project Initialization Summary](../4-archive/PROJECT-INITIALIZATION-COMPLETE.md)

---

## What Goes in 1-projects/?

**Projects** have:

- ✅ Clear deadline or end date
- ✅ Specific outcome/deliverable
- ✅ Completion criteria
- ✅ Start and end milestones

**Examples:**

- "Launch mobile app v1.0 by Q2"
- "Migrate to new auth system by March"
- "Implement search feature sprint"
- "Fix critical security vulnerabilities (4 weeks)"

**Not Projects:**

- Ongoing maintenance → 2-areas/
- Reference docs → 3-resources/
- Completed work → 4-archive/
- Patterns & architecture → 2-areas/patterns/ or 2-areas/architecture/

---

## Project Structure

Each project folder should contain:

```
project-name/
├── README.md              # Project overview, goals, timeline
├── vertical-slices.md     # Implementation slices (if using Shape Up)
├── decisions/             # Architecture Decision Records (ADRs)
│   └── 001-decision-name.md
├── testing-checklist.md   # Testing requirements (optional)
└── [other project files]  # Implementation specs, etc.
```

---

## How to Use

When starting a project:

1. Create folder: `1-projects/project-name/`
2. Add `README.md` with goals, timeline, success criteria
3. Link from main README (this file)
4. When complete, move to `4-archive/`

---

## Related Documentation

- **[Architecture](../../2-areas/architecture/architecture.md)** - System architecture
- **[Patterns Index](../../2-areas/patterns/INDEX.md)** - Code patterns & solutions
- **[Development Workflow](../../2-areas/development/git-workflow.md)** - Git, GitHub, Vercel
