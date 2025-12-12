import { describe, expect, test } from 'vitest';

import * as auth from './auth';

describe('auth helper entrypoint (SYOS-745 guard)', () => {
	test('exposes only the validated session helpers', () => {
		expect(Object.keys(auth).sort()).toEqual(['validateSessionAndGetUserId']);
		expect(auth.validateSessionAndGetUserId).toBeTypeOf('function');
	});
});
