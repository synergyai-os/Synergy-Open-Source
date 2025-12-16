import { afterEach, describe, expect, test, vi } from 'vitest';

import { ErrorCodes } from '../../infrastructure/errors/codes';
// SYOS-855: Test file moved to features/workspace-settings/
import { getOrgSettings, updateOrgSettings } from './index';
import { validateSessionAndGetUserId } from '../../infrastructure/sessionValidation';

vi.mock('../../infrastructure/sessionValidation', () => ({
	validateSessionAndGetUserId: vi.fn()
}));

const mockValidateSessionAndGetUserId = validateSessionAndGetUserId as vi.MockedFunction<
	typeof validateSessionAndGetUserId
>;

describe('workspaceSettings auth', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	test('getOrgSettings rejects when user is not a member', async () => {
		mockValidateSessionAndGetUserId.mockResolvedValue({ userId: 'u1' as any, session: {} as any });

		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockReturnValue({
						first: vi.fn().mockResolvedValue(null)
					})
				})
			}
		} as any;

		await expect(
			getOrgSettings(ctx, { sessionId: 's1', workspaceId: 'w1' as any })
		).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: You do not have access to this workspace`
		);
	});

	test('updateOrgSettings rejects non-admin users', async () => {
		mockValidateSessionAndGetUserId.mockResolvedValue({ userId: 'u1' as any, session: {} as any });

		const firstCall = vi.fn().mockResolvedValueOnce({ role: 'member' }).mockResolvedValueOnce(null);
		const ctx = {
			db: {
				query: vi.fn().mockReturnValue({
					withIndex: vi.fn().mockImplementation((_name: string, cb: any) => {
						const builder = { eq: vi.fn().mockReturnThis() };
						cb?.(builder);
						return { first: firstCall };
					})
				})
			}
		} as any;

		await expect(
			updateOrgSettings(ctx, {
				sessionId: 's1',
				workspaceId: 'w1' as any,
				allowQuickChanges: true
			})
		).rejects.toThrow(
			`${ErrorCodes.WORKSPACE_ACCESS_DENIED}: Only workspace admins can update org chart settings`
		);
	});
});
