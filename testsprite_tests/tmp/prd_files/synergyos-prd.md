# SynergyOS Product Requirements Document

## Product Overview

**Product Name**: SynergyOS  
**Version**: 2.0  
**Date**: November 2025  
**Status**: Active Development

### Vision Statement

Build the organizational platform that product teams wish existed—one that embeds learning, AI coaching, product discovery, and delivery at the core, powered by a community of builders who want to accelerate the smart use of AI.

### Product Description

SynergyOS is a privacy-first platform that integrates product discovery, delivery, and team collaboration with AI coaching trained on company data. It combines the organizational capabilities of Holaspirit, the documentation power of Notion, and the AI assistance of ChatGPT—but privacy-first, community-driven, and built specifically for product teams.

---

## Problem Statement

### For Product Teams

Product teams today struggle with:

1. **Fragmented Tools**: Context switching between Notion, Jira, Miro, Slack, and Loom kills productivity
2. **Learning Takes Too Much Effort**: Glossaries exist but aren't used, tribal knowledge lives in people's heads
3. **Alignment is Hard**: Unclear strategies, outdated roadmaps, meetings don't result in action
4. **We Create More Than We Consume**: 100 documents written, 5 read; decisions made but rationale forgotten
5. **Existing Solutions Don't Fit**: Holaspirit is expensive and rigid, Notion is too general-purpose, Jira is engineering-centric

### For Organizations

Software companies need:

- A system to organize teams and their knowledge
- Product discovery and delivery tools in one place
- Outcome-driven frameworks (OKRs, continuous discovery)
- Privacy and control over their data
- Customization without rebuilding everything

---

## Solution Overview

### Core Features

1. **Universal Inbox** (`/inbox`)
   - Collect and organize content from any source
   - Readwise integration ready
   - Three-column layout (Linear-style)
   - Polymorphic source views (Readwise, Photo, Manual)

2. **Flashcard System** (`/flashcards`, `/study`)
   - AI-powered flashcard generation from highlights/notes
   - FSRS spaced repetition algorithm
   - List and study modes
   - Full CODE workflow: Collect → Organise → Distill → Express

3. **Rich Notes Editor** (`/notes`)
   - ProseMirror-based rich text editor
   - AI content detection
   - Markdown export for blog
   - Full CODE workflow support

4. **Authentication** (`/login`, `/register`, `/auth/callback`)
   - WorkOS-based authentication
   - Account linking and session management
   - Multi-account switching support

5. **Settings & Permissions** (`/settings`)
   - User settings management
   - RBAC (Role-Based Access Control) system
   - Permissions management

6. **Marketing Landing Page** (`/`)
   - Product marketing with hero section
   - Features showcase
   - Waitlist signup form
   - Community call-to-action

### Technical Architecture

**Frontend**:

- Framework: SvelteKit 5
- Language: TypeScript
- UI Library: Bits UI (headless components)
- Styling: Tailwind CSS 4 with semantic design tokens
- State Management: Svelte 5 Runes ($state, $derived)
- Routing: SvelteKit file-based routing

**Backend**:

- Database: Convex (real-time database & serverless functions)
- Authentication: WorkOS
- Email: Resend

**Mobile**:

- Framework: Capacitor 7
- Platforms: iOS

**Testing**:

- Unit Tests: Vitest (browser and server environments)
- E2E Tests: Playwright
- Test Coverage: Critical workflows (auth, inbox, settings, quick-create)

**Deployment**:

- Platform: Vercel
- Static Adapter: @sveltejs/adapter-vercel

---

## User Stories

### As a Product Team Member

- **US-1**: I want to collect content from multiple sources (Readwise, photos, manual entry) so I can centralize my knowledge
- **US-2**: I want to generate flashcards from my highlights so I can retain important information
- **US-3**: I want to study flashcards using spaced repetition so I can remember information long-term
- **US-4**: I want to create rich text notes so I can capture and organize my thoughts
- **US-5**: I want to access my content from any device so I can work flexibly

### As a Product Manager

- **US-6**: I want to see all team content in one inbox so I can stay aligned
- **US-7**: I want to track product discovery and delivery in one place so I can manage outcomes
- **US-8**: I want AI coaching trained on our company data so I can get context-aware assistance

