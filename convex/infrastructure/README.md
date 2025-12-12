# Convex Infrastructure Layer

Cross-cutting services (auth, events, telemetry) belong here and must not depend on core or features. When adding infrastructure modules, keep them isolated and export a minimal interface via `index.ts` with co-located tests.
