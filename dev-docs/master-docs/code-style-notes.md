# Code Style Notes (Stack-Aligned)

Lightweight readability conventions that do not change architecture rules.

## Fundamentals
- Prefer early returns to keep branches flat.
- Prefer `const`; use `let` only when mutation/reactivity is required (e.g., Svelte runes/state).
- Avoid negated ternaries; flip branches instead. Avoid `!!`; use `Boolean(x)` when clarity helps.
- Use object parameters when it improves callsite clarity; return named objects when a lone primitive would be unclear.
- Use discriminated unions with a `kind` tag for branching.
- One component per file (already our norm).
- Inline event handlers are fine when simple; extract only if reused or complex.
- Async style: default to `async/await`; fluent `.then/.catch` is acceptable for very short cases.

## Svelte + Convex Placement
- Define validation/authorization/business rules inside Convex queries/mutations.
- In Svelte, call `useQuery`/`useMutation` near where data is rendered or an action is fired to avoid prop drilling hooks.
- Shared atoms/molecules stay stateless; feature-level components may fetch their own data but must remain thin and logic-free.

