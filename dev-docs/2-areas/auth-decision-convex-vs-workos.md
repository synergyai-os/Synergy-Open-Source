# Authentication Decision: Convex Auth vs WorkOS AuthKit

> **Decision Date**: November 10, 2025  
> **Status**: ✅ Active (WorkOS AuthKit)  
> **Decision Maker**: Randy Hereman  
> **Review Date**: Q2 2026 (after multi-tenancy launch)

---

## Executive Summary

**Question**: Should we use Convex Auth (`@convex-dev/auth`) or WorkOS AuthKit for authentication?

**Decision**: **WorkOS AuthKit**

**Rationale**: Given our multi-tenancy roadmap, enterprise marketplace vision, and small team size, WorkOS AuthKit provides enterprise-ready features out-of-the-box that would take 4-8 weeks to build with Convex Auth. Time-to-market and enterprise readiness outweigh the benefits of full control.

**Time Saved**: 4-8 weeks of auth engineering work  
**Cost**: Free up to 1M MAUs, then pay-as-you-grow  
**Trade-Off**: External dependency vs. enterprise features and time savings

---

## Context

### Migration History

**Nov 2024**: Used `@mmailaender/convex-auth-svelte` (community wrapper)  
**Problem**: Production bugs (`TypeError: null.redirect`), 6 hours debugging, no fix  
**Nov 2025**: Migrated to WorkOS AuthKit (2-3 hours, production-ready)

**See**: [Auth Library Debugging Journey](../../ai-content-blog/auth-library-debugging-workos-migration-journey.md)

### Product Context

**SynergyOS** is a knowledge retention app with:
- Multi-tenancy roadmap (organizations + teams)
- Marketplace vision (orgs buy content from creators)
- Small team (founder + AI)
- Privacy-first values, but pragmatic delivery

**Relevant Docs**:
- [Multi-Tenancy Migration Guide](multi-tenancy-migration.md)
- [Product Vision & Plan](product-vision-and-plan.md)
- [Product Principles](product-principles.md)

---

## Option 1: Convex Auth (`@convex-dev/auth`)

### What It Is

Official Convex authentication library that runs entirely on your Convex backend.

### Pros

| Benefit | Description |
|---------|-------------|
| **Full Control** | Auth logic lives in your Convex backend, you own everything |
| **No External Dependencies** | No third-party service, no vendor lock-in |
| **Cost** | Free (just Convex hosting costs) |
| **Customization** | Build any auth flow you want |
| **Data Privacy** | All auth data stays in your Convex database |
| **Simple Stack** | One less service to manage |
| **Framework Agnostic** | Works with any frontend framework |

### Cons

| Drawback | Impact |
|----------|--------|
| **Build Your Own UI** | No hosted login pages, you create everything |
| **Manual SvelteKit Integration** | Need to build the connection yourself (risk: community wrapper bugs) |
| **Enterprise Features DIY** | SSO, SAML, multi-org = you build it (4-8 weeks) |
| **Maintenance Burden** | You're responsible for security updates, UX improvements |
| **Time Investment** | 2-4 weeks to build production-ready basic auth |
| **Email/SMS** | Need to integrate Resend/Twilio yourself |
| **Security Expertise** | Auth security is hard, requires deep knowledge |

### When to Choose Convex Auth

- ✅ Single-user app (no teams/orgs)
- ✅ You need 100% control over auth UX
- ✅ You have 4+ weeks to spend on auth
- ✅ You're an auth security expert
- ✅ Zero external dependencies at all costs
- ✅ Ultra-high data privacy requirements

---

## Option 2: WorkOS AuthKit (Current Choice)

### What It Is

Enterprise authentication platform with official Convex integration, default option in `npm create convex`.

### Pros

| Benefit | Description |
|---------|-------------|
| **Zero Setup** | `npm create convex` auto-provisions everything |
| **Hosted UI** | Beautiful login/register/reset pages out of the box |
| **Enterprise Ready** | SSO, SAML, multi-org, directory sync built-in |
| **90 Languages** | Full localization support |
| **Multiple Roles** | Assign multiple roles per user/org (Sep 2025 feature) |
| **Free Tier** | 1M MAUs before any costs |
| **Security** | WorkOS handles patches, compliance, best practices |
| **Time Savings** | Production-ready in 2-3 hours vs 2-4 weeks |
| **Official Support** | Convex + WorkOS partnership means guaranteed compatibility |
| **Multi-Tenancy Native** | Built for organizations, teams, and enterprise customers |

### Cons

