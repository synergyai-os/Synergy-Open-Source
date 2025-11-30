/**
 * Module Registry Initialization
 *
 * Registers all modules in the registry. Import this file to initialize the module system.
 *
 * @example
 * ```typescript
 * // In +layout.server.ts or module initialization code
 * import '$lib/modules';
 *
 * // Now modules are registered and can be discovered
 * import { getEnabledModules } from '$lib/modules/registry';
 * const enabled = await getEnabledModules(sessionId);
 * ```
 */

import { registerModule } from './registry';
import { sharedUiModule } from './core/manifest';
import { inboxModule } from './inbox/manifest';
import { meetingsModule } from './meetings/manifest';
import { flashcardsModule } from './flashcards/manifest';
import { orgChartModule } from './org-chart/manifest';
import { docsModule } from './docs/manifest';
import { projectsModule } from './projects/manifest';

// Register all modules
registerModule(sharedUiModule);
registerModule(inboxModule);
registerModule(meetingsModule);
registerModule(flashcardsModule);
registerModule(orgChartModule);
registerModule(docsModule);
registerModule(projectsModule);
