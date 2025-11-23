/**
 * Attendee Selection Composable
 *
 * SYOS-468: Extracts data fetching and selection logic from AttendeeSelector component
 *
 * Features:
 * - Fetches organization members (users)
 * - Fetches circles
 * - Manages search state and filtering
 * - Manages attendee selection/deselection
 * - Provides helper functions for UI rendering
 */

import { browser } from '$app/environment';
import { useQuery } from 'convex-svelte';
import { api, type Id } from '$lib/convex';

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
	// Search state
	const state = $state({
		searchValue: '',
		comboboxOpen: false
	});

	// Query users
	const usersQuery =
		browser && params.sessionId()
			? useQuery(api.organizations.getMembers, () => {
					const sessionId = params.sessionId();
					if (!sessionId) throw new Error('sessionId required');
					return { organizationId: params.organizationId(), sessionId };
				})
			: null;

	// Query circles
	const circlesQuery =
		browser && params.sessionId()
			? useQuery(api.circles.list, () => {
					const sessionId = params.sessionId();
					if (!sessionId) throw new Error('sessionId required');
					return { organizationId: params.organizationId(), sessionId };
				})
			: null;

	// Combine all available attendees
	const availableAttendees = $derived.by(() => {
		const attendees: Attendee[] = [];

		// Add users
		const users = usersQuery?.data ?? [];
		for (const user of users) {
			attendees.push({
				type: 'user',
				id: user.userId as Id<'users'>,
				name: user.name || user.email || 'Unknown',
				email: user.email
			});
		}

		// Add circles
		const circles = circlesQuery?.data ?? [];
		for (const circle of circles) {
			attendees.push({
				type: 'circle',
				id: circle.circleId as Id<'circles'>,
				name: circle.name
			});
		}

		return attendees;
	});

	// Filter attendees based on search
	const filteredAttendees = $derived.by(() => {
		const attendees = availableAttendees;
		if (!state.searchValue || state.searchValue.trim().length === 0) {
			return attendees;
		}

		const searchLower = state.searchValue.toLowerCase().trim();
		return attendees.filter((attendee) => {
			const nameMatch = attendee.name.toLowerCase().includes(searchLower);
			const emailMatch = attendee.email?.toLowerCase().includes(searchLower);
			return nameMatch || emailMatch;
		});
	});

	// Check if attendee is selected
	function isSelected(attendee: Attendee): boolean {
		const selected = params.selectedAttendees();
		return selected.some(
			(selected) => selected.type === attendee.type && selected.id === attendee.id
		);
	}

	// Toggle attendee selection
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

	// Remove attendee
	function removeAttendee(attendee: Attendee) {
		const selected = params.selectedAttendees();
		const updated = selected.filter((s) => !(s.type === attendee.type && s.id === attendee.id));
		params.onAttendeesChange(updated);
	}

	// Get type badge label
	function getTypeLabel(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'User';
			case 'circle':
				return 'Circle';
		}
	}

	// Get type badge color class
	function getTypeBadgeClass(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'bg-accent-primary/10 text-accent-primary';
			case 'circle':
				return 'bg-accent-primary/10 text-accent-primary';
		}
	}

	// Get icon for type
	function getTypeIcon(type: 'user' | 'circle'): string {
		switch (type) {
			case 'user':
				return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
			case 'circle':
				return 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z';
		}
	}

	const isLoading = $derived(
		(usersQuery?.isLoading ?? false) || (circlesQuery?.isLoading ?? false)
	);

	return {
		get availableAttendees() {
			return availableAttendees;
		},
		get filteredAttendees() {
			return filteredAttendees;
		},
		get searchValue() {
			return state.searchValue;
		},
		get comboboxOpen() {
			return state.comboboxOpen;
		},
		get isLoading() {
			return isLoading;
		},
		setSearchValue: (value: string) => {
			state.searchValue = value;
		},
		setComboboxOpen: (open: boolean) => {
			state.comboboxOpen = open;
		},
		isSelected,
		toggleAttendee,
		removeAttendee,
		getTypeLabel,
		getTypeBadgeClass,
		getTypeIcon
	};
}
