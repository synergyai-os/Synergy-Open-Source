<script lang="ts">
	import type { MockInboxItem, InputSourceType } from '../../../../../dev-docs/4-archive/mock-data-brain-inputs';

	interface Props {
		item: MockInboxItem;
		onClick: () => void;
	}

	let { item, onClick }: Props = $props();

	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return `${Math.floor(diffDays / 365)} years ago`;
	}

	function getTypeIcon(type: InputSourceType): string {
		const icons: Record<InputSourceType, string> = {
			readwise_highlight: '📚',
			readwise_reader_document: '📄',
			manual_text: '✍️',
			web_article: '🌐',
			url_bookmark: '🔗',
			photo_note: '📷',
			screenshot: '📸',
			email: '📧',
			voice_memo: '🎤',
			code_snippet: '💻',
			meeting_note: '📋',
			newsletter: '📰',
			social_media_post: '📱',
			podcast_transcript: '🎙️',
			video_transcript: '🎥',
			pdf_document: '📑',
			word_document: '📝',
			annotation: '✍️',
			slack_message: '💬',
			calendar_event_note: '📅',
			checklist: '✓'
		};
		return icons[type] || '📝';
	}

	function getTypeLabel(type: InputSourceType): string {
		const labels: Record<InputSourceType, string> = {
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
			meeting_note: 'Meeting',
			newsletter: 'Newsletter',
			social_media_post: 'Social Post',
			podcast_transcript: 'Podcast',
			video_transcript: 'Video',
			pdf_document: 'PDF',
			word_document: 'Document',
			annotation: 'Annotation',
			slack_message: 'Slack',
			calendar_event_note: 'Calendar',
			checklist: 'Checklist'
		};
		return labels[type] || 'Item';
	}
</script>

<button
	type="button"
	onclick={onClick}
	class="w-full text-left bg-elevated rounded-md border border-base hover:border-elevated hover:shadow-md transition-all duration-150 cursor-pointer overflow-hidden"
>
	<div class="p-6">
		<div class="flex items-start gap-icon">
			<!-- Type Icon -->
			<div class="text-2xl flex-shrink-0 leading-none">{getTypeIcon(item.type)}</div>

			<!-- Content -->
			<div class="flex-1 min-w-0">
				<!-- Title -->
				<h3 class="text-base font-semibold text-primary mb-1 line-clamp-2 leading-tight">
					{item.title}
				</h3>

				<!-- Snippet -->
				<p class="text-sm text-secondary mb-2 line-clamp-2 leading-relaxed">
					{item.snippet}
				</p>

				<!-- Type Label -->
				<p class="text-xs text-tertiary mb-2">{getTypeLabel(item.type)}</p>

				<!-- Tags -->
				{#if item.tags && item.tags.length > 0}
					<div class="flex flex-wrap gap-1 mb-2">
						{#each item.tags.slice(0, 2) as tag}
							<span class="bg-tag text-tag text-label px-badge py-badge rounded">
								{tag}
							</span>
						{/each}
					</div>
				{/if}

				<!-- Timestamp -->
				<p class="text-xs text-tertiary">{formatDate(item.createdAt)}</p>
			</div>
		</div>
	</div>
</button>

