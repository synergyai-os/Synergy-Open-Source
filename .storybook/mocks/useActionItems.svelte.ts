/**
 * Mock useActionItems composable for Storybook
 * Returns static mock data instead of Convex queries
 */

console.log('[MOCK FILE LOADED] useActionItems.svelte.ts mock is being used!');

import type { Id } from './convex';

interface UseActionItemsProps {
	agendaItemId: () => Id<'meetingAgendaItems'>;
	sessionId: () => string | undefined;
	organizationId: () => Id<'organizations'>;
	circleId?: () => Id<'circles'> | undefined;
}

interface UseActionItemsReturn {
	get actionItems(): unknown[];
	get members(): unknown[];
	get roles(): unknown[];
	get isLoading(): boolean;
}

export function useActionItems(_props: UseActionItemsProps): UseActionItemsReturn {
	// Return mock data structure matching the real composable
	const mockData = {
		// Mock action items - populated by default (showcases full functionality)
		actionItems: [
			{
				_id: 'action-1' as Id<'meetingActionItems'>,
				meetingId: 'meeting-1' as Id<'meetings'>,
				agendaItemId: 'agenda-item-1' as Id<'meetingAgendaItems'>,
				circleId: 'circle-1' as Id<'circles'>,
				description: 'Review Q4 roadmap and provide feedback',
				type: 'next-step' as const,
				assigneeType: 'user' as const,
				assigneeUserId: 'user-1' as Id<'users'>,
				dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
				status: 'todo' as const,
				createdAt: Date.now(),
				createdBy: 'user-1' as Id<'users'>,
				_creationTime: Date.now()
			},
			{
				_id: 'action-2' as Id<'meetingActionItems'>,
				meetingId: 'meeting-1' as Id<'meetings'>,
				agendaItemId: 'agenda-item-1' as Id<'meetingAgendaItems'>,
				circleId: 'circle-1' as Id<'circles'>,
				description: 'Prepare meeting notes for leadership sync',
				type: 'next-step' as const,
				assigneeType: 'role' as const,
				assigneeRoleId: 'role-1' as Id<'circleRoles'>,
				dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
				status: 'in-progress' as const,
				createdAt: Date.now(),
				createdBy: 'user-1' as Id<'users'>,
				_creationTime: Date.now()
			},
			{
				_id: 'action-3' as Id<'meetingActionItems'>,
				meetingId: 'meeting-1' as Id<'meetings'>,
				agendaItemId: 'agenda-item-1' as Id<'meetingAgendaItems'>,
				circleId: 'circle-1' as Id<'circles'>,
				description: 'Complete onboarding documentation updates',
				type: 'project' as const,
				assigneeType: 'user' as const,
				assigneeUserId: 'user-2' as Id<'users'>,
				status: 'done' as const,
				createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
				createdBy: 'user-2' as Id<'users'>,
				_creationTime: Date.now() - 7 * 24 * 60 * 60 * 1000
			}
		],
		// Mock members
		members: [
			{
				userId: 'user-1' as Id<'users'>,
				email: 'john@example.com',
				name: 'John Doe',
				role: 'admin',
				joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days ago
			},
			{
				userId: 'user-2' as Id<'users'>,
				email: 'jane@example.com',
				name: 'Jane Smith',
				role: 'member',
				joinedAt: Date.now() - 60 * 24 * 60 * 60 * 1000 // 60 days ago
			}
		],
		// Mock roles
		roles: [
			{
				roleId: 'role-1' as Id<'circleRoles'>,
				circleId: 'circle-1' as Id<'circles'>,
				name: 'Product Lead',
				purpose: 'Lead product strategy and roadmap',
				fillerCount: 1,
				createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 days ago
			},
			{
				roleId: 'role-2' as Id<'circleRoles'>,
				circleId: 'circle-1' as Id<'circles'>,
				name: 'Engineering Lead',
				purpose: 'Lead engineering team and technical decisions',
				fillerCount: 1,
				createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000 // 90 days ago
			}
		],
		// Mock loading state
		isLoading: false,
		error: undefined
	};

	console.log(
		'[useActionItems MOCK] Returning data with',
		mockData.actionItems.length,
		'action items'
	);
	console.log('[useActionItems MOCK] Action items:', mockData.actionItems);

	// Return with getters to match real composable interface
	return {
		get actionItems() {
			return mockData.actionItems;
		},
		get members() {
			return mockData.members;
		},
		get roles() {
			return mockData.roles;
		},
		get isLoading() {
			return mockData.isLoading;
		}
	};
}