| Drawback | Mitigation |
|----------|-----------|
| **External Dependency** | WorkOS uptime required for auth (99.99% SLA) |
| **Less Customization** | Hosted UI has limits (though customizable via themes) |
| **Vendor Lock-in** | Migrating away later would require 2-3 weeks work |
| **Privacy Trade-off** | User auth data goes through WorkOS servers (compliant with SOC 2, GDPR) |
| **Learning Curve** | One more service to understand (though mostly automated) |

### When to Choose WorkOS AuthKit

- ✅ Multi-tenancy in your roadmap
- ✅ Targeting enterprise customers (companies with SSO needs)
- ✅ Want to ship fast (time-to-market priority)
- ✅ Prefer delegating security to experts
- ✅ Value time-to-market over full control
- ✅ Need role-based access control

---

## Decision Matrix

### Our Requirements vs. Features

| Requirement | Convex Auth | WorkOS AuthKit | Winner |
|-------------|-------------|----------------|--------|
| **Multi-Tenancy Support** | Build it (4-8 weeks) | Native | ✅ WorkOS |
| **Multiple Roles per User** | Build it (2-3 weeks) | Native (Sep 2025) | ✅ WorkOS |
| **Organization Management** | Build it (2-3 weeks) | Native | ✅ WorkOS |
| **SSO / SAML** | Build it (3-4 weeks) | Flip a switch | ✅ WorkOS |
| **Time to Production** | 2-4 weeks | 2-3 hours | ✅ WorkOS |
| **Full Control** | Complete | Limited | ✅ Convex Auth |
| **Data Privacy** | 100% owned | WorkOS processes | ✅ Convex Auth |
| **Maintenance Burden** | High (you own it) | Low (WorkOS owns it) | ✅ WorkOS |
| **Cost at Scale** | Free | Paid after 1M MAUs | ✅ Convex Auth |

### Scoring

**Convex Auth**: 2/9 wins (control, privacy)  
**WorkOS AuthKit**: 7/9 wins (features, speed, maintenance)

### Alignment with Product Principles

From [Product Principles](product-principles.md):

| Principle | Convex Auth | WorkOS AuthKit | Winner |
|-----------|-------------|----------------|--------|
| **Privacy First** | ✅ Total control | ⚠️ WorkOS compliant | Tie |
| **Outcomes Over Outputs** | ❌ Build auth infrastructure | ✅ Ship product features | ✅ WorkOS |
| **Start Small, Think Big** | ❌ 4-8 weeks upfront | ✅ 2-3 hours, scales later | ✅ WorkOS |
| **User Empowerment** | Tie | Tie | Tie |
| **Collaborative Innovation** | Tie | Tie | Tie |

**WorkOS aligns better with our product principles**: We want to ship outcomes (product features), not outputs (auth infrastructure).

---

## Cost Analysis

### Convex Auth

**Setup Cost**: 2-4 weeks engineering (basic auth)  
**Multi-Tenancy Cost**: +4-8 weeks (orgs, teams, roles)  
**SSO/SAML Cost**: +3-4 weeks (when enterprise customer needs it)  
**Maintenance Cost**: Ongoing security patches, feature updates  
**Total**: ~10-16 weeks over first year

**Monetary**: $0 (time cost in opportunity cost)

### WorkOS AuthKit

**Setup Cost**: 2-3 hours  
**Multi-Tenancy Cost**: $0 (built-in)  
**SSO/SAML Cost**: $0 (flip a switch)  
**Maintenance Cost**: $0 (WorkOS handles it)  
**Total**: ~3 hours

**Monetary**: 
- 0-1M MAUs: **Free**
- 1M-5M MAUs: Pay-as-you-grow pricing
- Enterprise features (SSO): Per-company pricing

**Break-Even Analysis**:
- If we reach 1M+ users, we're successful enough to afford WorkOS
- If we don't reach 1M users, WorkOS is free
- Time saved (10-16 weeks) = 2-3 major product features shipped

---

## Multi-Tenancy Alignment

From [Multi-Tenancy Migration Guide](multi-tenancy-migration.md), we're planning:

| Feature | Convex Auth (DIY) | WorkOS AuthKit (Native) |
|---------|-------------------|-------------------------|
| Organizations | Build table + CRUD | Built-in |
| Teams | Build table + CRUD | Built-in |
| Organization Members | Build many-to-many | Built-in |
| Team Members | Build many-to-many | Built-in |
| User Roles | Build RBAC system | Built-in (multiple roles) |
| Invitations | Build invite flow | Built-in |
| Organization Switcher | Build UI component | Built-in |
| SSO per Organization | Build SAML/OAuth (hard!) | Built-in |
| Directory Sync | Very hard to build | Built-in |

