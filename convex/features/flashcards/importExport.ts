import { internal } from '../../_generated/api';
import type { ActionCtx } from '../../_generated/server';
import { createError, ErrorCodes } from '../../infrastructure/errors/codes';
import { loadPrompt } from '../../promptUtils';

type GeneratedFlashcard = { question: string; answer: string };

async function requireUserIdFromSession(ctx: ActionCtx['handler'], sessionId: string) {
	const userId = await ctx.runQuery(internal.settings.getUserIdFromSessionId, { sessionId });
	if (!userId) {
		throw createError(ErrorCodes.AUTH_REQUIRED, 'Not authenticated');
	}
	return userId;
}

async function fetchKeys(ctx: ActionCtx['handler'], userId: string) {
	const keys: { claudeApiKey: string | null; readwiseApiKey: string | null } | null =
		await ctx.runQuery(internal.settings.getEncryptedKeysInternal, { userId });
	if (!keys?.claudeApiKey) {
		throw createError(
			ErrorCodes.EXTERNAL_API_KEY_MISSING,
			'Claude API key not configured. Please add your API key in Settings.'
		);
	}
	return keys.claudeApiKey;
}

async function decryptApiKey(ctx: ActionCtx['handler'], encryptedApiKey: string) {
	return ctx.runAction(internal.cryptoActions.decryptApiKey, {
		encryptedApiKey
	});
}

export async function callClaude(apiKey: string, prompt: string) {
	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01',
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			model: 'claude-3-haiku-20240307',
			max_tokens: 500,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			]
		})
	});

	if (!response.ok) {
		const errorBody = await response.text();
		let errorMessage = `Claude API error: ${response.status} ${response.statusText}`;
		try {
			const errorJson = JSON.parse(errorBody);
			errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
		} catch {
			if (errorBody) {
				errorMessage = errorBody.length > 200 ? `${errorBody.substring(0, 200)}...` : errorBody;
			}
		}
		throw createError(ErrorCodes.EXTERNAL_SERVICE_FAILURE, errorMessage);
	}

	return response.json() as Promise<{ content?: Array<{ text?: string }> }>;
}

export function parseFlashcards(raw: string): GeneratedFlashcard[] {
	try {
		const jsonMatch = raw.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			const parsed = JSON.parse(jsonMatch[0]);
			return Array.isArray(parsed) ? parsed : [parsed];
		}

		const objMatch = raw.match(/\{[\s\S]*\}/);
		if (objMatch) {
			const parsed = JSON.parse(objMatch[0]);
			return [parsed];
		}
	} catch {
		// fallthrough to fallback
	}

	return [
		{
			question: 'Generated Question',
			answer: raw
		}
	];
}

export async function fetchFlashcardsFromSourceHelper(
	ctx: ActionCtx['handler'],
	args: {
		sessionId: string;
		text: string;
		sourceTitle?: string;
		sourceAuthor?: string;
	}
) {
	const userId = await requireUserIdFromSession(ctx, args.sessionId);
	const encryptedApiKey = await fetchKeys(ctx, userId);
	const apiKey = await decryptApiKey(ctx, encryptedApiKey);

	const prompt = loadPrompt('flashcard-generation', {
		text: args.text,
		source: {
			title: args.sourceTitle,
			author: args.sourceAuthor
		}
	});

	try {
		const data = await callClaude(apiKey, prompt);
		const content: string = data.content?.[0]?.text || '';
		const flashcards = parseFlashcards(content);

		return {
			success: true,
			flashcards,
			rawResponse: content
		};
	} catch (error) {
		throw createError(
			ErrorCodes.FLASHCARD_GENERATION_FAILED,
			`Failed to generate flashcard: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
