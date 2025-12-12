/**
 * Proposal State Machine Tests
 *
 * Mirrors authority module testing approach: pure, isolated, no DB.
 */

import { describe, expect, test } from 'vitest';
import {
	assertTransition,
	canTransition,
	isTerminalState,
	VALID_TRANSITIONS,
	type ProposalStatus
} from './stateMachine';

const validPaths: [ProposalStatus, ProposalStatus][] = [
	['draft', 'submitted'],
	['draft', 'withdrawn'],
	['submitted', 'in_meeting'],
	['submitted', 'withdrawn'],
	['in_meeting', 'objections'],
	['in_meeting', 'integrated'],
	['in_meeting', 'approved'],
	['in_meeting', 'rejected'],
	['in_meeting', 'withdrawn'],
	['objections', 'integrated'],
	['objections', 'rejected'],
	['objections', 'withdrawn'],
	['integrated', 'approved'],
	['integrated', 'rejected'],
	['integrated', 'withdrawn']
];

describe('VALID_TRANSITIONS', () => {
	test('includes only known statuses', () => {
		const keys = Object.keys(VALID_TRANSITIONS);
		const values = Object.values(VALID_TRANSITIONS).flat();

		for (const status of [...keys, ...values]) {
			expect(status).toMatch(
				/^(draft|submitted|in_meeting|objections|integrated|approved|rejected|withdrawn)$/
			);
		}
	});
});

describe('canTransition', () => {
	test('allows documented valid transitions', () => {
		for (const [from, to] of validPaths) {
			expect(canTransition(from, to)).toBe(true);
		}
	});

	test('blocks invalid transitions', () => {
		expect(canTransition('approved', 'draft')).toBe(false);
		expect(canTransition('withdrawn', 'submitted')).toBe(false);
		expect(canTransition('draft', 'approved')).toBe(false);
		expect(canTransition('integrated', 'submitted')).toBe(false);
	});
});

describe('assertTransition', () => {
	test('does not throw for valid transitions', () => {
		expect(() => assertTransition('draft', 'submitted', 'test')).not.toThrow();
		expect(() => assertTransition('integrated', 'approved', 'test')).not.toThrow();
	});

	test('throws for invalid transitions', () => {
		expect(() => assertTransition('approved', 'draft' as ProposalStatus, 'test')).toThrow();
		expect(() => assertTransition('draft', 'approved', 'test')).toThrow();
	});
});

describe('isTerminalState', () => {
	test('identifies terminal statuses', () => {
		expect(isTerminalState('approved')).toBe(true);
		expect(isTerminalState('rejected')).toBe(true);
		expect(isTerminalState('withdrawn')).toBe(true);
	});

	test('non-terminal statuses return false', () => {
		expect(isTerminalState('draft')).toBe(false);
		expect(isTerminalState('in_meeting')).toBe(false);
		expect(isTerminalState('integrated')).toBe(false);
	});
});
