/**
 * withActiveFilter
 *
 * Helper to standardize archived filtering (Principle 31).
 * Chooses between active-only and all records based on includeArchived.
 */
export async function withActiveFilter<T>({
	includeArchived,
	active,
	all
}: {
	includeArchived?: boolean | null;
	active: () => Promise<T[]>;
	all: () => Promise<T[]>;
}): Promise<T[]> {
	return includeArchived ? all() : active();
}
