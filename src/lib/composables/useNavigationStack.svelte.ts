export type NavigationLayerType = 'circle' | 'role';

export type NavigationLayer = {
	type: NavigationLayerType;
	id: string;
	name: string;
	zIndex: number;
};

export type UseNavigationStack = ReturnType<typeof useNavigationStack>;

/**
 * Composable for managing hierarchical panel navigation stack
 *
 * Handles:
 * - Layer tracking (push/pop/jump)
 * - Z-index management (increments by 10 per layer)
 * - Breadcrumb state (current/previous layer info)
 *
 * Modularity:
 * - Independent state management (no UI coupling)
 * - Clear contract (simple push/pop/jumpTo API)
 * - Reusable across any hierarchical navigation
 *
 * @example
 * ```ts
 * const navStack = useNavigationStack();
 *
 * // Push new layer
 * navStack.push({ type: 'circle', id: 'abc', name: 'Engineering' });
 *
 * // Go back one step
 * navStack.pop();
 *
 * // Jump to specific layer
 * navStack.jumpTo(0); // Jump back to first layer
 *
 * // Access state
 * console.log(navStack.currentLayer); // { type: 'circle', id: 'abc', name: 'Engineering', zIndex: 50 }
 * console.log(navStack.previousLayer); // Previous layer or null
 * console.log(navStack.depth); // Number of layers in stack
 * ```
 */
export function useNavigationStack() {
	const state = $state({
		stack: [] as NavigationLayer[],
		baseZIndex: 50, // Matches --z-index-panel-base token
		zIndexIncrement: 10 // Matches --z-index-panel-increment token
	});

	return {
		// Getters - reactive access
		get stack() {
			return state.stack;
		},

		get currentLayer(): NavigationLayer | null {
			return state.stack[state.stack.length - 1] || null;
		},

		get previousLayer(): NavigationLayer | null {
			return state.stack[state.stack.length - 2] || null;
		},

		get depth() {
			return state.stack.length;
		},

		// Actions - navigation operations
		/**
		 * Push a new layer onto the navigation stack
		 * Z-index automatically calculated based on depth
		 */
		push: (layer: Omit<NavigationLayer, 'zIndex'>) => {
			const zIndex = state.baseZIndex + state.stack.length * state.zIndexIncrement;
			state.stack.push({ ...layer, zIndex });
		},

		/**
		 * Pop the current layer from the stack
		 * Does nothing if stack is empty
		 */
		pop: () => {
			if (state.stack.length > 0) {
				state.stack.pop();
			}
		},

		/**
		 * Jump back to a specific layer by index
		 * Removes all layers above the target index
		 *
		 * @param index - 0-based index of target layer
		 * @example
		 * // Stack: [Circle, SubCircle, Role]
		 * jumpTo(0); // Removes SubCircle and Role, keeps Circle
		 */
		jumpTo: (index: number) => {
			if (index >= 0 && index < state.stack.length) {
				state.stack = state.stack.slice(0, index + 1);
			}
		},

		/**
		 * Clear all layers from the stack
		 */
		clear: () => {
			state.stack = [];
		},

		/**
		 * Get layer by index (for breadcrumbs)
		 *
		 * @param index - 0-based index
		 * @returns Layer at index or null if out of bounds
		 */
		getLayer: (index: number): NavigationLayer | null => {
			return state.stack[index] || null;
		}
	};
}
