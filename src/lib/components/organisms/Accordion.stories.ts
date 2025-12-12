// Accordion uses module-level exports - skip visual regression for now
// These components require complex nested structure that's hard to test visually
// Focus on Button, Card, Badge, Chip, FormInput for visual regression

import type { Meta } from '@storybook/sveltekit';

const meta = {
	title: 'Organisms/Accordion',
	tags: ['autodocs']
} satisfies Meta;

export default meta;
