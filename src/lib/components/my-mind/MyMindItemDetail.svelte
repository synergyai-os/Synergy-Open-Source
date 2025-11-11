<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { MockInboxItem } from '../../../../dev-docs/4-archive/mock-data-brain-inputs';

	interface Props {
		item: MockInboxItem | null;
		open: boolean;
		onClose: () => void;
	}

	let { item, open, onClose }: Props = $props();

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			readwise_highlight: 'Highlight',
			readwise_reader_document: 'Article',
			manual_text: 'Note',
			web_article: 'Article',
			url_bookmark: 'Bookmark',
			photo_note: 'Photo',
			screenshot: 'Screenshot',
			email: 'Email',
			voice_memo: 'Voice Memo',
			code_snippet: 'Code',
			meeting_note: 'Meeting Note',
			newsletter: 'Newsletter',
			social_media_post: 'Social Post',
			podcast_transcript: 'Podcast',
			video_transcript: 'Video',
			pdf_document: 'PDF',
			word_document: 'Document',
			annotation: 'Annotation',
			slack_message: 'Slack Message',
			calendar_event_note: 'Calendar Event',
			checklist: 'Checklist'
		};
		return labels[type] || 'Item';
	}
</script>

<Dialog.Root
	{open}
	onOpenChange={(isOpen) => {
		if (!isOpen) onClose();
	}}
>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/50 transition-opacity" />
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-base bg-elevated shadow-xl"
		>
			{#if item}
				<div class="p-6">
					<!-- Header -->
					<div class="mb-6 flex items-center justify-between">
						<div>
							<h2 class="mb-1 text-xl font-semibold text-primary">{item.title}</h2>
							<p class="text-sm text-tertiary">{getTypeLabel(item.type)}</p>
						</div>
						<Dialog.Close
							type="button"
							onclick={onClose}
							class="flex h-8 w-8 items-center justify-center rounded-md text-secondary transition-colors hover:bg-hover-solid hover:text-primary"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</Dialog.Close>
					</div>

					<!-- Content -->
					<div class="space-y-4">
						<!-- Main Content -->
						<div class="prose prose-sm max-w-none">
							{#if item.type === 'readwise_highlight'}
								<p class="mb-4 text-lg leading-readable tracking-readable text-primary">
									{item.snippet}
								</p>
								{#if item.sourceTitle || item.author}
									<p class="text-sm text-secondary">
										From {item.sourceTitle || 'Unknown Source'}
										{#if item.author}
											by {item.author}
										{/if}
									</p>
								{/if}
							{:else if item.type === 'code_snippet' && item.code}
								<pre class="overflow-x-auto rounded-md bg-surface p-4"><code class="text-sm"
										>{item.code}</code
									></pre>
							{:else if item.text}
								<p class="text-base leading-readable whitespace-pre-wrap text-primary">
									{item.text}
								</p>
							{:else}
								<p class="text-base leading-readable text-primary">{item.snippet}</p>
							{/if}
						</div>

						<!-- Metadata -->
						<div class="space-y-2 border-t border-base pt-4">
							<div class="flex items-center gap-2 text-sm text-secondary">
								<span>Created:</span>
								<span>{formatDate(item.createdAt)}</span>
							</div>

							{#if item.url}
								<div class="flex items-center gap-2 text-sm text-secondary">
									<span>URL:</span>
									<a
										href={item.url}
										target="_blank"
										rel="noopener noreferrer"
										class="text-accent-primary hover:underline"
									>
										{item.url}
									</a>
								</div>
							{/if}

							{#if item.tags && item.tags.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each item.tags as tag}
										<span class="rounded bg-tag px-badge py-badge text-label text-tag">
											{tag}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