**Estimated Time Savings**: 4-8 weeks

**When we implement multi-tenancy** (Q1-Q2 2026):
- **With Convex Auth**: Update permission helpers, build org UI, build invite flows
- **With WorkOS**: Update permission helpers, use WorkOS org APIs

**WorkOS reduces multi-tenancy work by ~60%** (8 weeks → 3 weeks)

---

## Security Considerations

### Convex Auth

**You Are Responsible For**:
- Password hashing (bcrypt/argon2)
- Session management (JWT, refresh tokens)
- Rate limiting (prevent brute force)
- Email verification flows
- Password reset flows
- OAuth provider integrations (if needed)
- Security patches and CVE responses
- CSRF protection
- XSS prevention

**Risk**: One mistake = security breach

### WorkOS AuthKit

**WorkOS Is Responsible For**:
- All of the above
- SOC 2 Type II certified
- GDPR compliant
- Regular security audits
- Penetration testing
- Bug bounty program

**Risk**: Rely on WorkOS's security team (established, well-funded)

**Our Assessment**: Unless you're a security expert, delegating to WorkOS is safer.

---

## Migration Path (If We Change Our Mind)

### From WorkOS → Convex Auth

**Effort**: 2-3 weeks  
**Steps**:
1. Build Convex Auth setup (1 week)
2. Export user data from WorkOS (1 day)
3. Import to Convex (1 day)
4. Update all auth flows (3-5 days)
5. Test thoroughly (2-3 days)
6. Notify users of auth changes (1 day)

**Data Loss**: None (emails, user IDs preserved)  
**User Impact**: Re-authentication required

### From Convex Auth → WorkOS

**Effort**: 2-3 days  
**Steps**:
1. Set up WorkOS (1 hour)
2. Export user data from Convex (1 day)
3. Import to WorkOS (1 day)
4. Update auth flows (3-5 hours)
5. Test (1 day)

**Migration is easier in this direction** (WorkOS → Convex Auth is harder)

---

## Risks & Mitigations

### Risk 1: WorkOS Downtime

**Impact**: Users can't log in  
**Probability**: Low (99.99% SLA)  
**Mitigation**: 
- Session cookies last 7 days (users stay logged in)
- Monitor WorkOS status page
- Have fallback messaging ready

### Risk 2: WorkOS Pricing Changes

**Impact**: Cost increases at scale  
**Probability**: Medium (all SaaS companies adjust pricing)  
**Mitigation**:
- Free up to 1M MAUs (plenty of runway)
- Evaluate alternatives before hitting 1M
- Migration path exists (2-3 weeks)

### Risk 3: Feature Limitations

**Impact**: Can't build custom auth UX  
**Probability**: Low (WorkOS is highly customizable)  
**Mitigation**:
- WorkOS hosted UI is customizable (themes, branding)
- Can use WorkOS API directly for custom flows
- Worst case: migrate to Convex Auth (2-3 weeks)

### Risk 4: Vendor Lock-In

**Impact**: Hard to switch providers  
**Probability**: Medium  
**Mitigation**:
- Standard OAuth 2.0 / OIDC (portable)
- User data exportable
- Migration path exists
- Lock-in trade-off for time savings accepted

---

## Real-World Considerations

### What We'd Miss Without WorkOS

**When First Enterprise Customer Asks**:
- "Do you support SSO?" → ❌ No (4 weeks to build) vs. ✅ Yes (flip switch)
- "Can we sync our directory?" → ❌ No (very hard) vs. ✅ Yes (built-in)
- "Do you have SOC 2?" → ⚠️ DIY audit vs. ✅ Yes (WorkOS certified)

**When Launching Multi-Tenancy**:
- Build org/team tables → ✅ Same either way
- Build invite flows → ❌ DIY (2 weeks) vs. ✅ Built-in
- Build role management → ❌ DIY (2 weeks) vs. ✅ Built-in
- Build org switcher → ❌ DIY (1 week) vs. ✅ Built-in

### What We Gain with Convex Auth

**Full Control**:
- Custom auth UI (though WorkOS is customizable)
- Custom auth logic (though most use cases covered)
- Zero external dependencies (at cost of maintenance)

**Data Privacy**:
- 100% data ownership
- No third-party processing
- Complete audit trail control

