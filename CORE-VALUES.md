# SynergyOS Core Values

**Decision-Making Framework for Our Community**

## Origin Story

We failed at Axon 1.0. It was too ambitious, too rigid, too perfect. So we started over with a different philosophy: build in public, learn from mistakes, and create something useful together.

SynergyOS (OS = **Open Source**) is a side project with serious purpose. No version numbers. No pressure to be perfect. Just continuous evolution, documented and shared.

For the full story, see our [Brand Identity](marketing-docs/brand/identity.md).

---

## Our Core Values

These six values guide every decision we make. When in doubt, refer back to these.

### 1. **Learning from Failure**

We document what went wrong as much as what went right.

**In practice:**
- Commit messages explain not just what changed, but why previous approaches failed
- Documentation includes "what we tried first" sections
- Pattern files start with symptoms and anti-patterns before solutions
- We celebrate learning moments, not just wins

**Decision framework:** When choosing between hiding a mistake or documenting it, document it. Future contributors (including AI assistants) will thank you.

### 2. **Building in Public**

Open source isn't just about code. It's about process, decisions, mistakes, and victories.

**In practice:**
- Development docs live in `/dev-docs` alongside code
- We share our cursor commands and AI workflows (see `.cursor/commands/`)
- Blog posts come from actual notes we take while building
- Commit history tells a story, not just a changelog

**Decision framework:** When in doubt about sharing, share. If it helped you understand something, it'll help someone else.

### 3. **Collaboration (Human + AI)**

We work with AI tools like Cursor and Claude. It's part of our workflow, not something to hide.

**In practice:**
- We have `/start` commands to onboard new AI sessions efficiently
- Documentation is optimized for both humans and AI scrapers (clear structure, semantic headers, no fluff)
- We acknowledge when AI suggested a solution or pattern
- Patterns are structured for context retrieval

**Decision framework:** Write for the reader, whether they're human or AI. Clear, structured, honest communication works for both.

### 4. **Quality Without Perfection**

Side project energy means we ship when ready, polish when it matters, and iterate continuously.

**In practice:**
- No version numbers (just continuous improvement)
- Tests for critical paths, not 100% coverage theater
- Design tokens over pixel-perfect mockups
- Working feature beats perfect architecture

**Decision framework:** Ask "does this solve the user's problem?" before "is this architecturally perfect?" Ship solutions, refactor later with knowledge.

### 5. **Knowledge That Sticks**

We practice what we preach: the CODE framework (Collect → Organise → Distill → Express).

**In practice:**
- Collect: Document patterns as we discover them
- Organise: Structure docs by domain (svelte-reactivity.md, convex-integration.md)
- Distill: INDEX.md provides quick pattern lookup
- Express: Blog posts and open source contributions share what we learned

**Decision framework:** If you learned something building a feature, capture it. If you solved a problem twice, create a pattern. If the pattern helps others, share it publicly.

### 6. **Open Business, Open Books**

We make money without charging for knowledge. Our goals, metrics, and revenue are public—no secrets.

**In practice:**
- Core platform: FREE forever (open source, self-hosted)
- Knowledge/docs: FREE forever (learning should be accessible)
- Revenue streams: Managed hosting, enterprise support, marketplace (80/20 split favoring builders), consulting
- Metrics dashboard: Updated monthly with real numbers (revenue, costs, users, community growth)
- OKRs: Published quarterly with progress visible to everyone
- Failed experiments: Documented openly so others can learn from our mistakes

**Decision framework:** If we can't explain our business model transparently to the community, we shouldn't do it. Community trust > short-term revenue. When choosing between hiding metrics or sharing them, share them.

**Inspired by:** PostHog (public MRR dashboard), Supabase (free tier + hosting model), Cal.com (open source + enterprise), Buffer (transparent salaries), GitLab (public handbook with KPIs)

**See our metrics:** [dev-docs/2-areas/metrics.md](dev-docs/2-areas/metrics.md) - Updated monthly, no secrets.

---

## Decision Framework

When making decisions (code architecture, features, contributions), use this hierarchy:

1. **Does it help users retain knowledge?** (Our mission)
2. **Does it align with our core values?** (Check the six above)
3. **Can we document it clearly?** (For humans and AI)
4. **Can we maintain it long-term?** (Side project sustainability)
5. **Does it feel right?** (Trust your instincts)

### Resolving Conflicts

When two approaches both seem valid:

- **Technical decisions:** Choose the one we can explain clearly in docs
- **Feature decisions:** Choose the one that serves the CODE framework
- **Architecture decisions:** Choose the simpler one (we can always refactor)
- **Community decisions:** Choose the more transparent and inclusive option

---

## Community Principles

### How We Collaborate

**For Contributors:**
- Fork it, try it, break it, fix it, share what you learned
- Submit PRs with context (why did you make this change?)
- Ask questions in discussions (we're all learning together)
- Share your use case (helps us understand real needs)

**For Maintainers:**
- Review with curiosity, not criticism
- Explain the "why" behind suggestions
- Celebrate contributions, especially first-time ones
- Document new patterns that emerge from PRs

### We Build For Users, Not Investors

This is a side project. No VC pitches. No growth targets. Just building something useful and seeing where it goes.

If it helps 10 people, great. If it helps 10,000 people, even better. If it teaches us how to build better products, that's the real win.

### Open Source Ethos

- **Code**: Open source (MIT license)
- **Docs**: Public and detailed
- **Process**: Documented and shared
- **Mistakes**: Acknowledged and learned from
- **Wins**: Celebrated but not oversold

### Collaboration Welcome

- Fork it and build your version
- Use it to learn (that's what we're doing)
- Teach us something we missed
- Share patterns that work for you
- Build on our mistakes (we documented them for you)

That's the **Synergy** in SynergyOS.

---

## Using These Values

**When writing code:** Think about the next person (human or AI) reading it. Clear names, documented patterns, explained decisions.

**When writing docs:** Structure matters. Use semantic headers. Write for understanding, not word count. Optimize for both humans and AI.

**When reviewing PRs:** Ask "does this align with our values?" If yes, and it works, merge it. Perfect is the enemy of shipped.

**When stuck:** Check `dev-docs/patterns/INDEX.md` first. Then ask in discussions. Document the answer for next time.

---

**Last Updated:** January 2025  
**Status:** Living document - will evolve as we learn and grow

**Questions?** Open a discussion. We're figuring this out together.

