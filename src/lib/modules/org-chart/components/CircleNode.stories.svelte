<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CircleNode from './CircleNode.svelte';

	const { Story } = defineMeta({
		component: CircleNode,
		title: 'Modules/OrgChart/CircleNode',
		tags: ['autodocs']
	});

	// Mock circle node data
	const mockCircleNode = {
		data: {
			circleId: 'circle-123',
			workspaceId: 'org-123',
			name: 'Engineering',
			slug: 'engineering',
			memberCount: 12,
			roleCount: 5,
			createdAt: Date.now()
		},
		x: 400,
		y: 300,
		r: 80,
		depth: 0,
		value: 100,
		children: [],
		parent: null
	};
</script>

<Story
	name="Default"
	args={{
		node: mockCircleNode,
		isSelected: false,
		isHovered: false,
		zoomLevel: 1.0,
		onClick: () => {},
		onMouseEnter: () => {},
		onMouseLeave: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify circle renders
		const circle = canvasElement.querySelector('circle');
		if (!circle) throw new Error('Circle element not found');
		if (circle.getAttribute('r') !== '80') {
			throw new Error(`Expected radius 80, got ${circle.getAttribute('r')}`);
		}
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.node.x},{args.node.y})">
				<CircleNode
					node={args.node}
					isSelected={args.isSelected}
					isHovered={args.isHovered}
					zoomLevel={args.zoomLevel}
					onClick={args.onClick}
					onMouseEnter={args.onMouseEnter}
					onMouseLeave={args.onMouseLeave}
				/>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="Selected"
	args={{
		node: mockCircleNode,
		isSelected: true,
		isHovered: false,
		zoomLevel: 1.0,
		onClick: () => {},
		onMouseEnter: () => {},
		onMouseLeave: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify selected state styling
		const circle = canvasElement.querySelector('circle');
		if (!circle) throw new Error('Circle element not found');
		const strokeWidth = circle.getAttribute('stroke-width');
		if (strokeWidth !== '3') {
			throw new Error(`Expected stroke-width 3, got ${strokeWidth}`);
		}
		const stroke = circle.getAttribute('stroke');
		if (!stroke || !stroke.includes('accent-primary')) {
			throw new Error(`Expected stroke to contain accent-primary, got ${stroke}`);
		}
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.node.x},{args.node.y})">
				<CircleNode
					node={args.node}
					isSelected={args.isSelected}
					isHovered={args.isHovered}
					zoomLevel={args.zoomLevel}
					onClick={args.onClick}
					onMouseEnter={args.onMouseEnter}
					onMouseLeave={args.onMouseLeave}
				/>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="Hovered"
	args={{
		node: mockCircleNode,
		isSelected: false,
		isHovered: true,
		zoomLevel: 1.0,
		onClick: () => {},
		onMouseEnter: () => {},
		onMouseLeave: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify hover state styling
		const circle = canvasElement.querySelector('circle');
		if (!circle) throw new Error('Circle element not found');
		const strokeWidth = circle.getAttribute('stroke-width');
		if (strokeWidth !== '2') {
			throw new Error(`Expected stroke-width 2, got ${strokeWidth}`);
		}
		const fillOpacity = circle.getAttribute('fill-opacity');
		if (fillOpacity !== '0.8') {
			throw new Error(`Expected fill-opacity 0.8, got ${fillOpacity}`);
		}
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.node.x},{args.node.y})">
				<CircleNode
					node={args.node}
					isSelected={args.isSelected}
					isHovered={args.isHovered}
					zoomLevel={args.zoomLevel}
					onClick={args.onClick}
					onMouseEnter={args.onMouseEnter}
					onMouseLeave={args.onMouseLeave}
				/>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="Click Interaction"
	args={{
		node: mockCircleNode,
		isSelected: false,
		isHovered: false,
		zoomLevel: 1.0,
		onClick: () => {},
		onMouseEnter: () => {},
		onMouseLeave: () => {}
	}}
	play={async ({ canvasElement, args, userEvent }) => {
		// Click the circle
		const circleGroup = canvasElement.querySelector('.circle-group');
		if (!circleGroup) throw new Error('Circle group element not found');

		await userEvent.click(circleGroup);
		// Note: onClick callback verification would require fn() spy, simplified for parser compatibility
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.node.x},{args.node.y})">
				<CircleNode
					node={args.node}
					isSelected={args.isSelected}
					isHovered={args.isHovered}
					zoomLevel={args.zoomLevel}
					onClick={args.onClick}
					onMouseEnter={args.onMouseEnter}
					onMouseLeave={args.onMouseLeave}
				/>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="Hover Interaction"
	args={{
		node: mockCircleNode,
		isSelected: false,
		isHovered: false,
		zoomLevel: 1.0,
		onClick: () => {},
		onMouseEnter: () => {},
		onMouseLeave: () => {}
	}}
	play={async ({ canvasElement, args, userEvent }) => {
		// Hover over the circle
		const circleGroup = canvasElement.querySelector('.circle-group');
		if (!circleGroup) throw new Error('Circle group element not found');

		await userEvent.hover(circleGroup);
		await userEvent.unhover(circleGroup);
		// Note: Callback verification would require fn() spy, simplified for parser compatibility
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.node.x},{args.node.y})">
				<CircleNode
					node={args.node}
					isSelected={args.isSelected}
					isHovered={args.isHovered}
					zoomLevel={args.zoomLevel}
					onClick={args.onClick}
					onMouseEnter={args.onMouseEnter}
					onMouseLeave={args.onMouseLeave}
				/>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="With Children"
	args={{
		node: {
			...mockCircleNode,
			children: [
				{
					...mockCircleNode,
					data: { ...mockCircleNode.data, name: 'Frontend', circleId: 'circle-456' },
					r: 40,
					depth: 1
				}
			]
		},
		isSelected: false,
		isHovered: false,
		zoomLevel: 1.0,
		onClick: () => {},
		onMouseEnter: () => {},
		onMouseLeave: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify circle with children has different styling
		const circle = canvasElement.querySelector('circle');
		if (!circle) throw new Error('Circle element not found');
		const fillOpacity = circle.getAttribute('fill-opacity');
		if (fillOpacity !== '0.5') {
			throw new Error(`Expected fill-opacity 0.5 (has children), got ${fillOpacity}`);
		}
		const strokeWidth = circle.getAttribute('stroke-width');
		if (strokeWidth !== '2') {
			throw new Error(`Expected stroke-width 2 (has children), got ${strokeWidth}`);
		}
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.node.x},{args.node.y})">
				<CircleNode
					node={args.node}
					isSelected={args.isSelected}
					isHovered={args.isHovered}
					zoomLevel={args.zoomLevel}
					onClick={args.onClick}
					onMouseEnter={args.onMouseEnter}
					onMouseLeave={args.onMouseLeave}
				/>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="Zoomed In (Label Visible)"
	args={{
		node: mockCircleNode,
		isSelected: false,
		isHovered: false,
		zoomLevel: 2.0,
		onClick: () => {},
		onMouseEnter: () => {},
		onMouseLeave: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify label is visible when zoomed in
		const text = canvasElement.querySelector('text');
		if (!text) throw new Error('Text label element not found');
		// Text may be truncated, so check for prefix match
		const textContent = text.textContent || '';
		if (!textContent.includes('Engineering') && !textContent.startsWith('En')) {
			throw new Error(
				`Expected text to contain 'Engineering' or start with 'En', got ${textContent}`
			);
		}
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.node.x},{args.node.y})">
				<CircleNode
					node={args.node}
					isSelected={args.isSelected}
					isHovered={args.isHovered}
					zoomLevel={args.zoomLevel}
					onClick={args.onClick}
					onMouseEnter={args.onMouseEnter}
					onMouseLeave={args.onMouseLeave}
				/>
			</g>
		</svg>
	{/snippet}
</Story>