### As a Developer

- **US-9**: I want to self-host the platform so I can maintain privacy and control
- **US-10**: I want to customize workflows so I can adapt the platform to our needs
- **US-11**: I want to integrate with existing tools (Notion, Linear, Slack) so I don't have to switch contexts

---

## Functional Requirements

### FR-1: Universal Inbox

**Priority**: High  
**Status**: Implemented

- Three-column layout (list, detail, actions)
- Support for multiple source types (Readwise, Photo, Manual)
- Filtering and search capabilities
- Keyboard navigation (J/K keys)
- Real-time updates via Convex

**Acceptance Criteria**:

- [ ] User can view all inbox items in a list
- [ ] User can select an item to view details
- [ ] User can filter items by source type
- [ ] User can navigate using keyboard shortcuts
- [ ] Items update in real-time when changed

### FR-2: Flashcard Generation

**Priority**: High  
**Status**: Implemented

- AI-powered flashcard generation from highlights/notes
- Support for multiple flashcard formats
- Integration with Claude API
- FSRS algorithm for spaced repetition

**Acceptance Criteria**:

- [ ] User can generate flashcards from selected highlights
- [ ] Flashcards are generated using AI (Claude API)
- [ ] User can review generated flashcards before saving
- [ ] Flashcards are stored in Convex database
- [ ] Flashcards support spaced repetition scheduling

### FR-3: Flashcard Study Interface

**Priority**: High  
**Status**: Implemented

- List view of all flashcards
- Study mode with spaced repetition
- FSRS algorithm integration
- Progress tracking

**Acceptance Criteria**:

- [ ] User can view all flashcards in a list
- [ ] User can enter study mode
- [ ] Study mode shows cards based on FSRS schedule
- [ ] User can rate card difficulty (again, hard, good, easy)
- [ ] System updates card schedule based on ratings

### FR-4: Rich Notes Editor

**Priority**: Medium  
**Status**: Implemented

- ProseMirror-based editor
- Markdown support
- AI content detection
- Export to markdown for blog

**Acceptance Criteria**:

- [ ] User can create and edit rich text notes
- [ ] Editor supports markdown syntax
- [ ] User can export notes to markdown
- [ ] AI can detect content type in notes
- [ ] Notes are stored in Convex database

### FR-5: Authentication

**Priority**: High  
**Status**: Implemented

- WorkOS-based authentication
- Session management
- Account linking
- Multi-account switching

**Acceptance Criteria**:

- [ ] User can register with email
- [ ] User can login with WorkOS
- [ ] Sessions are securely managed
- [ ] User can link multiple accounts
- [ ] User can switch between linked accounts

### FR-6: Settings & Permissions

**Priority**: Medium  
**Status**: Implemented

- User settings management
- RBAC system
- Permissions configuration
- Organization settings (future)

**Acceptance Criteria**:

- [ ] User can update profile settings
- [ ] User can configure preferences
- [ ] Admin can manage permissions
- [ ] RBAC system enforces permissions
- [ ] Settings are persisted in Convex

### FR-7: Marketing Landing Page

**Priority**: Medium  
**Status**: Implemented

- Hero section with value proposition
- Features showcase
- Waitlist signup form
- Community call-to-action

**Acceptance Criteria**:

- [ ] Landing page loads quickly (< 2s)
- [ ] Hero section clearly communicates value
- [ ] Features are clearly explained
- [ ] Waitlist form is functional
- [ ] Page is responsive (mobile, tablet, desktop)

---

## Non-Functional Requirements

### NFR-1: Performance

- Page load time < 2 seconds
- Time to interactive < 3 seconds
- Real-time updates < 500ms latency
- Database queries < 100ms

### NFR-2: Security

- All authentication via WorkOS
- Session tokens encrypted
- CSRF protection
- Rate limiting on API endpoints
- Data encryption at rest (Convex)

### NFR-3: Privacy

- Self-hosted option available
- Data export functionality
- No data mining or selling
- Transparent data handling
- Bring-your-own AI support

### NFR-4: Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion support
- Semantic HTML

