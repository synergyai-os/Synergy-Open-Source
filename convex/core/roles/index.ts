/**
 * Roles Core Exports
 *
 * Pure business logic for circle roles.
 */

export { isLeadTemplate, type RoleTemplate } from './detection';
export {
	hasDuplicateRoleName,
	normalizeRoleName,
	type RoleNameCarrier
} from './validation';
export {
	countLeadRoles,
	isLeadRequiredForCircleType,
	type RoleCircleType,
	type LeadRequirementMap,
	type RoleWithTemplate,
	type TemplateLookup
} from './lead';

