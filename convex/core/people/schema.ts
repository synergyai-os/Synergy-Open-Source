import type { Doc, Id } from '../../_generated/dataModel';
import { peopleTable } from './tables';

export type PersonDoc = Doc<'people'>;
export type PersonId = Id<'people'>;

// Export table for schema composition
export { peopleTable };
