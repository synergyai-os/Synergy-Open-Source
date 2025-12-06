/**
 * Core Domain Exports
 *
 * Core domains are foundational, stable entities that other modules depend on.
 * They should NOT depend on modules or application layer.
 *
 * Current core domains:
 * - authority: Circle authority calculation
 * - roles: Role management
 * - proposals: Governance proposals
 *
 * Future core domains:
 * - circles: Circle CRUD and business logic
 */

// Re-export all core domains
export * from './authority';
export * from './roles';
export * from './proposals';
