/**
 * Molecular Components (Layer 3: Composites)
 *
 * Composed of multiple atoms working together:
 * - FormField (Label + Input + Error)
 * - SearchBar (Input + Icon)
 * - FilterBar (Tabs + Chips)
 * - MetadataBar (Badges + Icons)
 *
 * These combine atoms to create reusable patterns.
 *
 * @see component-architecture.md for atomic design structure
 */

// Form Molecules
// Note: FormInput and FormTextarea are currently atoms but could be
// refactored into FormField molecule (Label + Input + Error) in future

// Metadata Molecules
export { default as MetadataBar } from './MetadataBar.svelte';

// Layout Molecules
export { default as PageHeader } from './PageHeader.svelte';

// Selector Molecules
export { default as PrioritySelector } from './PrioritySelector.svelte';
export { default as AssigneeSelector } from './AssigneeSelector.svelte';
export { default as ProjectSelector } from './ProjectSelector.svelte';
export { default as ContextSelector } from './ContextSelector.svelte';
export { default as WorkspaceSelector } from './WorkspaceSelector.svelte';

// Action Molecules
export { default as AttachmentButton } from './AttachmentButton.svelte';
export { default as ThemeToggle } from './ThemeToggle.svelte';
export { default as ToggleSwitch } from './ToggleSwitch.svelte';

// Menu Molecules
export * as DropdownMenu from './DropdownMenu.svelte';
export * as ContextMenu from './ContextMenu.svelte';
export * as Popover from './Popover.svelte';
export { default as ActionMenu } from './ActionMenu.svelte';
export * as Select from './Select.svelte';
export * as Combobox from './Combobox.svelte';

// Form Molecules
export * as DateField from './DateField.svelte';
export * as DatePicker from './DatePicker.svelte';
export * as DateRangeField from './DateRangeField.svelte';
export * as DateRangePicker from './DateRangePicker.svelte';
export * as TimeField from './TimeField.svelte';
export * as TimeRangeField from './TimeRangeField.svelte';
export { default as DateInput } from './DateInput.svelte';
export { default as DateTimeField } from './DateTimeField.svelte';
export { default as InfoCard } from './InfoCard.svelte';

// Navigation Molecules
export * as Pagination from './Pagination.svelte';
export { default as PanelBreadcrumbs } from './PanelBreadcrumbs.svelte';
export { default as LinkPreview } from './LinkPreview.svelte';
export * as RatingGroup from './RatingGroup.svelte';
export { default as NavItem } from './NavItem.svelte';
export { default as SplitButton } from './SplitButton.svelte';
export { default as Stepper } from './Stepper.svelte';

// Organization Switcher Molecules
export { default as AccountInfo } from './AccountInfo.svelte';
export { default as AccountActions } from './AccountActions.svelte';
export { default as OrganizationItem } from './OrganizationItem.svelte';
export { default as OrganizationList } from './OrganizationList.svelte';
export { default as WorkspaceActions } from './WorkspaceActions.svelte';
export { default as AccountMenu } from './AccountMenu.svelte';
export { default as LinkedAccountGroup } from './LinkedAccountGroup.svelte';
export { default as InviteItem } from './InviteItem.svelte';
export { default as InvitesList } from './InvitesList.svelte';
