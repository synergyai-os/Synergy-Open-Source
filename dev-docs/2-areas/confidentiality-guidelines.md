# Confidentiality Guidelines

> **CRITICAL**: Always check this before publishing public docs, marketing materials, or external communication

**Last Updated**: November 8, 2025  
**Owner**: All team members

---

## 🔒 Core Principle

**Default to Private**: Unless explicitly approved, all client information is confidential.

---

## ❌ What NEVER to Disclose Publicly

### Client Information
- ❌ Client company names (unless explicit testimonial/case study approval)
- ❌ Client contact details (emails, phone numbers)
- ❌ Client team member names
- ❌ Client project details
- ❌ Client pricing/contract terms
- ❌ Client usage data/metrics
- ❌ Client feedback (unless anonymized + approved)

### Business Sensitive
- ❌ Unreleased feature details (until officially announced)
- ❌ Pricing experiments (before finalized)
- ❌ Partnership negotiations (until closed)
- ❌ Internal team issues/conflicts
- ❌ Detailed financial projections (beyond high-level goals)
- ❌ Competitor research (internal only)

### Personal Information
- ❌ Team member personal data (unless they share it themselves)
- ❌ User personal data (GDPR/privacy laws)
- ❌ Internal communication (Slack, emails)

---

## ✅ What CAN Be Disclosed Publicly

### Approved Client Information
- ✅ Client testimonials (with written approval)
- ✅ Case studies (after NDA/review process)
- ✅ Logo usage (with brand permission)
- ✅ Anonymized use cases ("A SaaS company in Belgium...")

### Business Metrics
- ✅ High-level goals (e.g., "Reach $60 MRR")
- ✅ Current public metrics (GitHub stars, Discord members)
- ✅ Product usage stats (anonymized, aggregated)
- ✅ Team size, open roles

### Product Information
- ✅ Released features
- ✅ Public roadmap (approved items)
- ✅ Open source code (public repos)
- ✅ Documentation (technical guides)

---

## 🛡️ Anonymization Techniques

When discussing real situations without exposing clients:

### Technique 1: Generic Descriptors
**Instead of:** "Saprolab is testing our OKR feature"  
**Use:** "A product agency in Belgium is piloting our OKR tracking system"

### Technique 2: Categories
**Instead of:** "ZDHC (chemical certification body) needs compliance tracking"  
**Use:** "Certification bodies require audit trail features"

### Technique 3: Aggregate Data
**Instead of:** "Client A has 5 users, Client B has 12 users"  
**Use:** "Our pilot customers have 5-15 users on average"

### Technique 4: Hypothetical Scenarios
**Instead of:** "Client X requested feature Y"  
**Use:** "Product teams often need feature Y for workflow Z"

---

## 📋 Pre-Publication Checklist

Before publishing ANY public content (docs, blog, social media, GitHub):

### Step 1: Scan for Client Names
```bash
# Search for potential client mentions
grep -r "Saprolab\|ZDHC\|[Client Name]" .

# Check all public docs
grep -r "client\|customer\|company" dev-docs/ marketing-docs/
```

### Step 2: Review Sensitive Keywords
- [ ] No company names (unless approved testimonial)
- [ ] No pricing details (unless public pricing page)
- [ ] No unreleased features (unless announcement)
- [ ] No specific contract terms
- [ ] No personal data (names, emails)

### Step 3: Anonymize Examples
- [ ] Replace specific names with generic descriptors
- [ ] Use hypothetical scenarios instead of real cases
- [ ] Aggregate data (no individual client metrics)

### Step 4: Get Approval (if needed)
- [ ] Client testimonials → Written approval + legal review
- [ ] Case studies → NDA review + client sign-off
- [ ] Partnership announcements → Both parties approve
- [ ] Pricing changes → Leadership approval

---

## 🚨 What to Do if You Accidentally Disclose

### Immediate Actions
1. **Remove the content** (delete, unpublish, redact)
2. **Notify the client** (apologize, explain, fix)
3. **Document the incident** (what happened, how fixed)
4. **Update guidelines** (prevent future occurrences)

### Severity Levels

**🔴 Critical (Act Immediately):**
- Client financial data
- Personal identifiable information (PII)
- Unreleased product vulnerabilities
- Legal/contract details

**🟡 Important (Fix Within 24h):**
- Client company names (without approval)
- Specific project details
- Internal metrics/goals

**🟢 Minor (Fix When Noticed):**
- Generic examples that could be improved
- Vague references that might imply a client

---

## 🎯 When Client Disclosure IS Allowed

### Testimonials
**Requirements:**
- Written approval (email, signed form)
- Quote reviewed by client
- Right to revoke at any time
- Attribution clear (name, title, company)

