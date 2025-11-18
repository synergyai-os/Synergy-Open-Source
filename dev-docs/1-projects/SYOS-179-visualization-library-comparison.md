# SYOS-179: Interactive Org Chart Visualization Library Comparison

**Date**: November 17, 2025  
**Ticket**: [SYOS-179](https://linear.app/younghumanclub/issue/SYOS-179)  
**Goal**: Choose the best visualization library for creating an interactive, Holaspirit-style bubble chart for org structure

---

## Executive Summary

After comprehensive research using Context7 and evaluating 8+ visualization libraries, **D3.js Pack Layout** is the recommended choice for building the interactive org chart. It offers the best balance of:
- Native support for nested bubble/circle layouts (perfect for hierarchical circles)
- Full control over UI/UX (premium feel)
- Strong integration with Svelte
- Performance at scale (50+ circles)
- My strong native knowledge (high coding confidence)

**Runner-up**: Unovis (Svelte-native, but requires custom bubble layout implementation)

---

## Evaluation Criteria

1. **Nested Bubble Support** - Native or easy implementation of packed circles
2. **Svelte Integration** - How well it works with SvelteKit 5 + Svelte 5 Runes
3. **Performance** - Handles 50+ circles without lag
4. **Customization** - Premium UI/UX control (glass-morphism, animations, interactions)
5. **My LLM Knowledge** - How confidently I can code with this library
6. **Maintenance** - Active development, good documentation

---

## Option 1: D3.js Pack Layout (RECOMMENDED)

**Context7 ID**: `/d3/d3`  
**Code Snippets**: 1,721 (High coverage)  
**Source Reputation**: High  
**Benchmark Score**: 80.9

### Overview
D3.js is a low-level JavaScript library for data-driven visualizations. The **Pack Layout** algorithm is specifically designed for nested bubble charts - exactly what we need for hierarchical org circles.

### Pros
✅ **Perfect Fit for Use Case**
   - Pack layout is purpose-built for nested bubbles
   - Handles parent-child circle nesting automatically
   - Calculates circle sizes and positions algorithmically

✅ **Full Control Over UI/UX**
   - Direct SVG manipulation = premium interactions
   - Glass-morphism, shadows, animations all possible
   - No library constraints on design

✅ **Excellent Svelte Integration**
   - Use D3 for calculations, Svelte for rendering
   - Reactive data binding with Svelte stores
   - No DOM manipulation conflicts (D3 just does layout math)

✅ **Strong Performance**
   - Optimized for large hierarchies (50+ circles easy)
   - Efficient layout algorithm
   - Virtual scrolling possible for massive orgs

✅ **My High LLM Knowledge** (9/10)
   - Extensive training on D3.js documentation
   - Thousands of examples in my training data
   - Can write idiomatic D3 code confidently

✅ **Mature & Maintained**
   - Industry standard (11+ years)
   - Active development
   - Massive community support

### Cons
❌ **Manual Integration Required**
   - Need to write Svelte wrapper
   - More setup than higher-level libraries
   - ~2-3 hours integration work

❌ **Learning Curve** (for future maintainers)
   - D3 has steeper learning curve
   - May be intimidating for contributors unfamiliar with D3

### Implementation Approach
```typescript
// 1. Use D3 for layout calculation (not DOM manipulation)
import * as d3 from 'd3-hierarchy';

// 2. Transform Convex data → D3 hierarchy
const hierarchy = d3.hierarchy(circlesData)
  .sum(d => d.memberCount || 1);

// 3. Pack layout calculation
const pack = d3.pack()
  .size([width, height])
  .padding(3);

const root = pack(hierarchy);

// 4. Svelte renders the circles reactively
{#each root.descendants() as node}
  <circle cx={node.x} cy={node.y} r={node.r} />
{/each}
```

### Verdict
**⭐ BEST CHOICE** - Perfect fit for nested bubbles, full UI control, strong knowledge

---

## Option 2: Unovis (Svelte-Native)

**Context7 ID**: `/f5/unovis`  
**Code Snippets**: 462  
**Source Reputation**: High  
**Benchmark Score**: 81.7

### Overview
Modular data visualization framework with first-class Svelte support. Built by F5, designed for React/Angular/Svelte/Vue.

### Pros
✅ **Native Svelte Components**
   - `<VisGraph>`, `<VisXYContainer>` - idiomatic Svelte
   - Reactive by default
   - TypeScript support out of the box

✅ **Modern Architecture**
   - Well-designed API
   - Composable components
   - Design tokens support

✅ **Good Performance**
   - WebGL rendering for large datasets
   - Optimized for modern browsers

✅ **Active Development**
   - Regular updates
   - Good documentation
   - Enterprise backing (F5)

### Cons
❌ **No Built-in Pack Layout**
   - Has force-directed, hierarchical, concentric layouts
   - But NO packed circles/bubble layout
   - Would need custom implementation

❌ **Moderate LLM Knowledge** (6/10)
   - Newer library (less training data)
   - Can work with it, but less confident than D3
   - May need to reference docs frequently

❌ **Overkill for Single Use Case**
   - Designed for multiple chart types
   - We only need one visualization

### Verdict
**Good for future charts** - If we need more visualizations later (timelines, graphs), Unovis is excellent. But for just org chart, D3 is better.

---

## Option 3: Cytoscape.js

**Context7 ID**: `/cytoscape/cytoscape.js`  
**Code Snippets**: 787  
**Source Reputation**: High  
**Benchmark Score**: 82.2

### Overview
Graph theory library for complex networks. Popular in bioinformatics and network analysis.

### Pros
✅ **Graph-Oriented Features**
   - Rich graph algorithms
   - Complex node relationships
   - Multiple layout algorithms (concentric, hierarchical, force-directed)

✅ **Good Performance**
   - Handles thousands of nodes
   - Canvas rendering option

✅ **Strong Documentation**
   - Extensive examples
   - Active community

### Cons
❌ **No Packed Bubble Layout**
   - Has concentric layout (circles within circles)
   - But not the packed bubble aesthetic we want
   - Circles are concentrically arranged, not packed

❌ **Network-Focus (Overkill)**
   - Built for complex network graphs
   - We have simple hierarchy, not complex network
   - Heavyweight for our use case

❌ **Moderate LLM Knowledge** (7/10)
   - Familiar with it, but less confident than D3
   - Bioinformatics focus = less general examples

### Verdict
**Powerful but wrong tool** - Great for network graphs, not ideal for org bubbles

---

## Option 4: Vis.js Network

**Context7 ID**: `/visjs/vis-network`  
**Code Snippets**: 693  
**Source Reputation**: High

### Overview
Network visualization library with interactive physics simulations.

### Pros
✅ **Interactive by Default**
   - Drag, zoom, pan built-in
   - Physics simulation for organic movement

✅ **Easy Setup**
   - High-level API
   - Quick prototyping

### Cons
❌ **Network-Oriented**
   - Designed for networks, not hierarchies
   - Force-directed layout doesn't match bubble aesthetic

❌ **Performance Concerns**
   - Physics simulation can be CPU-intensive
   - May struggle with 50+ nodes

❌ **Limited Customization**
   - Harder to achieve premium UI/UX
   - Opinionated styling

❌ **Low LLM Knowledge** (5/10)
   - Less familiar, would need docs

### Verdict
**Not suitable** - Wrong visualization paradigm

---

## Option 5: Mermaid.js

**Context7 ID**: `/mermaid-js/mermaid`  
**Code Snippets**: 1,702  
**Source Reputation**: High  
**Benchmark Score**: 90.6

### Overview
Markdown-inspired diagramming tool. Generates diagrams from text definitions.

### Pros
✅ **Simple Syntax**
   - Text-based definitions
   - Easy to learn

✅ **Multiple Diagram Types**
   - Flowcharts, sequence, class diagrams
   - Good for documentation

### Cons
❌ **Static Diagrams**
   - Not designed for interactive applications
   - Limited runtime interactivity

❌ **No Bubble Layout**
   - Supports hierarchical layouts
   - But not packed circles

❌ **Wrong Use Case**
   - Great for docs, not interactive apps

### Verdict
**Not suitable** - Static diagrams, not interactive visualizations

---

## Option 6: Sigma.js

**Context7 ID**: `/jacomyal/sigma.js`  
**Code Snippets**: 109  
**Source Reputation**: High  
**Benchmark Score**: 53.9

### Overview
WebGL-powered graph visualization for large networks.

### Pros
✅ **High Performance**
   - WebGL rendering
   - Handles thousands of nodes

✅ **Modern Architecture**
   - Built on top of graphology
   - Good API design

### Cons
❌ **Network-Focused**
   - Force-directed layouts
   - Not hierarchical/packed bubbles

❌ **Overkill**
   - Designed for massive graphs (10k+ nodes)
   - We have <100 circles

❌ **Low LLM Knowledge** (4/10)
   - Newer library, less training data

### Verdict
**Not suitable** - Network graphs, not org charts

---

## Option 7: ELKjs (Eclipse Layout Kernel)

**Context7 ID**: `/kieler/elkjs`  
**Code Snippets**: 21  
**Source Reputation**: High

### Overview
JavaScript port of Eclipse Layout Kernel. Advanced graph layout algorithms.

### Pros
✅ **Sophisticated Layouts**
   - Hierarchical layouts
   - Automatic layer arrangement

✅ **Academic Quality**
   - Research-backed algorithms
   - Handles complex constraints

### Cons
❌ **No Packed Layout**
   - Layered hierarchical layout
   - Not bubble/circle packing

❌ **Heavyweight**
   - Complex configuration
   - Overkill for simple hierarchy

❌ **Very Low LLM Knowledge** (3/10)
   - Specialized library, little training data

### Verdict
**Not suitable** - Academic layouts, not bubble charts

---

## Option 8: LayerChart (Already Installed)

**Package**: `layerchart`  
**Already in project**: ✅ (Used for metrics forecasting)

### Overview
Svelte-native charting library. Already used in project for spline charts.

### Pros
✅ **Already Installed**
   - No new dependency
   - Familiar to codebase

✅ **Svelte-Native**
   - Idiomatic Svelte components
   - Reactive by default

### Cons
❌ **No Bubble/Pack Layout**
   - Line, bar, pie, area charts
   - Not designed for hierarchical visualizations

❌ **Wrong Tool**
   - Great for charts, not org structures

### Verdict
**Not suitable** - Wrong chart type

---

## My LLM Knowledge Confidence Ranking

How confidently I can code with each library (based on training data):

1. **D3.js** - 9/10 (Extensive training, can write idiomatic code)
2. **Cytoscape.js** - 7/10 (Familiar, but less depth)
3. **Unovis** - 6/10 (Can work with it, may need docs)
4. **Vis.js** - 5/10 (Basic knowledge, would reference docs)
5. **Mermaid** - 8/10 (Good knowledge, but wrong use case)
6. **Sigma.js** - 4/10 (Limited training data)
7. **ELKjs** - 3/10 (Very specialized, little training)
8. **LayerChart** - 7/10 (Good knowledge, but wrong tool)

---

## Tech Stack Compatibility

### SvelteKit 5 + Svelte 5 Runes
- **D3.js**: ✅ Excellent (use D3 for calculations, Svelte for rendering)
- **Unovis**: ✅ Excellent (native Svelte components)
- **Cytoscape.js**: ⚠️ Good (needs wrapper)
- **Others**: ⚠️ Requires integration work

### Tailwind CSS 4 + Design Tokens
- **D3.js**: ✅ Full control (SVG styling with Tailwind classes)
- **Unovis**: ✅ Good (supports custom styling)
- **Cytoscape.js**: ⚠️ Limited (uses Canvas)
- **Others**: ⚠️ Varies

### Convex Real-Time Data
- **All libraries**: ✅ Compatible (just need reactive updates)

---

## Implementation Complexity

### D3.js Pack Layout
**Estimated Time**: 6-8 hours
- 2h: Data transformation + pack layout setup
- 2h: Svelte component integration
- 2h: Interactions (click, hover, zoom)
- 2h: Detail panel + animations

**Code Volume**: ~300-400 lines

### Unovis (Custom Layout)
**Estimated Time**: 10-12 hours
- 4h: Understand Unovis Graph component
- 4h: Implement custom packed layout algorithm
- 2h: Interactions
- 2h: Polish

**Code Volume**: ~500-600 lines (includes custom layout logic)

### Others
**Estimated Time**: Not recommended (wrong tools)

---

## Final Recommendation

## ⭐ Use D3.js Pack Layout

### Why?
1. **Perfect Algorithm Match** - Pack layout is purpose-built for nested bubbles
2. **Full UI/UX Control** - Achieve premium Holaspirit-style design
3. **Strong Performance** - Scales to 100+ circles easily
4. **High LLM Confidence** - I can write this code confidently (9/10)
5. **Svelte-Friendly** - Clean separation: D3 calculates, Svelte renders
6. **Industry Standard** - Mature, well-documented, huge community

### Implementation Plan
```
Phase 1: Core Layout (2h)
- Install d3-hierarchy
- Transform Convex data → D3 hierarchy
- Pack layout calculation
- Basic SVG rendering

Phase 2: Svelte Integration (2h)
- Create OrgChart.svelte component
- Reactive circle rendering
- Handle data updates

Phase 3: Interactions (2h)
- Click → detail panel
- Hover → tooltips
- Zoom/pan controls

Phase 4: Polish (2h)
- Animations (enter/exit)
- Glass-morphism styling
- Role badges
- Performance optimization
```

### Installation
```bash
npm install d3-hierarchy d3-scale d3-zoom
npm install --save-dev @types/d3-hierarchy @types/d3-scale @types/d3-zoom
```

### Alternative If Time-Constrained
**Unovis** - If we need a quick MVP and plan to build more visualizations later, Unovis is a solid choice. But requires custom bubble layout implementation.

---

## Risk Assessment

### D3.js Risks
- **Low Risk**: D3 is mature, stable, well-documented
- **Mitigation**: Start with simple implementation, iterate
- **Fallback**: If D3 is too complex, pivot to Unovis (both are low-level, similar concepts)

### Unovis Risks
- **Medium Risk**: Need to implement custom layout algorithm
- **Mitigation**: D3 pack algorithm is well-documented, can adapt
- **Fallback**: Use D3 directly

---

## Next Steps

1. ✅ **Get user confirmation** on D3.js choice
2. Install D3 packages
3. Create data transformation utility
4. Build OrgChart.svelte component
5. Test with real circles data
6. Iterate on interactions

---

## References

- [D3.js Pack Layout Docs](https://d3js.org/d3-hierarchy/pack)
- [Holaspirit Org Chart Reference](https://www.holaspirit.com/) - Visual inspiration
- [Context7 D3.js Snippets](https://context7.com/d3/d3) - Code examples
- [Unovis Graph Docs](https://unovis.dev/docs/networks-and-flows/Graph) - Alternative approach

---

**Decision Made**: November 17, 2025  
**Confidence Level**: High (95%)  
**Status**: ⏳ Awaiting user confirmation

