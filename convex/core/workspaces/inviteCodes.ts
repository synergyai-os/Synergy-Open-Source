export function ensureInviteCode(prefix: string): string {
	const random = Math.random().toString(36).slice(2, 8).toUpperCase();
	const randomTrailing = Math.random().toString(10).slice(2, 6);
	return `${prefix}-${random}-${randomTrailing}`;
}
