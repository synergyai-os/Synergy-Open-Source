/**
 * Atomic Components (Layer 2: Styled Components)
 *
 * Basic building blocks with single responsibility:
 * - Button, Input, Card, Badge, Chip, Icon, Text, Heading
 * - FormInput, FormTextarea, PinInput
 * - StatusPill, KeyboardShortcut, Avatar, Tabs, Loading
 *
 * These are styled components that wrap Bits UI primitives or provide
 * basic UI elements with design tokens applied.
 *
 * @see component-architecture.md for atomic design structure
 */

// Core Atoms - Styled Components
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Badge } from './Badge.svelte';
export { default as Chip } from './Chip.svelte';
export { default as Icon } from './Icon.svelte';
export { default as Text } from './Text.svelte';
export { default as Heading } from './Heading.svelte';
export { default as Avatar } from './Avatar.svelte';
export { default as Loading } from './Loading.svelte';
export { default as KeyboardShortcut } from './KeyboardShortcut.svelte';
export { default as StatusPill } from './StatusPill.svelte';
export { default as PinInput } from './PinInput.svelte';

// Form Atoms
export { default as FormInput } from './FormInput.svelte';
export { default as FormSelect } from './FormSelect.svelte';
export { default as FormTextarea } from './FormTextarea.svelte';
export { default as Combobox } from './Combobox.svelte';
export { default as TimeInput } from './TimeInput.svelte';
export { default as DurationInput } from './DurationInput.svelte';

// Tabs (atomic component)
export * as Tabs from './Tabs.svelte';

// Form Input Atoms
export * as Checkbox from './Checkbox.svelte';
export * as RadioGroup from './RadioGroup.svelte';
export * as Switch from './Switch.svelte';
export * as Toggle from './Toggle.svelte';
export * as ToggleGroup from './ToggleGroup.svelte';
export * as Slider from './Slider.svelte';
export * as Label from './Label.svelte';

// Layout Atoms
export * as AspectRatio from './AspectRatio.svelte';
export * as ScrollArea from './ScrollArea.svelte';
export { default as Progress } from './Progress.svelte';
export { default as Meter } from './Meter.svelte';
export { default as Tooltip } from './Tooltip.svelte';
export { default as LoadingOverlay } from './LoadingOverlay.svelte';

// Export types
export type * from '../types';
export type { IconType } from './iconRegistry';
export { iconRegistry, getIcon, isValidIconType } from './iconRegistry';
