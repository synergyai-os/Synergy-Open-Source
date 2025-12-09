export async function delay(ms = 3000): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

type RetryOptions = {
	attempts?: number;
	baseMs?: number;
	factor?: number;
};

export async function withRetry<T>(
	fn: () => Promise<T>,
	{ attempts = 3, baseMs = 500, factor = 2 }: RetryOptions = {}
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (attempt === attempts) break;
			const backoff = baseMs * Math.pow(factor, attempt - 1);
			await delay(backoff);
		}
	}

	throw lastError instanceof Error ? lastError : new Error('GENERIC_ERROR: Retry failed');
}
