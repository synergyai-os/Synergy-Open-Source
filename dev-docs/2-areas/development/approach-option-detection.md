# Approach Option Detection & Confirmation

**Purpose**: Detailed implementation guide for detecting and confirming approach options (A/B/C) in task documents when creating Linear tickets.

**See**: `.cursor/commands/create-tasks.md` - Main workflow command (references this doc)

---

## Overview

When creating tickets from task template documents (e.g., `ai-docs/tasks/SYOS-XXX-*.md`) that contain multiple approach options, the system must:

1. **Detect** approach options in the document
2. **Parse** option details (title, pros, cons)
3. **Detect** user intent (explicit selection vs. none)
4. **Recommend** best option if user didn't specify
5. **Confirm** selection before proceeding

**Why this matters**: Prevents AI from silently picking an option without user awareness, reduces anxiety, ensures user understands the decision before ticket creation.

---

## Detection Logic

**Check for approach options in task document:**

```typescript
// Check for approach options in task document
const taskDocument = findTaskDocument(); // From context or file system
const hasApproachOptions =
  taskDocument &&
  (taskDocument.includes('## Approach Options') ||
    taskDocument.includes('### Approach A:') ||
    taskDocument.includes('### Approach B:') ||
    taskDocument.includes('### Approach C:'));

if (hasApproachOptions) {
  // Parse options from document
  const options = parseApproachOptions(taskDocument);
  // Options format: { A: { title, pros, cons }, B: { ... }, C: { ... } }

  // Check user intent
  const userSpecifiedOption = detectUserOptionSelection(); // "option A", "approach B", etc.

  if (userSpecifiedOption) {
    // User explicitly selected option → Use it
    const selectedOption = options[userSpecifiedOption];
    console.log(`✅ Using ${userSpecifiedOption}: ${selectedOption.title}`);
    // Continue to Step 1
  } else {
    // User didn't specify → Recommend and confirm
    const recommendedOption = analyzeAndRecommendOption(options);
    // Recommendation based on: risk level, complexity, dependencies, existing patterns

    // ASK USER FOR CONFIRMATION:
    // "📋 Found ${options.length} approach options in task document:
    //
    // **Approach A**: [Title] - [Brief summary]
    // **Approach B**: [Title] - [Brief summary]
    // **Approach C**: [Title] - [Brief summary]
    //
    // 💡 **Recommendation**: ${recommendedOption.letter} - ${recommendedOption.title}
    //
    // ${recommendedOption.reasoning} (2 sentences max)
    //
    // Proceed with ${recommendedOption.letter}? (yes/no, or specify A/B/C)"
    //
    // If yes → Use recommended option, continue to Step 1
    // If no → Ask user to specify which option (A/B/C)
    // If user specifies different option → Use that option, continue to Step 1
  }
}
```

---

## Parse Approach Options

**Extract option details from document:**

```typescript
function parseApproachOptions(document: string): Record<string, OptionData> {
  const options: Record<string, OptionData> = {};

  // Pattern: ### Approach A: [Title]
  // Followed by pros/cons, complexity, dependencies
  const optionPattern = /### Approach ([A-C]):\s*(.+?)\n\n\*\*How it works\*\*:\s*(.+?)(?=\n\n### Approach|$)/gs;

  let match;
  while ((match = optionPattern.exec(document)) !== null) {
    const letter = match[1];
    const title = match[2].trim();
    const description = match[3].trim();

    // Extract pros/cons
    const prosMatch = document.match(
      new RegExp(`### Approach ${letter}:.*?\\*\\*Pros\\*\\*:([\\s\\S]*?)\\*\\*Cons\\*\\*:`, 'm')
    );
    const consMatch = document.match(
      new RegExp(`### Approach ${letter}:.*?\\*\\*Cons\\*\\*:([\\s\\S]*?)(?:\\*\\*Complexity\\*\\*|$)`, 'm')
    );

    options[letter] = {
      title,
      description,
      pros: prosMatch ? prosMatch[1].trim() : '',
      cons: consMatch ? consMatch[1].trim() : ''
    };
  }

  return options;
}
```

**Expected Document Format:**

```markdown
## Approach Options

### Approach A: Incremental Refactoring (One Component at a Time)

**How it works**: Refactor each component individually, extract composables, verify tests pass, merge PR.

**Pros**:
- Low risk - each PR is small, reviewable
- Can validate approach early
- Allows pause/resume between components

**Cons**:
- Takes longer overall (4 separate PRs)
- Potential for inconsistent patterns

**Complexity**: Medium (per component), Low (overall risk)

