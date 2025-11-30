# DateInput Component Debugging - Key Lessons

## Root Cause

`DatePicker.Input` from Bits UI crashes silently when used with a `children` snippet containing segments. The component renders nothing (white screen) with no console errors.

## Solution

Use `DateField` for the input instead of `DatePicker.Input`. This matches the pattern used in `TimeInput` (which uses `TimeField`).

## Key Technical Details

### Working Pattern

```svelte
<DateField.Root value={displayValue} bind:value locale={DEFAULT_LOCALE}>
  <DateField.Input {id} class={inputClasses}>
    {#snippet children({ segments })}
      {#each segments as { part, value: segmentValue }}
        <DateField.Segment {part}>
          {segmentValue}
        </DateField.Segment>
      {/each}
    {/snippet}
  </DateField.Input>
</DateField.Root>
```

### Critical Requirements

1. **Non-null value required**: `DateField` needs a value, not a placeholder. Use `today(getLocalTimeZone())` when `value` is null.
2. **Use `DateField.Segment`**: Not `DatePicker.Segment` - they're different components.
3. **No keys in `{#each}`**: Adding keys to `{#each segments}` or calendar loops causes crashes. ESLint warnings about missing keys are acceptable.

### DatePicker Popup

- Use `DatePicker.Root` with `bind:open={isOpen}` for popup control
- `DatePicker.Trigger` handles click and positioning automatically
- `DatePicker.Calendar` requires `children` snippet with `{ months, weekdays }` structure
- Bind calendar value separately: `let calendarValue = $state(value || today(getLocalTimeZone()))`

## What Didn't Work

- `DatePicker.Input` with children snippet → Silent crash
- `placeholder` prop when value is null → DateField needs actual value
- Keys in `{#each}` loops → Causes rendering failures
- `$state.raw()` → Not valid Svelte 5 API

## Current State

✅ Component works in Storybook
✅ Date input renders correctly
✅ Calendar popup opens/closes
✅ Date selection updates input
⚠️ ESLint warnings about missing keys (acceptable)

## Files Changed

- `src/lib/components/molecules/DateInput.svelte` - Main component (uses DateField + DatePicker)
- `src/lib/components/molecules/DateInput.stories.svelte` - Storybook stories
- `src/lib/design-system/recipes/dateInput.recipe.ts` - Styling recipe

## Next Steps

1. Test in `CreateMeetingModal` to ensure integration works
2. Consider adding proper keys if Svelte/Bits UI versions support it
3. Add styling/animations for popup if needed
