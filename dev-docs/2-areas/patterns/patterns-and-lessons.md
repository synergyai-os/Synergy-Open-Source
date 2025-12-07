## Patterns & Lessons (2025-12-07)

- **Core scaffolding migration (SYOS-707)**  
  - Keep Convex domains under `/convex/core/{domain}/{schema,queries,mutations,rules,index}.ts`. Root entrypoints should only re-export core modules.
  - When migrating legacy root files, copy logic into core domain queries/mutations, then convert root files to delegates.
  - Scaffolds are acceptable for not-yet-modeled domains (people/assignments/policies) but must include schema/queries/mutations/rules/index to satisfy cohesion rules.

- **Code Hygiene rules added to Architecture (Principles 26–33)**  
  - Handlers ≤ 20 lines; extract validation into `rules.ts`.  
  - DRY: extract patterns on the third repetition (auth/access, archive branching, enrichment helpers).  
  - No `as unknown as`; prefer type helpers.  
  - Use helpers for archive filtering (`queryActive`) and access (`withCircleAccess`).  
  - Domain files ≤ 300 lines; split otherwise.  
  - Consistent errors: `ERR_CODE: message`.

- **Test co-location & verification**  
  - Authority calculator and proposal state machine tests live beside source and must stay passing when refactoring (`npm run test:unit:server -- calculator` / `-- stateMachine`).

- **Frontend module boundaries via Core API (SYOS-709)**  
  - Shared UI/composables (NoteEditor, Flashcard, navigation stack, TagSelector, etc.) must be exposed through `CoreModuleAPI` and consumed via `getContext('core-api')` instead of cross-module imports.  
  - Provide graceful fallbacks when the API surface is unavailable (e.g., simple text placeholder).  
  - When adding new shared pieces, extend `core/api.ts` rather than importing from another feature module. This preserves dependency flow (#5) and thin components (#12/#13).

- **Convex layering and shims (SYOS-708)**  
  - Feature logic lives under `/convex/features/{feature}`; cross-cutting services under `/convex/infrastructure/*`; root files act as shims that re-export for backward compatibility.  
  - Avoid pulling application-layer types into features; move shared types (e.g., ProseMirror JSON) into infrastructure to respect dependency flow (#5).  
  - HTTP entrypoint must default-export a router from `convex/http.ts`, even when delegating to infrastructure, or Convex deploy/codegen fails.

- **PostHog integration without bundling node built-ins**  
  - `posthog-node` can trigger codegen bundling errors on `node:fs/readline`. Use a fetch-based capture in Convex (`'use node'`) to avoid bundling Node built-ins during `npx convex codegen`.  
  - Keep analytics types minimal and local to avoid app-layer imports; prefer runtime environment vars (`PUBLIC_POSTHOG_KEY/HOST`) with graceful no-op when missing.


