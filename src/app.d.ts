// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: {
				user?: {
					userId: string; // Convex user ID (for queries)
					workosId: string; // WorkOS user ID (for reference)
					email: string;
					firstName?: string;
					lastName?: string;
					activeWorkspace?: {
						type: 'personal' | 'organization';
						id: string | null; // null for personal, org ID for organization
						name?: string; // Display name
					};
				} | null;
				sessionId?: string;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
