<script lang="ts">
	import type {
		MockInboxItem,
		InputSourceType
	} from '../../../../../dev-docs/4-archive/mock-data-brain-inputs';

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
	class="w-full cursor-pointer overflow-hidden rounded-card border border-base bg-elevated text-left transition-all duration-150 hover:border-elevated hover:shadow-md"
>
	<div class="px-card py-card">
		<div class="flex items-start gap-icon">
			<!-- Type Icon -->
			<div class="flex-shrink-0 text-h2 leading-none">{getTypeIcon(item.type)}</div>

			<!-- Content -->
			<div class="min-w-0 flex-1">
				<!-- Title -->
				<h3
					class="mb-form-field-gap line-clamp-2 text-body leading-tight font-semibold text-primary"
				>
					{item.title}
				</h3>

				<!-- Snippet -->
				<p class="mb-form-field-gap line-clamp-2 text-small leading-relaxed text-secondary">
					{item.snippet}
				</p>

				<!-- Type Label -->
				<p class="mb-form-field-gap text-label text-tertiary">{getTypeLabel(item.type)}</p>

				<!-- Tags -->
				{#if item.tags && item.tags.length > 0}
					<div class="mb-form-field-gap flex flex-wrap gap-icon">
						{#each item.tags.slice(0, 2) as tag (tag)}
							<span class="rounded bg-tag px-badge py-badge text-label text-tag">
								{tag}
							</span>
						{/each}
					</div>
				{/if}

				<!-- Timestamp -->
				<p class="text-label text-tertiary">{formatDate(item.createdAt)}</p>
			</div>
		</div>
	</div>
</button>
