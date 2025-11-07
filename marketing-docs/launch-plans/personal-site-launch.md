# Personal Site Launch: Journey Blog Setup

> **Goal**: Launch your personal site with journey blog to document the building process, attract early adopters, and establish thought leadership—simple, fast, focused on content over perfection.

---

## Why a Personal Site + Journey Blog?

### Authenticity
- Share the real story (building with AI on $60/month)
- No corporate marketing speak
- Attracts like-minded builders, early adopters

### SEO & Awareness
- Rank for "building with AI", "open source product tools"
- Long-form content performs better than social posts
- Backlinks to GitHub repo

### Content Hub
- Social posts link back to blog (traffic)
- Evergreen content (social posts disappear, blog posts last)
- Portfolio of learnings

### Thought Leadership
- Establish expertise in product management + AI
- Attract consulting/speaking opportunities
- Build personal brand alongside product brand

---

## Site Options (Pick One)

### Option 1: Simple & Fast (Recommended)
**Stack**: Ghost (self-hosted or Ghost Pro)

**Pros**:
- Dead simple setup (30 minutes)
- Beautiful themes out of the box
- Built-in newsletter (email list)
- SEO optimized
- Markdown support

**Cons**:
- Monthly cost ($9-15/month for Ghost Pro)
- Less customization than custom build

**Best for**: Getting started fast, focusing on content

---

### Option 2: Free & Flexible
**Stack**: Hugo or Jekyll (static site) + GitHub Pages

**Pros**:
- $0 cost (hosted on GitHub Pages)
- Fast (static site)
- Full control (customize everything)
- Markdown support

**Cons**:
- More setup time (2-4 hours)
- Manual theme customization
- No built-in newsletter (need ConvertKit, Mailchimp)

**Best for**: Developer-friendly, $0 budget

---

### Option 3: Custom Build
**Stack**: SvelteKit (same as product) + Markdown

**Pros**:
- Full control (design, features, everything)
- Same tech stack as product
- Can integrate with product later

**Cons**:
- Most time (8-16 hours)
- Maintenance burden
- Overkill for a blog

**Best for**: Long-term, if site becomes important

---

## Recommended: Ghost (Fast Start)

### Setup (30 Minutes)

1. **Sign up for Ghost Pro** (or self-host)
   - $9/month starter plan (or $15/month for more features)
   - Domain: [yourname].com or [product-name].com/blog

2. **Choose a theme**
   - Default "Casper" theme (clean, minimal)
   - Or browse themes: https://ghost.org/themes/

3. **Configure settings**
   - Site title: [Your Name] or [Product Name] Journey
   - Site description: "Building [Product Name] with AI—sharing the journey, lessons, and learnings"
   - Logo: Simple logo or text
   - Social links: Twitter, LinkedIn, GitHub

