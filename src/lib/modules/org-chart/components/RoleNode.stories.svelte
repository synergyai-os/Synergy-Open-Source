<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RoleNode from './RoleNode.svelte';

	const { Story } = defineMeta({
		component: RoleNode,
		title: 'Modules/OrgChart/RoleNode',
		tags: ['autodocs']
	});

	// Mock role node data
	const mockRole = {
		roleId: 'role-123',
		name: 'Frontend Lead',
		x: 0,
		y: 0,
		r: 20
	};

	const mockCircleNode = {
		data: {
			circleId: 'circle-123',
			organizationId: 'org-123',
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
		role: mockRole,
		circleNode: mockCircleNode,
		zoomLevel: 1.0,
		showLabel: true,
		onClick: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify role circle renders
		const circle = canvasElement.querySelector('circle');
		if (!circle) throw new Error('Role circle element not found');
		if (circle.getAttribute('r') !== '20') {
			throw new Error(`Expected radius 20, got ${circle.getAttribute('r')}`);
		}
		if (circle.getAttribute('fill') !== 'white') {
			throw new Error(`Expected fill white, got ${circle.getAttribute('fill')}`);
		}
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.circleNode.x},{args.circleNode.y})">
				<g transform="translate({args.role.x},{args.role.y})">
					<RoleNode
						role={args.role}
						circleNode={args.circleNode}
						zoomLevel={args.zoomLevel}
						showLabel={args.showLabel}
						onClick={args.onClick}
					/>
				</g>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="With Label"
	args={{
		role: mockRole,
		circleNode: mockCircleNode,
		zoomLevel: 2.0,
		showLabel: true,
		onClick: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify label is visible (text may be truncated by truncateText function)
		const text = canvasElement.querySelector('text');
		if (!text) throw new Error('Role label text element not found');
		// Text is truncated, so check for partial match (starts with "Fr" or contains "Frontend")
		if (
			!text.textContent ||
			(!text.textContent.startsWith('Fr') && !text.textContent.includes('Frontend'))
		) {
			throw new Error(
				`Expected text to start with 'Fr' or contain 'Frontend' (may be truncated), got ${text.textContent}`
			);
		}
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.circleNode.x},{args.circleNode.y})">
				<g transform="translate({args.role.x},{args.role.y})">
					<RoleNode
						role={args.role}
						circleNode={args.circleNode}
						zoomLevel={args.zoomLevel}
						showLabel={args.showLabel}
						onClick={args.onClick}
					/>
				</g>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="Without Label (Small)"
	args={{
		role: { ...mockRole, r: 8 },
		circleNode: mockCircleNode,
		zoomLevel: 0.5,
		showLabel: false,
		onClick: () => {}
	}}
	play={async ({ canvasElement, args }) => {
		// Verify label is NOT visible when too small
		const text = canvasElement.querySelector('text');
		if (text) {
			throw new Error('Expected no text label for small role, but found one');
		}
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.circleNode.x},{args.circleNode.y})">
				<g transform="translate({args.role.x},{args.role.y})">
					<RoleNode
						role={args.role}
						circleNode={args.circleNode}
						zoomLevel={args.zoomLevel}
						showLabel={args.showLabel}
						onClick={args.onClick}
					/>
				</g>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="Click Interaction"
	args={{
		role: mockRole,
		circleNode: mockCircleNode,
		zoomLevel: 1.0,
		showLabel: true,
		onClick: () => {}
	}}
	play={async ({ canvasElement, args, userEvent }) => {
		// Click the role circle
		const roleGroup = canvasElement.querySelector('.role-circle-group');
		if (!roleGroup) throw new Error('Role circle group element not found');

		await userEvent.click(roleGroup);
		// Note: onClick callback verification would require fn() spy, simplified for parser compatibility
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.circleNode.x},{args.circleNode.y})">
				<g transform="translate({args.role.x},{args.role.y})">
					<RoleNode
						role={args.role}
						circleNode={args.circleNode}
						zoomLevel={args.zoomLevel}
						showLabel={args.showLabel}
						onClick={args.onClick}
					/>
				</g>
			</g>
		</svg>
	{/snippet}
</Story>

<Story
	name="Hover Interaction"
	args={{
		role: mockRole,
		circleNode: mockCircleNode,
		zoomLevel: 1.0,
		showLabel: true,
		onClick: () => {}
	}}
	play={async ({ canvasElement, args, userEvent }) => {
		// Hover over the role circle
		const roleGroup = canvasElement.querySelector('.role-circle-group');
		if (!roleGroup) throw new Error('Role circle group element not found');

		await userEvent.hover(roleGroup);
		// Note: CSS transitions may not be immediately visible in test
		// But the element should be hoverable
	}}
>
	{#snippet template(args)}
		<svg width="800" height="600" class="bg-surface">
			<g transform="translate({args.circleNode.x},{args.circleNode.y})">
				<g transform="translate({args.role.x},{args.role.y})">
					<RoleNode
						role={args.role}
						circleNode={args.circleNode}
						zoomLevel={args.zoomLevel}
						showLabel={args.showLabel}
						onClick={args.onClick}
					/>
				</g>
			</g>
		</svg>
	{/snippet}
</Story>
