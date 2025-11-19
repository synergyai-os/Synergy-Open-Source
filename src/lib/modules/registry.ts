/**
 * Module Registry & Discovery System
 *
 * Provides module registration, discovery, and feature flag integration.
 * Enables modules to be discovered, loaded dynamically, and managed independently.
 *
 * @see dev-docs/2-areas/architecture/modularity-refactoring-analysis.md
 * @see dev-docs/2-areas/architecture/system-architecture.md#6-modularity--module-system
 */

import type { FeatureFlagKey } from '$lib/featureFlags';
import { api } from '$lib/convex';

/**
 * Module metadata structure
 */
export interface ModuleManifest {
	/**
	 * Unique module identifier (e.g., 'core', 'inbox', 'meetings')
	 */
	name: string;

	/**
	 * Module version (semantic versioning)
	 */
	version: string;

	/**
	 * List of module names this module depends on
	 * Modules will only be enabled if all dependencies are enabled
	 */
	dependencies: string[];

	/**
	 * Feature flag that controls module enablement
	 * null = always enabled (no flag check required)
	 */
	featureFlag: FeatureFlagKey | null;

	/**
	 * Module API interface (optional)
	 * Provides type-safe access to module functionality
	 */
	api?: unknown;
}

/**
 * Internal module registry storage
 */
const moduleRegistry = new Map<string, ModuleManifest>();

/**
 * Register a module in the registry
 *
 * @param manifest - Module manifest with metadata
 * @note Idempotent: calling this multiple times with the same module name is safe
 *       (handles SSR module re-evaluation and HMR updates)
 *
 * @example
 * ```typescript
 * import { registerModule } from '$lib/modules/registry';
 * import { coreModule } from '$lib/modules/core/manifest';
 *
 * registerModule(coreModule);
 * ```
 */
export function registerModule(manifest: ModuleManifest): void {
	// Idempotent: if module is already registered, skip silently
	// This handles SSR module re-evaluation and HMR updates
	if (moduleRegistry.has(manifest.name)) {
		return;
	}

	moduleRegistry.set(manifest.name, manifest);
}

/**
 * Get a module by name
 *
 * @param name - Module name
 * @returns Module manifest or undefined if not found
 *
 * @example
 * ```typescript
 * const coreModule = getModule('core');
 * ```
 */
export function getModule(name: string): ModuleManifest | undefined {
	return moduleRegistry.get(name);
}

/**
 * Get all registered modules
 *
 * @returns Array of all module manifests
 *
 * @example
 * ```typescript
 * const allModules = getAllModules();
 * ```
 */
export function getAllModules(): ModuleManifest[] {
	return Array.from(moduleRegistry.values());
}

/**
 * Check if a feature flag is enabled using Convex feature flag system
 *
 * @param flag - Feature flag key (or null if no flag)
 * @param sessionId - Session ID for feature flag evaluation
 * @param client - Convex HTTP client for server-side queries
 * @returns Promise resolving to true if flag is enabled, false otherwise
 *
 * @note This is a server-side function that should be called from load functions.
 * For client-side checks, use the feature flag composable directly.
 *
 * @example
 * ```typescript
 * import { ConvexHttpClient } from 'convex/browser';
 * import { api } from '$lib/convex';
 * const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
 * const enabled = await checkFeatureFlag('meetings-module', sessionId, client);
 * ```
 */
export async function checkFeatureFlag(
	flag: FeatureFlagKey | null,
	sessionId: string,
	client: { query: (query: unknown, args: unknown) => Promise<unknown> }
): Promise<boolean> {
	// If no flag, module is always enabled
	if (flag === null) {
		return true;
	}

	try {
		// Use Convex feature flag query to check if flag is enabled
		const result = await client.query(api.featureFlags.checkFlag, {
			flag,
			sessionId
		});
		return (result as boolean) ?? false;
	} catch (error) {
		// If query fails, default to false (secure by default)
		console.warn(`Failed to check feature flag "${flag}":`, error);
		return false;
	}
}

