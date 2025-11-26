/**
 * Organism Components (Layer 4: Complex Sections)
 *
 * Complex UI sections composed of molecules and atoms:
 * - Header, Sidebar
 * - MeetingCard, InboxCard
 * - QuickCreateModal
 * - Dialog, Accordion, NavigationMenu
 *
 * These are full-featured components with complex behavior.
 *
 * @see component-architecture.md for atomic design structure
 */

// Dialog Organisms
export * as Dialog from './Dialog.svelte';
export * as AlertDialog from './AlertDialog.svelte';

// Navigation Organisms
export * as NavigationMenu from './NavigationMenu.svelte';
export * as Menubar from './Menubar.svelte';

// Layout Organisms
export * as Accordion from './Accordion.svelte';
export { default as SidebarToggle } from './SidebarToggle.svelte';
export { default as ThemeToggle } from './ThemeToggle.svelte';
export { default as ResizableSplitter } from './ResizableSplitter.svelte';

// Error Organisms
export { default as ErrorBoundary } from './ErrorBoundary.svelte';
export { default as RateLimitError } from './RateLimitError.svelte';

// Auth Organisms
export { default as LoginBox } from './LoginBox.svelte';

// Complex Form Organisms
export * as Calendar from './Calendar.svelte';
export * as RangeCalendar from './RangeCalendar.svelte';

// Complex UI Organisms
export * as Command from './Command.svelte';
export * as Collapsible from './Collapsible.svelte';
export * as Toolbar from './Toolbar.svelte';
export { default as StackedPanel } from './StackedPanel.svelte';
