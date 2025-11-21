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
			class="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-base bg-elevated shadow-card-hover"
		>
			{#if item}
				<div class="p-modal-padding">
					<!-- Header -->
					<div class="mb-settings-section flex items-center justify-between">
						<div>
							<h2 class="mb-form-field-gap text-h3 font-semibold text-primary">{item.title}</h2>
							<p class="text-small text-tertiary">{getTypeLabel(item.type)}</p>
						</div>
						<Dialog.Close type="button" onclick={onClose} class="dialog-close-button">
							<svg class="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					<div class="space-y-content-section">
						<!-- Main Content -->
						<div class="prose prose-sm max-w-none">
							{#if item.type === 'readwise_highlight'}
								<p
									class="mb-content-section text-h3 leading-readable tracking-readable text-primary"
								>
									{item.snippet}
								</p>
								{#if item.sourceTitle || item.author}
									<p class="text-small text-secondary">
										From {item.sourceTitle || 'Unknown Source'}
										{#if item.author}
											by {item.author}
										{/if}
									</p>
								{/if}
							{:else if item.type === 'code_snippet' && item.code}
								<pre class="overflow-x-auto rounded-input bg-surface px-card py-card"><code
										class="text-small">{item.code}</code
									></pre>
							{:else if item.text}
								<p class="text-body leading-readable whitespace-pre-wrap text-primary">
									{item.text}
								</p>
							{:else}
								<p class="text-body leading-readable text-primary">{item.snippet}</p>
							{/if}
						</div>

						<!-- Metadata -->
						<div class="space-y-icon border-t border-base pt-content-section">
							<div class="flex items-center gap-icon text-small text-secondary">
								<span>Created:</span>
								<span>{formatDate(item.createdAt)}</span>
							</div>

							{#if item.url}
								<div class="flex items-center gap-icon text-small text-secondary">
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
								<div class="flex flex-wrap gap-icon">
									{#each item.tags as tag (tag)}
										<span class="rounded-chip bg-tag px-badge py-badge text-label text-tag">
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
