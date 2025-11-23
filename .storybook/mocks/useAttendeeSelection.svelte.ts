/**
 * Mock useAttendeeSelection composable for Storybook
 * Returns static mock data instead of Convex queries
 */

console.log('[MOCK FILE LOADED] useAttendeeSelection.svelte.ts mock is being used!');

import type { Id } from './convex';

export type Attendee = {
	type: 'user' | 'circle';
	id: Id<'users'> | Id<'circles'>;
	name: string;
	email?: string; // For users
};

interface UseAttendeeSelectionParams {
	organizationId: () => Id<'organizations'>;
	sessionId: () => string | undefined;
	selectedAttendees: () => Attendee[];
	onAttendeesChange: (attendees: Attendee[]) => void;
}

export interface UseAttendeeSelectionReturn {
	get availableAttendees(): Attendee[];
	get filteredAttendees(): Attendee[];
	get searchValue(): string;
	get comboboxOpen(): boolean;
	get isLoading(): boolean;
	setSearchValue: (value: string) => void;
	setComboboxOpen: (open: boolean) => void;
	isSelected: (attendee: Attendee) => boolean;
	toggleAttendee: (attendee: Attendee) => void;
	removeAttendee: (attendee: Attendee) => void;
	getTypeLabel: (type: 'user' | 'circle') => string;
	getTypeBadgeClass: (type: 'user' | 'circle') => string;
	getTypeIcon: (type: 'user' | 'circle') => string;
}

export function useAttendeeSelection(
	params: UseAttendeeSelectionParams
): UseAttendeeSelectionReturn {
	// Mock data
	const mockUsers: Attendee[] = [
		{
			type: 'user',
			id: 'user-1' as Id<'users'>,
			name: 'John Doe',
			email: 'john@example.com'
		},
		{
			type: 'user',
			id: 'user-2' as Id<'users'>,
			name: 'Jane Smith',
			email: 'jane@example.com'
		},
		{
			type: 'user',
			id: 'user-3' as Id<'users'>,
			name: 'Bob Johnson',
			email: 'bob@example.com'
		}
	];

	const mockCircles: Attendee[] = [
		{
			type: 'circle',
			id: 'circle-1' as Id<'circles'>,
			name: 'Engineering'
		},
		{
			type: 'circle',
			id: 'circle-2' as Id<'circles'>,
			name: 'Product'
		},
		{
			type: 'circle',
			id: 'circle-3' as Id<'circles'>,
			name: 'Design'
		}
	];

	// Internal state
	let searchValue = $state('');
	let comboboxOpen = $state(false);

	const availableAttendees = [...mockUsers, ...mockCircles];

	const filteredAttendees = $derived.by(() => {
		if (!searchValue || searchValue.trim().length === 0) {
			return availableAttendees;
		}

		const searchLower = searchValue.toLowerCase().trim();
		return availableAttendees.filter((attendee) => {
			const nameMatch = attendee.name.toLowerCase().includes(searchLower);
			const emailMatch = attendee.email?.toLowerCase().includes(searchLower);
			return nameMatch || emailMatch;
		});
	});

	function isSelected(attendee: Attendee): boolean {
		const selected = params.selectedAttendees();
		return selected.some(
			(selected) => selected.type === attendee.type && selected.id === attendee.id
		);
	}

	function toggleAttendee(attendee: Attendee) {
		const selected = params.selectedAttendees();
		const isCurrentlySelected = isSelected(attendee);
		if (isCurrentlySelected) {
			const updated = selected.filter((s) => !(s.type === attendee.type && s.id === attendee.id));
			params.onAttendeesChange(updated);
		} else {
			const updated = [...selected, attendee];
			params.onAttendeesChange(updated);
		}
	}

	function removeAttendee(attendee: Attendee) {
		const selected = params.selectedAttendees();
		const updated = selected.filter((s) => !(s.type === attendee.type && s.id === attendee.id));
		params.onAttendeesChange(updated);
	}

	function getTypeLabel(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'User';
			case 'circle':
				return 'Circle';
		}
	}

	function getTypeBadgeClass(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'bg-accent-primary/10 text-accent-primary';
			case 'circle':
				return 'bg-accent-primary/10 text-accent-primary';
		}
	}

	function getTypeIcon(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
			case 'circle':
				return 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
		}
	}

	console.log('[useAttendeeSelection MOCK] Returning data');

	return {
		get availableAttendees() {
			return availableAttendees;
		},
		get filteredAttendees() {
			return filteredAttendees;
		},
		get searchValue() {
			return searchValue;
		},
		get comboboxOpen() {
			return comboboxOpen;
		},
		get isLoading() {
			return false;
		},
		setSearchValue: (value: string) => {
			searchValue = value;
		},
		setComboboxOpen: (open: boolean) => {
			comboboxOpen = open;
		},
		isSelected,
		toggleAttendee,
		removeAttendee,
		getTypeLabel,
		getTypeBadgeClass,
		getTypeIcon
	};
}
