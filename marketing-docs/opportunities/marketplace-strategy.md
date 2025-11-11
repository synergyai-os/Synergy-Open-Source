# Marketplace Strategy: Builder Ecosystem

> **Vision**: Create a thriving marketplace where builders (developers, agencies, consultants) can create and sell apps, workflows, and integrations—extending the platform without bloating the core.

---

## Why a Marketplace?

### For the Platform

- **Extensibility**: Can't build everything ourselves
- **Scale**: Marketplace grows without bloating core
- **Community**: Builders invest in the platform
- **Revenue**: Revenue share creates sustainable ecosystem
- **Network effects**: More apps = more users = more builders

### For Builders

- **Revenue**: Earn money from apps (80/20 split)
- **Portfolio**: Build expertise, showcase work
- **Distribution**: Access to all platform users
- **Open standards**: Build once, sell to many

### For Users

- **Customization**: Extend platform for unique needs
- **Choice**: Pick apps that fit their workflow
- **Innovation**: Community creates features we can't predict
- **Integration**: Connect with tools they already use

---

## Marketplace Model

### Revenue Share (80/20 Split)

- **Builder**: 80% of revenue
- **Platform**: 20% of revenue (covers hosting, payment processing, support)

**Why 80/20?**

- Fair for builders (keeps majority of revenue)
- Sustainable for platform (covers costs)
- Industry standard (App Store, Shopify, Stripe)

### Pricing Models (Flexible)

Builders choose their pricing:

1. **Free**: No cost, open source
2. **Freemium**: Free tier + paid features
3. **One-time**: $X per install
4. **Subscription**: $X/month per organization
5. **Usage-based**: $X per action/event

---

## App Categories

### 1. Integrations

**What**: Connect with external tools

**Examples**:

- Jira sync (two-way sync of tasks, roadmaps)
- Notion integration (import docs, sync glossaries)
- Slack bot (notifications, commands, status updates)
- Google Calendar (schedule meetings, sync events)
- Loom (embed videos, sync transcripts)

**Why**: Users already use these tools, need seamless integration

---

### 2. Workflows

**What**: Custom workflows for specific use cases

**Examples**:

- Weekly retrospective workflow (automated agenda, action items)
- OKR review workflow (progress tracking, automated reports)
- User research workflow (interview notes, insights, tagging)
- Sprint planning workflow (capacity, priorities, estimates)
- Onboarding workflow (step-by-step guide, checklists)

**Why**: Every team has unique processes, workflows let them customize

---

### 3. Analytics & Reporting

**What**: Insights, dashboards, reports

**Examples**:

- Team velocity dashboard (track output, outcomes)
- OKR analytics (progress trends, burndown)
- User research insights (themes, patterns)
- Meeting effectiveness (time spent, action items completed)
- Knowledge usage (most-searched terms, glossary adoption)

**Why**: Teams want to measure what matters, custom analytics fill gaps

---

### 4. AI Enhancements

**What**: AI-powered features

**Examples**:

- Automated meeting summaries (transcribe, summarize, extract action items)
- AI-powered research tagging (auto-tag insights by theme)
- Smart notifications (AI suggests when to act)
- Content generation (generate docs, emails, summaries)
- Sentiment analysis (feedback, surveys, interviews)

**Why**: AI is powerful, but generic. Custom AI for specific workflows adds value.

---

### 5. Custom UI/UX

**What**: Alternative interfaces, themes, layouts

**Examples**:

- Dark mode themes (different color schemes)
- Kanban view (alternative to table/list)
- Gantt chart (timeline view for roadmaps)
- Mind map (visual brainstorming)
- Mobile app (native iOS/Android)

**Why**: Users have preferences, customization improves adoption

---

### 6. Productivity Tools

**What**: Utilities, helpers, shortcuts

**Examples**:

- Keyboard shortcuts (power user navigation)
- Quick add (add tasks, notes, glossary terms fast)
- Bulk actions (edit multiple items at once)
- Templates (pre-built roadmaps, OKRs, workflows)
- Clipboard sync (copy/paste across tools)