**Cost Savings**:
- Free forever (no per-user costs)
- Predictable infrastructure costs

---

## The Decision

### Why We Chose WorkOS AuthKit

1. **Multi-Tenancy Roadmap**: Native org/team support saves 4-8 weeks
2. **Enterprise Vision**: Marketplace model targets companies (SSO required)
3. **Small Team**: Founder + AI can't spend 10-16 weeks on auth
4. **Time-to-Market**: Ship product features, not auth infrastructure
5. **Security Expertise**: Delegate to experts (SOC 2, GDPR)
6. **Product Principles**: "Outcomes Over Outputs"

### What We're Trading

- ✅ **Gaining**: Enterprise features, time savings, security expertise
- ❌ **Losing**: Full control, 100% data ownership, zero dependencies

### The Trade-Off We Accept

**External dependency for enterprise readiness.**

We believe reaching product-market fit faster is more valuable than avoiding vendor lock-in. If we reach 1M+ MAUs, we'll have revenue to afford WorkOS or resources to migrate.

---

## Success Criteria

### Short-Term (Q4 2025)

- ✅ Auth works in production (achieved Nov 2025)
- ✅ Users can register, log in, log out (achieved)
- ✅ No auth-related production bugs (ongoing)

### Mid-Term (Q1-Q2 2026)

- ⏳ Multi-tenancy implemented using WorkOS orgs
- ⏳ First 1,000 users onboarded
- ⏳ Zero auth-related customer complaints

### Long-Term (2026+)

- ⏳ First enterprise customer with SSO (WorkOS makes this possible)
- ⏳ Marketplace launched with org-level purchases
- ⏳ 10,000+ MAUs without auth infrastructure work

### Review Triggers

**Re-evaluate this decision if**:
- WorkOS pricing changes significantly
- We need auth customization WorkOS can't provide
- We reach 500K MAUs (plan for 1M threshold)
- Privacy requirements change (e.g., healthcare/finance pivot)
- WorkOS has major outages (>3 in 6 months)

---

## For Future Engineers

### If You're Evaluating This Decision

**Questions to Ask**:
1. Has our product vision changed? (Still targeting enterprises?)
2. Do we have 10+ weeks to rebuild auth? (Probably not)
3. Are we hitting WorkOS pricing limits? (Good problem to have)
4. Do we need auth features WorkOS doesn't provide? (Rare)
5. Has our privacy stance changed? (GDPR/SOC 2 still okay?)

### If You're Considering Convex Auth

**Good Reasons**:
- Product pivot away from enterprise (no SSO needed)
- Privacy requirements changed (healthcare/finance)
- We have 10+ weeks and auth expertise
- We're at 5M+ MAUs and WorkOS costs are high

**Bad Reasons**:
- "We want more control" (WorkOS is customizable)
- "We don't like dependencies" (all SaaS has dependencies)
- "It's more fun to build" (outcomes > outputs)

### If You're Considering a Different Provider

**Alternatives to Evaluate**:
- **Clerk**: Great UI, higher cost, React-first
- **Auth0**: Feature-rich, enterprise pricing
- **Supabase Auth**: Good for Postgres users
- **Firebase Auth**: Good for Google ecosystem

**Compare on**:
- Multi-tenancy support (critical for us)
- Convex integration quality
- Pricing at 1M+ MAUs
- SSO/SAML support
- Time to implement

---

## Appendix

### Related Documentation

- [Architecture Overview](architecture.md) - Current auth setup
- [Auth Deployment Patterns](patterns/auth-deployment.md) - WorkOS patterns
- [Multi-Tenancy Migration](multi-tenancy-migration.md) - Org/team plans
- [Product Vision](product-vision-and-plan.md) - Enterprise roadmap
- [Auth Migration Journey](../../ai-content-blog/auth-library-debugging-workos-migration-journey.md) - Why we migrated

### External Resources

- [WorkOS AuthKit Docs](https://workos.com/docs/authkit) - Official docs
- [Convex Auth Docs](https://docs.convex.dev/auth) - Official docs
- [WorkOS + Convex Guide](https://workos.com/blog/convex-authkit) - Integration guide
- [Convex Auth GitHub](https://github.com/get-convex/convex-auth) - Source code

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-10 | Initial decision document | Randy Hereman |
| 2026-Q2 | (Planned review after multi-tenancy launch) | - |

---

**Last Updated**: November 10, 2025  
**Next Review**: Q2 2026 (after multi-tenancy launch)  
**Decision Owner**: Randy Hereman  
**Status**: ✅ Active

