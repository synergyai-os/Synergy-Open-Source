export function calculateProfileName(
	firstName?: string | null,
	lastName?: string | null
): string | undefined {
	if (firstName && lastName) return `${firstName} ${lastName}`;
	return firstName || lastName || undefined;
}
