import { State } from 'ts-fsrs';

export function normalizeStateString(state: State): 'new' | 'learning' | 'review' | 'relearning' {
	switch (state) {
		case State.New:
			return 'new';
		case State.Learning:
			return 'learning';
		case State.Review:
			return 'review';
		case State.Relearning:
			return 'relearning';
		default:
			return 'new';
	}
}

export function parseState(state: string): State {
	switch (state) {
		case 'new':
			return State.New;
		case 'learning':
			return State.Learning;
		case 'review':
			return State.Review;
		case 'relearning':
			return State.Relearning;
		default:
			return State.New;
	}
}
