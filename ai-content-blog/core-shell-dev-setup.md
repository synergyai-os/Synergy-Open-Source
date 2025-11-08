# Core Shell: The Developer's Terminal Upgrade

**5-minute setup for a better terminal experience**

---

If you're still using the default macOS Terminal, you're missing out. Core Shell is a modern terminal that makes development faster and more pleasant. Here's why I switched and how you can set it up.

## Why Core Shell?

**The problem with default Terminal:**
- Opens in home directory every time (`~`)
- No built-in SSH manager
- Cluttered UI with unnecessary menus
- Manual tab management

**What Core Shell fixes:**
- Auto-opens in your project folder
- Visual SSH connection manager
- Clean, focused interface
- Smart tab profiles

## Quick Setup (3 steps)

### Step 1: Create a Profile

**1. Open Core Shell Settings** (Cmd+,)

**2. Create new profile:**
- Name: Your project name (e.g., "SynergyOS")
- Working Directory: `/Users/YOUR-USERNAME/Coding/YOUR-PROJECT`

**3. Save it**

**Result:** Every new tab opens in your project - no more `cd` commands.

---

### Step 2: Set as Default

**1. Right-click your profile**

**2. Select "Set as Default"**

**Result:** New windows/tabs use your project profile automatically.

---

### Step 3: Use Keyboard Shortcuts

**Essential shortcuts:**
- `Cmd+T` - New tab in same profile
- `Cmd+W` - Close tab
- `Cmd+1/2/3` - Jump to tab 1/2/3
- `Cmd+Shift+D` - Split pane

**Pro tip:** Run two processes side-by-side with split panes instead of switching tabs.

---

## My Development Workflow

**For full-stack projects (e.g., SvelteKit + Convex):**

**Tab 1: Frontend**
```bash
npm run dev
```
Stays open - watching for changes

**Tab 2: Backend/Database**
```bash
npx convex dev
```
Stays open - syncing database

**Tab 3: Commands**
- Git operations
- Package installs
- Quick scripts

**Why this works:**
- No mental overhead switching tabs
- See both servers' logs at once (split view)
- Command tab always ready for quick tasks

---

## Advanced: SSH Manager

Core Shell's killer feature - visual SSH connections.

**Setup:**
1. Click "+" in sidebar
2. Add server details:
   - Host: `your-server.com`
   - User: `ubuntu`
   - Key: Select your SSH key
3. Click to connect

**Why it's better:**
- No memorizing SSH commands
- Auto-reconnects if connection drops
- Save multiple servers
- Jump between servers instantly

---

## Pro Tips

### 1. Project Profiles

Create profiles for each project:
- **SynergyOS** → `/Coding/SynergyOS`
- **Client Project** → `/Coding/client-name`
- **Side Project** → `/Coding/side-project`

**Switch profiles with:** Right-click profile → "New Window"

### 2. Color Schemes

Match your code editor:
- Dark themes for night coding
- Light themes for daytime
- Solarized for reduced eye strain

Settings → Color Scheme → Pick one

### 3. Don't Close Tabs

Keep long-running processes in background tabs:
- Development servers
- Database watchers
- Log tails

**Just switch tabs** instead of stopping/restarting.

---

## Alternatives Worth Trying

If Core Shell doesn't fit:

**iTerm2** (Free)
- Most customizable
- Split panes
- Huge community

**Warp** (Free)
- AI command suggestions
- Beautiful UI
- Modern features

**Alacritty** (Free)
- Fastest terminal
- Minimal design
- GPU-accelerated

**Hyper** (Free)
- Built with web tech
- Extensible with JS/CSS
- Plugin ecosystem

---

## The Bottom Line

**Core Shell solves one problem really well:** Opening terminals in the right place.

If you're tired of typing `cd ~/Coding/project-name` every time, Core Shell is worth it.

**Try it for a week.** If you're not faster, switch back. But you will be.

---

## Quick Reference

**Essential Settings:**
- Working Directory → Your project path
- Set as Default → Auto-use this profile
- Color Scheme → Match your editor

**Essential Shortcuts:**
- `Cmd+T` → New tab
- `Cmd+W` → Close tab
- `Cmd+Shift+D` → Split pane
- `Cmd+1/2/3` → Jump to tab

**My Setup:**
- Tab 1: `npm run dev`
- Tab 2: `npx convex dev`
- Tab 3: Commands/Git

**Download:** [core-shell.app](https://coreshell.app)

---

*Written while building [SynergyOS](https://synergyos.ai) - an open-source product OS. We use Core Shell because every second counts when you're shipping fast.*