### NFR-5: Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### NFR-6: Responsive Design

- Mobile-first approach
- Breakpoints: mobile (< 768px), tablet (768px - 1024px), desktop (> 1024px)
- Touch-friendly interactions
- Adaptive layouts

---

## Design System

### Design Tokens

- **Spacing**: Semantic tokens (px-nav-item, py-nav-item, gap-icon)
- **Colors**: Semantic tokens (bg-sidebar, text-sidebar-primary)
- **Typography**: Semantic tokens (text-label)
- **Theming**: Light/dark mode support
- **Accessibility**: WCAG compliant, reduced motion support

### Component Architecture

- **Tokens** → **Utilities** → **Patterns** → **Components**
- Headless components (Bits UI)
- Composable architecture (`.svelte.ts` files)
- Single `$state` object pattern
- Function parameters for reactive values

---

## Testing Requirements

### Unit Tests

- Vitest for unit testing
- Browser and server environments
- Component testing
- Composable testing

### E2E Tests

- Playwright for end-to-end testing
- Critical workflows:
  - Authentication flow
  - Inbox workflow
  - Flashcard generation
  - Settings management
  - Quick create workflow

### Test Coverage Goals

- Unit tests: > 70% coverage
- E2E tests: All critical user flows
- Integration tests: All API endpoints

---

## Success Criteria

### Adoption Metrics

- Daily active users (DAU)
- Monthly active users (MAU)
- DAU/MAU ratio > 50%
- User retention > 80% (30-day)

### Engagement Metrics

- Average session duration > 10 minutes
- Pages per session > 3
- Feature adoption rate > 60%
- User satisfaction score > 4/5

### Technical Metrics

- Page load time < 2 seconds
- Error rate < 0.1%
- Uptime > 99.9%
- API response time < 100ms (p95)

---

## Future Enhancements

### Phase 2: Multi-Tenancy

- Organizations and teams
- Team-based permissions
- Organization settings
- Team dashboards

### Phase 3: Product Discovery Tools

- User research management
- Opportunity solution trees
- Continuous discovery workflows
- Research repository

### Phase 4: Product Delivery Tools

- OKR tracking
- Roadmap management
- Sprint planning
- Goal tracking

### Phase 5: AI Coaching

- Context-aware AI assistant
- Company data training
- Automated workshop generation
- Decision support

---

## Constraints

### Technical Constraints

- Must work offline-first
- Must support self-hosting
- Must be privacy-first
- Must use Convex for backend
- Must use SvelteKit for frontend

### Business Constraints

- Budget: $60/month (Cursor AI)
- No VC funding
- Partner-funded validation (Saprolab)
- Community-driven development

### Time Constraints

- Rapid iteration cycles
- Weekly releases
- Continuous deployment
- Fast feedback loops

---

## Risks & Mitigations

### Risk: Performance Issues

**Mitigation**:

- Optimize database queries
- Implement caching
- Use Convex real-time efficiently
- Monitor performance metrics

### Risk: Security Vulnerabilities

**Mitigation**:

- Regular security audits
- Use WorkOS for authentication
- Follow security best practices
- Community security reporting

### Risk: Scalability Challenges

**Mitigation**:

- Design for scale from start
- Use Convex serverless architecture
- Optimize database schema
- Monitor resource usage

---

## Glossary

- **CODE Framework**: Collect → Organise → Distill → Express
- **FSRS**: Free Spaced Repetition Scheduler algorithm
- **RBAC**: Role-Based Access Control
- **Convex**: Real-time database and serverless functions platform
- **WorkOS**: Enterprise authentication platform
- **SvelteKit**: Full-stack framework for Svelte
- **ProseMirror**: Rich text editor framework

---

## References

- Product Vision: `marketing-docs/strategy/product-vision-2.0.md`
- Product Principles: `dev-docs/2-areas/product/product-principles.md`
- Architecture: `dev-docs/architecture.md`
- Design Tokens: `dev-docs/design-tokens.md`
- Coding Standards: `dev-docs/2-areas/development/coding-standards.md`

---

**Document Status**: Active  
**Last Updated**: November 13, 2025  
**Owner**: Product Team  
**Review Cycle**: Monthly
