/**
 * Proposals schema - Types and aliases
 */

import type { Doc } from '../../_generated/dataModel';

// Re-export types from constants.ts (single source of truth)
export type { ProposalStatus } from './constants';

// Type aliases
export type CircleProposalDoc = Doc<'circleProposals'>;
export type ProposalEvolutionDoc = Doc<'proposalEvolutions'>;
export type ProposalAttachmentDoc = Doc<'proposalAttachments'>;
export type ProposalObjectionDoc = Doc<'proposalObjections'>;