**Why**: Power users want efficiency, productivity tools speed them up

---

## Builder Journey

### 1. Discover SDK

- Browse marketplace (see what's possible)
- Read SDK docs (understand capabilities)
- Check examples (starter apps, templates)

### 2. Build App

- Use SDK (hooks, APIs, components)
- Test locally (dev environment)
- Follow guidelines (security, UX, performance)

### 3. Submit to Marketplace

- Fill out listing (name, description, screenshots)
- Set pricing (free, paid, subscription)
- Submit for review (security, quality check)

### 4. Get Approved

- Platform reviews (1-3 days)
- Feedback if changes needed
- Approved → Live in marketplace

### 5. Earn Revenue

- Users discover app (marketplace browse, search)
- Users install app (one-click install)
- Revenue share (80% to builder, 20% to platform)
- Payouts (monthly via Stripe)

### 6. Support & Iterate

- Users leave reviews (ratings, feedback)
- Builder responds (support, updates)
- Iterate based on feedback (improve app)

---

## Marketplace UI/UX

### Browse Marketplace

- **Categories**: Integrations, Workflows, Analytics, AI, UI/UX, Productivity
- **Sort by**: Popular, Recent, Top Rated, Free, Paid
- **Filter by**: Category, Pricing, Rating, Installs
- **Search**: By name, description, keywords

### App Listing Page

- **Hero**: App icon, name, tagline, "Install" button
- **Screenshots**: 3-5 screenshots showing key features
- **Description**: What it does, why it's useful, how it works
- **Pricing**: Free, one-time, subscription, usage-based
- **Reviews**: Ratings (1-5 stars), comments from users
- **Developer**: Name, website, other apps
- **Permissions**: What data the app accesses

### Install Flow

1. Click "Install"
2. Review permissions (what data app accesses)
3. Confirm install
4. App appears in sidebar or workflows
5. Configure (settings, integrations, preferences)

### Review & Ratings

- 1-5 stars
- Written review (optional)
- Upvote/downvote helpful reviews
- Developer can respond

---

## SDK for Builders

### Core APIs

- **Data API**: Read/write OKRs, roadmaps, glossaries, docs
- **User API**: Current user, permissions, org, team
- **AI API**: Call AI coach with context
- **UI API**: Render components, modals, notifications
- **Event API**: Subscribe to events (new OKR, task completed)

### Example: Jira Integration

```typescript
import { defineApp, useData, useEvents } from '@product-os/sdk';

export default defineApp({
	name: 'Jira Integration',
	version: '1.0.0',
	permissions: ['read:tasks', 'write:tasks'],

	// Sync Jira tasks to platform
	async onInstall({ config }) {
		const jiraApi = new JiraAPI(config.jiraUrl, config.apiKey);
		const tasks = await jiraApi.getTasks();

		for (const task of tasks) {
			await useData().createTask({
				title: task.summary,
				description: task.description,
				externalId: task.key
			});
		}
	},

	// Listen for task updates
	async onTaskUpdate({ task }) {
		const jiraApi = new JiraAPI(config.jiraUrl, config.apiKey);
		await jiraApi.updateTask(task.externalId, {
			summary: task.title,
			description: task.description
		});
	}
});
```

### SDK Features

- **TypeScript**: Full type safety
- **Hot reload**: Fast development
- **Testing**: Unit tests, integration tests
- **Deployment**: One command (`npm run deploy`)
- **Documentation**: Auto-generated from code

---

## Marketplace Governance

### App Review Process

**Before Launch**:

1. **Security review**: No malicious code, no data leaks
2. **UX review**: Follows design guidelines, good usability
3. **Performance review**: Doesn't slow down platform
4. **Documentation review**: Clear instructions, screenshots

**Timeline**: 1-3 days

**If rejected**: Feedback provided, resubmit after fixes

---

### App Monitoring

**After Launch**:

- **Performance**: Track load time, errors, crashes
- **Security**: Monitor for suspicious activity
- **Reviews**: Track ratings, feedback
- **Support**: Respond to user issues

**Red flags**:

- 1-2 star rating (poor quality)
- High error rate (bugs, crashes)
- Suspicious activity (data leaks, malicious code)

**Action**: Contact builder, request fixes, or remove from marketplace

---

### Builder Support

- **Documentation**: SDK docs, examples, tutorials
- **Discord**: #builders channel for questions
- **Office hours**: Weekly Q&A with core team
- **Case studies**: Spotlight successful builders

---

## Monetization Examples

### Example 1: Jira Integration (Free)

- **Pricing**: Free (open source)
- **Why free**: Attracts users, showcases capabilities
- **Builder benefit**: Portfolio, credibility

### Example 2: Advanced Analytics ($49/month)

- **Pricing**: $49/month per organization
- **Why paid**: High value, takes time to build/maintain
- **Builder revenue**: $39.20/month (80% of $49)
- **10 customers**: $392/month
- **100 customers**: $3,920/month

### Example 3: AI Meeting Summarizer ($0.10/meeting)

- **Pricing**: $0.10 per meeting summarized
- **Why usage-based**: Scales with usage
- **Builder revenue**: $0.08/meeting (80% of $0.10)
- **1,000 meetings/month**: $80/month
- **10,000 meetings/month**: $800/month

---

## Launch Strategy

### Phase 1: Invite-Only Beta (Month 1-3)

- **Who**: 5-10 trusted builders (Bjorn, contributors)
- **Goal**: Test SDK, gather feedback, build first apps
- **Outcome**: 3-5 apps ready for public launch

### Phase 2: Public Launch (Month 4)

- **Who**: Any builder can submit
- **Goal**: Grow marketplace to 10+ apps
- **Promotion**: Blog post, social, community call
- **Outcome**: 10+ apps, 100+ installs

### Phase 3: Growth (Month 5-12)

- **Tactics**: Hackathons, featured apps, builder spotlights
- **Goal**: 50+ apps, 1,000+ installs
- **Outcome**: Self-sustaining marketplace

---

## Success Metrics

### Marketplace Health

- **# Apps**: 10+ in first 6 months, 50+ in 12 months
- **# Installs**: 100+ in first 6 months, 1,000+ in 12 months
- **# Active Builders**: 10+ in first 6 months, 50+ in 12 months

### Builder Success

- **Avg Revenue**: $500+/month for paid apps
- **Top Builders**: 3+ earning $1K+/month
- **Retention**: 80%+ builders publish 2+ apps

### User Satisfaction

- **Avg Rating**: 4+ stars
- **Review Rate**: 20%+ of installers leave reviews
- **Support Tickets**: < 5% require platform intervention

---

## Risks & Mitigations

### Risk: No builders interested

**Mitigation**:

- Invite trusted builders (Bjorn, contributors)
- Showcase revenue potential (case studies)
- Hackathons with prizes

### Risk: Low-quality apps

**Mitigation**:

- App review process (security, UX, performance)
- Monitoring (ratings, errors, support tickets)
- Featured apps (highlight quality)

### Risk: Security vulnerabilities

**Mitigation**:

- Sandboxing (apps can't access unauthorized data)
- Permission system (users approve data access)
- Security review before launch

### Risk: Cannibalization (marketplace apps replace core features)

**Mitigation**:

- Core features always free (OKRs, roadmaps, glossaries)
- Marketplace for enhancements, not replacements
- Clear positioning (core vs. marketplace)

---

**Next Steps**:

- **Phase 1**: Design SDK (API, components, examples)
- **Phase 2**: Build marketplace UI (browse, install, rate)
- **Phase 3**: Invite beta builders (Bjorn, contributors)
- **Phase 4**: Launch publicly (blog, social, community)

---

**Related**:

- [High-Level Ideas](./high-level-ideas.md) - Opportunity 7
- [Community Strategy](../go-to-market/community-strategy.md) - Builders segment
