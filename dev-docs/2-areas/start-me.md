# Start Me - Quick Development Setup

> **Get SynergyOS running locally in under 5 minutes**

---

## ✅ Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** installed
- **npm** (comes with Node.js)
- **Convex account** (free tier) - [Sign up here](https://convex.dev)
- **Code editor** (VS Code, Cursor, etc.)

---

## 📦 Step 1: Clone & Install

**1. Open your terminal and navigate to your projects folder:**

```bash
cd ~/Coding
```

**2. Clone the repository:**

```bash
git clone https://github.com/synergyai-os/Synergy-Open-Source.git
cd Synergy-Open-Source
```

**3. Install dependencies:**

```bash
npm install
```

---

## 🗄️ Step 2: Setup Convex Database

**1. Login to Convex:**

```bash
npx convex dev
```

This will:
- Open your browser to login
- Create a new Convex project
- Generate your database schema
- Give you a deployment URL

**2. Copy your Convex URL**

Look for output like:
```
Deploying to: happy-swan-123
URL: https://happy-swan-123.convex.cloud
```

**3. Create `.env.local` file in project root:**

```env
PUBLIC_CONVEX_URL=https://happy-swan-123.convex.cloud
```

Replace with YOUR deployment URL from step 2.

---

## 🚀 Step 3: Start Development Servers

You need **TWO terminal windows** running simultaneously:

### Terminal 1: Frontend Server

```bash
npm run dev
```

**Opens:** http://localhost:5173

### Terminal 2: Convex Database

```bash
npx convex dev
```

**Keeps database synced** and watches for schema changes.

---

## ✅ Verify It's Working

**1. Open browser:** http://localhost:5173

**2. You should see the SynergyOS homepage**

**3. Try these routes:**
- `/login` - Auth page
- `/inbox` - Universal inbox
- `/flashcards` - Study interface

---

## 🐛 Troubleshooting

### ❌ "Cannot find module '$convex/_generated/api'"

**Fix:** Convex isn't running. Start it:

```bash
npx convex dev
```

### ❌ "ENOENT: no such file or directory"

**Fix:** You're in the wrong folder. Navigate to project:

```bash
cd /Users/YOUR-USERNAME/Coding/SynergyOS
```

### ❌ Terminal says "directory does not exist"

**Fix:** 
1. Close all terminal tabs
2. Press **Ctrl + `** to open fresh terminal
3. Run commands again

### ❌ Localhost not loading

**Fix:**
1. Make sure BOTH terminals are running (`npm run dev` + `npx convex dev`)
2. Check for errors in terminal output
3. Try a different port: `npm run dev -- --port 5174`

---

## 🎯 Next Steps

**Now that you're running locally:**

1. **Read the docs:** [Architecture Overview](architecture.md)
2. **Check patterns:** [Pattern Index](patterns/INDEX.md) for common solutions
3. **Design system:** [Design Tokens](design-tokens.md) for UI styling
4. **Start coding:** Pick an issue from [Good First Issues](https://github.com/synergyai-os/Synergy-Open-Source/labels/good%20first%20issue)

---

## 📝 Optional: Environment Variables

### For Email (Resend API)

If you need email functionality:

```bash
npx convex env set RESEND_API_KEY your-api-key-here
```

Get your key at [resend.com](https://resend.com)

### For PostHog Analytics

Add to `.env.local`:

```env
PUBLIC_POSTHOG_KEY=your-posthog-key
PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## 🆘 Still Stuck?

1. **Check logs:** Look for red error messages in both terminal windows
2. **Search patterns:** [Pattern Index](patterns/INDEX.md) for known issues
3. **Ask for help:** [Open a GitHub Discussion](https://github.com/synergyai-os/Synergy-Open-Source/discussions)

---

**Ready to build?** Head to [Contributing Guidelines](../../CONTRIBUTING.md) to learn our workflow!