### Approach B: Batch Refactoring (All Components at Once)
...
```

---

## Analyze and Recommend Option

**Recommend best option based on document analysis:**

```typescript
function analyzeAndRecommendOption(
  options: Record<string, OptionData>
): { letter: string; title: string; reasoning: string } {
  // Check for "## Recommendation" section in document
  const recommendationMatch = document.match(/## Recommendation\s+\*\*Selected\*\*:\s*Approach ([A-C])/);

  if (recommendationMatch) {
    const recommendedLetter = recommendationMatch[1];
    const option = options[recommendedLetter];

    // Extract reasoning (2-3 sentences from "Reasoning:" section)
    const reasoningMatch = document.match(
      new RegExp(
        `## Recommendation[\\s\\S]*?\\*\\*Reasoning\\*\\*:([\\s\\S]*?)(?:\\*\\*Trade-offs|$)`,
        'm'
      )
    );
    const reasoning = reasoningMatch
      ? reasoningMatch[1]
          .trim()
          .split('\n')
          .slice(0, 2)
          .join(' ')
          .replace(/^\d+\.\s*/, '')
          .substring(0, 300) // Max 2 sentences
      : `Lower risk and faster feedback. ${option.title} allows incremental validation.`;

    return {
      letter: recommendedLetter,
      title: option.title,
      reasoning
    };
  }

  // Fallback: Analyze pros/cons to recommend
  // Prefer: Low risk, incremental, matches existing patterns
  const scores = Object.entries(options).map(([letter, option]) => {
    let score = 0;
    if (option.pros.toLowerCase().includes('low risk')) score += 3;
    if (option.pros.toLowerCase().includes('incremental')) score += 2;
    if (option.pros.toLowerCase().includes('fast feedback')) score += 2;
    if (option.cons.toLowerCase().includes('high risk')) score -= 3;
    if (option.cons.toLowerCase().includes('all-or-nothing')) score -= 2;
    return { letter, score };
  });

  const recommended = scores.sort((a, b) => b.score - a.score)[0];
  return {
    letter: recommended.letter,
    title: options[recommended.letter].title,
    reasoning: `Lower risk and incremental approach. ${options[recommended.letter].title} allows validation before full commitment.`
  };
}
```

**Recommendation Priority:**

1. **Document recommendation** (if "## Recommendation" section exists) - Use document's selected option
2. **Pros/cons analysis** (fallback) - Score options based on:
   - Low risk (+3 points)
   - Incremental (+2 points)
   - Fast feedback (+2 points)
   - High risk (-3 points)
   - All-or-nothing (-2 points)

---

## Detect User Option Selection

**Check user message for explicit option selection:**

```typescript
function detectUserOptionSelection(): string | null {
  // Check user message for explicit option selection
  const userMessage = getUserMessage(); // From conversation context

  const optionPatterns = [
    /option\s+([A-C])/i,
    /approach\s+([A-C])/i,
    /use\s+([A-C])/i,
    /go\s+with\s+([A-C])/i,
    /choose\s+([A-C])/i
  ];

  for (const pattern of optionPatterns) {
    const match = userMessage.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return null;
}
```

**Supported Patterns:**

- "option A" / "option B" / "option C"
- "approach A" / "approach B" / "approach C"
- "use A" / "use B" / "use C"
- "go with A" / "go with B" / "go with C"
- "choose A" / "choose B" / "choose C"

---

## Confirmation Format

**When user doesn't specify option, show:**

```
📋 Found 3 approach options in task document:

**Approach A**: Incremental Refactoring (One Component at a Time)
**Approach B**: Batch Refactoring (All Components at Once)
**Approach C**: Pattern Extraction + Incremental Application

💡 **Recommendation**: A - Incremental Refactoring

Low risk: Each PR is small (~200-500 line changes), easy to review, easy to rollback. Fast feedback: Can validate approach with ActionItemsList first, adjust if needed.

Proceed with A? (yes/no, or specify A/B/C)
```

**User Responses:**

- `yes` → Use recommended option, continue to ticket creation
- `no` → Ask user to specify which option (A/B/C)
- `A` / `B` / `C` → Use specified option, continue to ticket creation

---

## Example Workflow

```
User: "/create-tasks - Working from meetings-separation-of-concerns-refactoring.md"

AI: [Detects 3 approach options in document]
AI: "📋 Found 3 approach options in task document:

**Approach A**: Incremental Refactoring (One Component at a Time)
**Approach B**: Batch Refactoring (All Components at Once)
**Approach C**: Pattern Extraction + Incremental Application

💡 **Recommendation**: A - Incremental Refactoring

Low risk: Each PR is small (~200-500 line changes), easy to review, easy to rollback. Fast feedback: Can validate approach with ActionItemsList first, adjust if needed.

Proceed with A? (yes/no, or specify A/B/C)"

User: "yes"

AI: [Uses Approach A → Continues to ticket creation]
```

---

## TypeScript Types

```typescript
interface OptionData {
  title: string;
  description: string;
  pros: string;
  cons: string;
}

interface Recommendation {
  letter: string;
  title: string;
  reasoning: string; // Max 2 sentences, ~300 chars
}
```

---

**Last Updated**: 2025-11-22  
**Purpose**: Detailed implementation guide for approach option detection  
**See**: `.cursor/commands/create-tasks.md` - Main workflow command

