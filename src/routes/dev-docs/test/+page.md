---
title: MDX Test Page
description: Testing MDX rendering with syntax highlighting and components
---

# MDX Test Page

This is a test page to verify MDX is working correctly.

## Features to Test

### 1. Syntax Highlighting

```typescript
interface User {
	id: string;
	name: string;
	email: string;
}

function greetUser(user: User): string {
	return `Hello, ${user.name}!`;
}
```

```javascript
const items = ['apple', 'banana', 'cherry'];
items.map((item) => item.toUpperCase());
```

### 2. Markdown Features

**Bold text** and _italic text_ work.

- Bullet list item 1
- Bullet list item 2
  - Nested item
  - Another nested item

1. Numbered list item 1
2. Numbered list item 2

### 3. Links

[Link to architecture docs](../2-areas/architecture)

### 4. Blockquotes

> This is a blockquote with some wisdom.
>
> It can span multiple lines.

### 5. Code Blocks (Various Languages)

```bash
npm install mdsvex
npm run dev
```

```json
{
	"name": "synergyos",
	"version": "0.1.0",
	"type": "module"
}
```

```css
.button {
	background-color: var(--color-primary);
	padding: var(--spacing-md);
}
```

## Success Criteria

If you can see:

- ✅ Proper syntax highlighting in code blocks
- ✅ Headings with auto-generated IDs (clickable links)
- ✅ Styled markdown content
- ✅ This page rendered as HTML

Then MDX is working correctly!