4. **Create pages**
   - **Home**: Blog posts (default)
   - **About**: Your story (why you're building this)
   - **Now**: What you're currently working on (inspired by Derek Sivers)

5. **Set up newsletter**
   - Enable newsletter in settings
   - Add signup form to homepage
   - Connect Mailgun or Mailchimp (optional, Ghost has built-in)

---

## First Blog Post (Launch Post)

### Topic
**"Why I'm Building [Product Name]: From Learning Problems to an Open-Source Product OS"**

### Outline
1. **Hook**: The problem (learning in organizations)
2. **Story**: Your experience (running product teams)
3. **Vision**: What you're building (Product OS)
4. **Journey**: How you're building (AI, $60/month)
5. **Invitation**: Join the journey (GitHub, Discord)

### Writing Time
- Draft: 1-2 hours
- Edit: 30 minutes
- Publish: 5 minutes

**Total**: 2-3 hours

---

## Content Calendar (First Month)

### Week 1: Introduction
- **Post 1**: Why I'm building this (launch post)
- **Post 2**: The $60/month challenge (building with AI)

### Week 2: Product Problems
- **Post 3**: Learning takes too much effort (glossary problem)
- **Post 4**: We create more than we consume (knowledge overload)

### Week 3: Building with AI
- **Post 5**: How I built [feature] with Cursor AI
- **Post 6**: Mistakes I made (lessons learned)

### Week 4: Community & Vision
- **Post 7**: Building in public (progress update)
- **Post 8**: What's next (roadmap, community invite)

---

## SEO Strategy (High-Level)

### Target Keywords
- "Building with AI"
- "Open source product tools"
- "Product management for teams"
- "AI for product managers"
- "Learning in organizations"

### SEO Basics
- **Title**: Include keyword (e.g., "Building an Open-Source Product OS with AI")
- **Meta description**: 150-160 characters, include keyword
- **Headings**: H2, H3 with keywords
- **Internal links**: Link blog posts to each other
- **External links**: Link to GitHub repo, Discord, social

### Long-Term SEO
- Publish consistently (weekly)
- Write long-form (1,500+ words)
- Get backlinks (guest posts, mentions)
- Track in Google Search Console

---

## Newsletter Strategy

### Why Newsletter?
- Own your audience (social can disappear)
- Direct line to readers
- Higher engagement than social

### Setup
1. **Enable newsletter** in Ghost settings
2. **Add signup form** to homepage, footer, end of posts
3. **Welcome email**: Auto-send when someone subscribes

**Welcome Email Template**:
```
Hey [First Name],

Thanks for subscribing! 🙏

I'm [Your Name], and I'm building [Product Name]—an open-source Product OS for teams.

I'm sharing the journey here: the wins, the mistakes, and everything I'm learning along the way.

Expect a new post every Friday on topics like:
- Building with AI ($60/month budget)
- Product problems (learning, alignment, knowledge sharing)
- Open source journey (community, transparency)

In the meantime:
- ⭐ Star the GitHub repo: [link]
- 💬 Join Discord: [link]
- 🐦 Follow on Twitter: [link]

See you Friday!

[Your Name]
```

### Newsletter Cadence
**Weekly**: Send every Friday with:
- New blog post summary
- What I'm working on this week
- Link to full post

---

## Analytics Setup

### Google Analytics (Free)
1. Sign up: https://analytics.google.com
2. Create property: [Your Site Name]
3. Add tracking code to Ghost (Settings > Code Injection)
4. Track:
   - Page views
   - Traffic sources (social, search, direct)
   - Most popular posts

### Goals to Track
- Blog signups (newsletter)
- GitHub stars (from blog traffic)
- Discord joins (from blog traffic)

---

## Promotion Strategy

### When You Publish
1. **Share on Twitter**: Tweet thread summarizing post
2. **Share on LinkedIn**: Long-form post (native content)
3. **Share on Reddit**: Post in relevant subreddits (r/ProductManagement, r/SideProject)
4. **Share on Discord**: Post in #announcements
5. **Email list**: Send newsletter summary

### 24 Hours Later
- Engage with comments (Twitter, LinkedIn, blog)
- Reshare with new angle (quote, insight, question)

### 1 Week Later
- Analyze performance (views, engagement, conversions)
- Iterate for next post (what worked, what didn't)

---

## Writing Tips

### Make It Personal
- ❌ "Many organizations struggle with learning"
- ✅ "I've seen teams waste weeks onboarding because glossaries live in forgotten docs"

### Show, Don't Tell
- ❌ "AI is useful for coding"
- ✅ "Cursor AI wrote 80% of my authentication system in 2 hours. The other 20%—edge cases and error handling—took 4 hours."

### Be Transparent
- Share wins AND failures
- Actual numbers (GitHub stars, costs, time spent)
- Real challenges (not just "everything is amazing")

### Keep It Concise
- Short paragraphs (2-3 sentences max)
- Subheadings every 200-300 words
- Bullet points for lists
- **Bold** for emphasis

### Invite Engagement
- End with a question
- Ask for feedback
- Invite readers to contribute (GitHub, Discord)

---

## Automation (Future)

### Social Automation
- Blog post → Tweet thread (AI-generated)
- Blog post → LinkedIn post (AI-generated)
- See [Social Automation](../go-to-market/social-automation.md)

### Email Automation
- New post → Auto-send newsletter (Ghost built-in)
- Drip campaign for new subscribers

### Analytics Automation
- Weekly email with stats (views, signups, top posts)

---

## Success Metrics (First Month)

### Traffic
- ✅ 1,000+ page views
- ✅ 100+ unique visitors
- ✅ 50+ newsletter subscribers

### Engagement
- ✅ 10+ comments per post
- ✅ 5+ DMs/emails with feedback
- ✅ 1+ unsolicited share/mention

### Conversions
- ✅ 10+ GitHub stars from blog traffic
- ✅ 5+ Discord joins from blog traffic
- ✅ 1+ contributor who discovered via blog

---

## Next Steps (Timeline)

### Week 1
- [ ] Choose platform (Ghost recommended)
- [ ] Set up site (30 minutes)
- [ ] Write first post (2-3 hours)
- [ ] Publish and share (1 hour)

### Week 2
- [ ] Write second post (2-3 hours)
- [ ] Engage with comments from Week 1
- [ ] Set up newsletter automation

### Week 3
- [ ] Write third post (2-3 hours)
- [ ] Analyze Week 1-2 performance
- [ ] Adjust strategy based on learnings

### Week 4
- [ ] Write fourth post (2-3 hours)
- [ ] Start social automation (AI-powered)
- [ ] Plan Month 2 content

---

## Troubleshooting

### "No one is reading my blog"
- **Fix**: Share more (Twitter, LinkedIn, Reddit)
- **Fix**: Engage in communities first (build credibility)
- **Fix**: Write about problems people care about (not just product updates)

### "I don't know what to write about"
- **Fix**: Use [Journey Blog Topics](./journey-blog-topics.md) for ideas
- **Fix**: Write about what you're learning this week
- **Fix**: Answer common questions from Discord/Twitter

### "Writing takes too long"
- **Fix**: Use AI for first draft (ChatGPT, Claude)
- **Fix**: Time-box writing (2 hours max)
- **Fix**: Ship imperfect posts (done > perfect)

---

**Ready to launch? Pick a platform, write your first post, and ship it! 🚀**

---

**Related**:
- [Journey Blog Topics](./journey-blog-topics.md) - Content ideas
- [Content Marketing Plan](../go-to-market/content-marketing-plan.md) - Long-term strategy
- [Social Automation](../go-to-market/social-automation.md) - Automate distribution

