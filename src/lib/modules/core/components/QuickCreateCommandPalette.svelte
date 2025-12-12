<script lang="ts">
	import { Command } from 'bits-ui';
	import { KeyboardShortcut } from '$lib/components/atoms';

	type ContentType = 'note' | 'flashcard' | 'highlight';

	type Props = {
		onTypeSelect: (type: ContentType, method: 'click' | 'keyboard_c' | 'keyboard_nav') => void;
	};

	let { onTypeSelect }: Props = $props();
</script>

<!-- Command Center -->
<Command.Root
	class="border-base/30 bg-elevated flex h-full w-full flex-col overflow-hidden rounded-lg border shadow-lg"
>
	<!-- Search Input with Icon -->
	<div class="border-base/50 flex items-center border-b px-4 py-3">
		<!-- Search Icon -->
		<svg
			class="text-tertiary mr-3 h-5 w-5 flex-shrink-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
		<Command.Input
			class="placeholder:text-tertiary flex-1 border-0 bg-transparent p-0 text-base transition-colors focus:ring-0 focus:outline-hidden"
			placeholder="Type a command or search..."
		/>
	</div>
	<Command.List class="max-h-[280px] overflow-x-hidden overflow-y-auto px-2 pb-2">
		<Command.Viewport>
			<Command.Empty
				class="text-secondary flex w-full items-center justify-center pt-8 pb-6 text-sm"
			>
				No results found.
			</Command.Empty>
			<Command.Group>
				<Command.GroupHeading class="text-tertiary px-3 pt-4 pb-2 text-xs tracking-wider uppercase">
					Create New
				</Command.GroupHeading>
				<Command.GroupItems>
					<Command.Item
						class="data-selected:bg-hover-solid rounded-button flex h-auto cursor-pointer items-center justify-between px-3 py-2.5 text-sm outline-hidden transition-colors select-none"
						onSelect={() => onTypeSelect('note', 'click')}
						keywords={['note', 'text', 'thought', 'idea', 'write', 'capture']}
					>
						<div class="flex items-center gap-2">
							<span class="text-xl">📝</span>
							<div class="flex flex-col items-start">
								<span class="text-primary font-medium">Note</span>
								<span class="text-secondary text-xs">Capture a quick thought or idea</span>
							</div>
						</div>
						<KeyboardShortcut keys="C" />
					</Command.Item>
					<Command.Item
						class="data-selected:bg-hover-solid rounded-button flex h-auto cursor-pointer items-center justify-between px-3 py-2.5 text-sm outline-hidden transition-colors select-none"
						onSelect={() => onTypeSelect('flashcard', 'click')}
						keywords={['flashcard', 'card', 'question', 'answer', 'study', 'memorize', 'learn']}
					>
						<div class="flex items-center gap-2">
							<span class="text-xl">🗂️</span>
							<div class="flex flex-col items-start">
								<span class="text-primary font-medium">Flashcard</span>
								<span class="text-secondary text-xs">Create a question and answer pair</span>
							</div>
						</div>
						<KeyboardShortcut keys="F" />
					</Command.Item>
					<Command.Item
						class="data-selected:bg-hover-solid rounded-button flex h-auto cursor-pointer items-center justify-between px-3 py-2.5 text-sm outline-hidden transition-colors select-none"
						onSelect={() => onTypeSelect('highlight', 'click')}
						keywords={['highlight', 'excerpt', 'quote', 'passage', 'book', 'article', 'read']}
					>
						<div class="flex items-center gap-2">
							<span class="text-xl">✨</span>
							<div class="flex flex-col items-start">
								<span class="text-primary font-medium">Highlight</span>
								<span class="text-secondary text-xs">Save an excerpt from something you read</span>
							</div>
						</div>
						<KeyboardShortcut keys="H" />
					</Command.Item>
				</Command.GroupItems>
			</Command.Group>
		</Command.Viewport>
	</Command.List>
</Command.Root>