**Template Approval Email:**
```
Subject: Approval Request: Testimonial for SynergyOS

Hi [Client Name],

We'd love to feature your testimonial on our website/docs:

"[Quote here]"
- [Your Name], [Your Title], [Company Name]

Please reply with your approval, and let us know if you'd like any changes.

Thanks!
```

### Case Studies
**Requirements:**
- NDA review process
- Draft reviewed by client (legal + marketing)
- Approval in writing (signed agreement)
- Embargo date (if applicable)

**Approval Process:**
1. Draft case study (internal)
2. Legal review (confidentiality check)
3. Send to client for review
4. Incorporate client feedback
5. Get written approval
6. Publish after embargo date

### Logo Usage
**Requirements:**
- Brand guidelines followed
- Logo permission granted
- Link to client website (if requested)
- Remove if client requests

---

## 🔄 Regular Audits

### Monthly Review
**Check public content for:**
- Client names (approved vs. accidental)
- Outdated information (removed clients)
- New confidentiality risks

**Owner**: Marketing/Communications lead

### Quarterly Deep Dive
**Review:**
- All public docs (dev-docs, marketing-docs)
- Blog posts, social media
- GitHub issues/PRs (public repos)
- Community Discord/discussions

**Owner**: Leadership team

---

## 📖 Examples: Good vs. Bad

### Example 1: Metrics Dashboard

**❌ BAD:**
```markdown
| **Paying Customers** | 1 | 3 |
| **Current Clients** | Saprolab ($80/month) | - |
```

**✅ GOOD:**
```markdown
| **Paying Customers** | 1 | 3 |
| **Current Status** | In pilot with first design customer | - |
```

---

### Example 2: Case Study

**❌ BAD:**
```markdown
Saprolab, a product design agency in Belgium, uses SynergyOS to track OKRs 
across 3 teams. They previously used Notion but found it too generic.
```

**✅ GOOD (with approval):**
```markdown
"SynergyOS helped us move from generic tools to a purpose-built Product OS. 
Our teams now track OKRs, roadmaps, and decisions in one place."
- [Name], [Title], Saprolab (with written approval on file)
```

**✅ ALSO GOOD (anonymized):**
```markdown
A product design agency in Belgium uses SynergyOS to track OKRs across 
multiple teams. They migrated from a generic documentation tool and report 
30% faster alignment on quarterly goals.
```

---

### Example 3: Feature Request

**❌ BAD:**
```markdown
GitHub Issue #123: "ZDHC needs compliance audit trails"
ZDHC requested a feature to track chemical certifications with audit logs 
for regulatory compliance.
```

**✅ GOOD:**
```markdown
GitHub Issue #123: "Compliance audit trail feature"
Certification bodies in regulated industries (chemicals, pharmaceuticals) 
need audit trails for regulatory compliance. This would track changes to 
critical documents with timestamps and user attribution.
```

---

## 🎓 Training & Awareness

### For New Team Members
- Read this doc (mandatory)
- Sign confidentiality agreement
- Quiz on key scenarios (test understanding)

### For All Team Members
- Quarterly refresher (update on new policies)
- Review incidents (learn from mistakes)
- Share anonymization techniques

---

## 📞 Who to Ask

**Unsure if something is confidential?**

1. **Ask the client** (if in doubt, ask for permission)
2. **Ask legal** (contracts, NDAs, compliance)
3. **Ask leadership** (strategic decisions)
4. **Default to private** (better safe than sorry)

**Contacts:**
- Legal: [Contact info]
- Marketing: [Contact info]
- Leadership: Randy (founder)

---

## 🚀 Quick Reference

### Before Publishing, Ask:
1. ❓ Does this mention a client by name? → Get approval
2. ❓ Does this include personal data? → Anonymize or remove
3. ❓ Does this reveal pricing/contracts? → Remove specifics
4. ❓ Does this disclose unreleased features? → Wait for announcement
5. ❓ Would I be comfortable if this client saw it? → If no, revise

### Anonymization Cheat Sheet:
- "Saprolab" → "A product design agency"
- "ZDHC" → "A certification body in Belgium"
- "Client X has 5 users" → "Pilot customers have 5-15 users"
- "They pay $80/month" → "Initial customers pay $60-100/month"

---

## 📊 Metrics (Confidentiality Compliance)

**Track:**
- # of accidental disclosures/month (target: 0)
- # of approved testimonials/case studies
- # of team members trained
- Audit completion rate (monthly/quarterly)

**See**: [Metrics Dashboard](./metrics.md) (redacted for client confidentiality)

---

## ✅ Status

**Current State:**
- ✅ Guidelines documented
- 🟡 Needs: Monthly audit process
- 🟡 Needs: Training materials
- 🟡 Needs: Approval templates

**Owner**: Randy (Founder)  
**Next Review**: December 1, 2025

---

**Remember: When in doubt, leave it out.**  
**Confidentiality builds trust. Trust builds business.**


