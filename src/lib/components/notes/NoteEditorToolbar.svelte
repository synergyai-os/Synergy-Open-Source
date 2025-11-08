<script lang="ts">
	import * as ControlPanel from '$lib/components/control-panel';
	import { EditorView } from 'prosemirror-view';
	import { EditorState } from 'prosemirror-state';
	import { toggleMark, setBlockType } from 'prosemirror-commands';
	import { undo, redo } from 'prosemirror-history';

	type Props = {
		editorView: EditorView;
		editorState: EditorState | null;
	};

	let { editorView, editorState }: Props = $props();

	function runCommand(command: any) {
		if (!editorView || !editorState) return;
		command(editorState, editorView.dispatch);
		editorView.focus();
	}

	// Check if mark is active
	function isMarkActive(markType: string): boolean {
		if (!editorState) return false;
		const { from, to } = editorState.selection;
		const mark = editorState.schema.marks[markType];
		if (!mark) return false;
		return editorState.doc.rangeHasMark(from, to, mark);
	}

	// Check if block type is active
	function isBlockActive(nodeType: string, attrs?: any): boolean {
		if (!editorState) return false;
		const { $from: from, to } = editorState.selection;
		const type = editorState.schema.nodes[nodeType];
		if (!type) return false;

		let active = false;
		editorState.doc.nodesBetween(from.pos, to, (node) => {
			if (node.type === type) {
				if (attrs) {
					active = Object.keys(attrs).every((key) => node.attrs[key] === attrs[key]);
				} else {
					active = true;
				}
			}
		});
		return active;
	}

	// Derived state for toolbar buttons
	const isBoldActive = $derived(isMarkActive('strong'));
	const isItalicActive = $derived(isMarkActive('em'));
	const isCodeActive = $derived(isMarkActive('code'));
	const isH1Active = $derived(isBlockActive('heading', { level: 1 }));
	const isH2Active = $derived(isBlockActive('heading', { level: 2 }));
	const isH3Active = $derived(isBlockActive('heading', { level: 3 }));
</script>

<ControlPanel.Root variant="toolbar">
	<!-- Text Formatting Group -->
	<ControlPanel.Group>
		<ControlPanel.Button
			active={isBoldActive}
			onclick={() => runCommand(toggleMark(editorState?.schema.marks.strong!))}
			title="Bold (Cmd+B)"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
				/>
			</svg>
		</ControlPanel.Button>

		<ControlPanel.Button
			active={isItalicActive}
			onclick={() => runCommand(toggleMark(editorState?.schema.marks.em!))}
			title="Italic (Cmd+I)"
		>
			<svg class="w-4 h-4 italic" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<line x1="19" y1="4" x2="10" y2="4" stroke-width="2" />
				<line x1="14" y1="20" x2="5" y2="20" stroke-width="2" />
				<line x1="15" y1="4" x2="9" y2="20" stroke-width="2" />
			</svg>
		</ControlPanel.Button>

		<ControlPanel.Button
			active={isCodeActive}
			onclick={() => runCommand(toggleMark(editorState?.schema.marks.code!))}
			title="Code (Cmd+`)"
		>
			<svg class="w-4 h-4 font-mono" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
				/>
			</svg>
		</ControlPanel.Button>
	</ControlPanel.Group>

	<ControlPanel.Divider />

	<!-- Headings Group -->
	<ControlPanel.Group>
		<ControlPanel.Button
			active={isH1Active}
			onclick={() => runCommand(setBlockType(editorState?.schema.nodes.heading!, { level: 1 }))}
			title="Heading 1 (Cmd+Shift+1)"
		>
			<span class="text-sm font-semibold">H1</span>
		</ControlPanel.Button>

		<ControlPanel.Button
			active={isH2Active}
			onclick={() => runCommand(setBlockType(editorState?.schema.nodes.heading!, { level: 2 }))}
			title="Heading 2 (Cmd+Shift+2)"
		>
			<span class="text-sm font-semibold">H2</span>
		</ControlPanel.Button>

		<ControlPanel.Button
			active={isH3Active}
			onclick={() => runCommand(setBlockType(editorState?.schema.nodes.heading!, { level: 3 }))}
			title="Heading 3 (Cmd+Shift+3)"
		>
			<span class="text-sm font-semibold">H3</span>
		</ControlPanel.Button>
	</ControlPanel.Group>

	<ControlPanel.Divider />

	<!-- History Group -->
	<ControlPanel.Group>
		<ControlPanel.Button onclick={() => runCommand(undo)} title="Undo (Cmd+Z)">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
				/>
			</svg>
		</ControlPanel.Button>

		<ControlPanel.Button onclick={() => runCommand(redo)} title="Redo (Cmd+Shift+Z)">
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
				/>
			</svg>
		</ControlPanel.Button>
	</ControlPanel.Group>
</ControlPanel.Root>
