/**
 * Migration: Clear email from people linked to users
 *
 * Purpose:
 * - Remove duplicated `email` from `people` records that already have `userId`
 * - Keep `email` for invited people (no `userId`)
 *
 * Run with:
 *   npx convex run migrations/clearPeopleEmailDenormalization:run
 */

import { internalMutation } from '../_generated/server';

type MigrationResult = {
	totalPeople: number;
	withUserAndEmailBefore: number;
	invitedWithEmailBefore: number;
	cleared: number;
	remainingWithUserAndEmail: number;
};

export const run = internalMutation({
	args: {},
	handler: async (ctx): Promise<MigrationResult> => {
		console.log('🔄 Starting migration: clearPeopleEmailDenormalization');

		const people = await ctx.db.query('people').collect();

		let cleared = 0;
		let withUserAndEmailBefore = 0;
		let invitedWithEmailBefore = 0;

		for (const person of people) {
			const hasUser = Boolean(person.userId);
			const hasEmail = Boolean(person.email);

			if (hasUser && hasEmail) {
				withUserAndEmailBefore++;
				await ctx.db.patch(person._id, { email: undefined });
				cleared++;
			}

			if (!hasUser && hasEmail) {
				invitedWithEmailBefore++;
			}
		}

		const remainingWithUserAndEmail = withUserAndEmailBefore - cleared;

		console.log('✅ Migration complete');
		console.log(
			JSON.stringify(
				{
					totalPeople: people.length,
					withUserAndEmailBefore,
					invitedWithEmailBefore,
					cleared,
					remainingWithUserAndEmail
				},
				null,
				2
			)
		);

		return {
			totalPeople: people.length,
			withUserAndEmailBefore,
			invitedWithEmailBefore,
			cleared,
			remainingWithUserAndEmail
		};
	}
});