/**
 * Get enabled modules based on feature flags
 *
 * @param sessionId - Session ID for feature flag evaluation
 * @param client - Convex HTTP client for server-side queries
 * @returns Promise resolving to array of enabled module names
 *
 * @example
 * ```typescript
 * // In +layout.server.ts
 * import { ConvexHttpClient } from 'convex/browser';
 * const client = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);
 * const enabledModules = await getEnabledModules(sessionId, client);
 * ```
 */
export async function getEnabledModules(
	sessionId: string,
	client: { query: (query: unknown, args: unknown) => Promise<unknown> }
): Promise<string[]> {
	const allModules = getAllModules();
	const enabledModules: string[] = [];

	// Check each module's feature flag and dependencies
	for (const module of allModules) {
		// Check if feature flag is enabled
		const flagEnabled = await checkFeatureFlag(module.featureFlag, sessionId, client);
		if (!flagEnabled) {
			continue;
		}

		// Check if all dependencies are enabled
		const allDependenciesEnabled = module.dependencies.every((depName) =>
			enabledModules.includes(depName)
		);

		if (allDependenciesEnabled) {
			enabledModules.push(module.name);
		}
	}

	return enabledModules;
}

/**
 * Get enabled module manifests
 *
 * @param sessionId - Session ID for feature flag evaluation
 * @param client - Convex HTTP client for server-side queries
 * @returns Promise resolving to array of enabled module manifests
 *
 * @example
 * ```typescript
 * const enabledManifests = await getEnabledModuleManifests(sessionId, client);
 * ```
 */
export async function getEnabledModuleManifests(
	sessionId: string,
	client: { query: (query: unknown, args: unknown) => Promise<unknown> }
): Promise<ModuleManifest[]> {
	const enabledNames = await getEnabledModules(sessionId, client);
	return enabledNames
		.map((name) => getModule(name))
		.filter((manifest): manifest is ModuleManifest => manifest !== undefined);
}

/**
 * Check if a module is enabled
 *
 * @param moduleName - Module name to check
 * @param sessionId - Session ID for feature flag evaluation
 * @param client - Convex HTTP client for server-side queries
 * @returns Promise resolving to true if module is enabled, false otherwise
 *
 * @example
 * ```typescript
 * const meetingsEnabled = await isModuleEnabled('meetings', sessionId, client);
 * ```
 */
export async function isModuleEnabled(
	moduleName: string,
	sessionId: string,
	client: { query: (query: unknown, args: unknown) => Promise<unknown> }
): Promise<boolean> {
	const enabledModules = await getEnabledModules(sessionId, client);
	return enabledModules.includes(moduleName);
}

/**
 * Resolve module dependencies in order
 * Returns modules in dependency order (dependencies first)
 *
 * @param moduleNames - Array of module names to resolve
 * @returns Array of module names in dependency order
 * @throws Error if circular dependency or missing dependency detected
 *
 * @example
 * ```typescript
 * const ordered = resolveDependencies(['meetings', 'inbox', 'core']);
 * // Returns: ['core', 'inbox', 'meetings']
 * ```
 */
export function resolveDependencies(moduleNames: string[]): string[] {
	const resolved: string[] = [];
	const resolving = new Set<string>();

	function resolve(name: string): void {
		if (resolved.includes(name)) {
			return; // Already resolved
		}

		if (resolving.has(name)) {
			throw new Error(`Circular dependency detected involving module "${name}"`);
		}

		const module = getModule(name);
		if (!module) {
			throw new Error(`Module "${name}" not found`);
		}

		resolving.add(name);

		// Resolve dependencies first
		for (const dep of module.dependencies) {
			if (!moduleNames.includes(dep)) {
				throw new Error(`Module "${name}" depends on "${dep}" which is not in the list`);
			}
			resolve(dep);
		}

		resolving.delete(name);
		resolved.push(name);
	}

	for (const name of moduleNames) {
		resolve(name);
	}

	return resolved;
}
