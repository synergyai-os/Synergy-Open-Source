import { v } from 'convex/values';
import type { Id } from '../../_generated/dataModel';
import { mutation, query } from '../../_generated/server';
import {
	addAttendeeToMeeting,
	advanceMeetingStep,
	archiveMeetingMutation,
	closeMeetingSession,
	createAgendaItemMutation,
	createMeeting,
	addAttendeeArgs,
	advanceMeetingArgs,
	archiveMeetingArgs,
	closeMeetingArgs,
	createAgendaItemArgs,
	createMeetingArgs,
	removeAttendeeArgs,
	setActiveAgendaItemArgs,
	setRecorderArgs,
	startMeetingArgs,
	updateMeetingArgs,
	removeAttendeeFromMeeting,
	setActiveAgendaItemMutation,
	setMeetingRecorder,
	startMeetingSession,
	updateMeeting,
	updateMeetingCancelArgs,
	updateMeetingCancel,
	restoreMeetingArgs,
	restoreMeeting
} from './helpers/meetingMutations';
import {
	getAgendaItemsQuery,
	getInvitedUsersQuery,
	getMeeting,
	listMeetings,
	listMeetingsByCircle,
	listMeetingsByTemplate,
	listMeetingsForUser,
	getAgendaItemsArgs,
	getMeetingArgs,
	getInvitedUsersArgs,
	getMeetingsListArgs,
	listMeetingsByCircleArgs,
	listMeetingsByTemplateArgs,
	listMeetingsForUserArgs
} from './helpers/meetingQueries';

export const list = query({
	args: {
		sessionId: v.string(),
		...getMeetingsListArgs
	},
	handler: (ctx, args): Promise<unknown[]> => listMeetings(ctx, args)
});

export const get = query({
	args: {
		sessionId: v.string(),
		...getMeetingArgs
	},
	handler: (ctx, args) => getMeeting(ctx, args)
});

export const listByCircle = query({
	args: {
		sessionId: v.string(),
		...listMeetingsByCircleArgs
	},
	handler: (ctx, args): Promise<unknown[]> => listMeetingsByCircle(ctx, args)
});

export const listByTemplate = query({
	args: {
		sessionId: v.string(),
		...listMeetingsByTemplateArgs
	},
	handler: (ctx, args): Promise<unknown[]> => listMeetingsByTemplate(ctx, args)
});

export const getInvitedUsers = query({
	args: {
		sessionId: v.string(),
		...getInvitedUsersArgs
	},
	handler: (ctx, args): Promise<unknown[]> => getInvitedUsersQuery(ctx, args)
});

export const listForUser = query({
	args: {
		sessionId: v.string(),
		...listMeetingsForUserArgs
	},
	handler: (ctx, args): Promise<unknown[]> => listMeetingsForUser(ctx, args)
});

export const create = mutation({
	args: {
		sessionId: v.string(),
		...createMeetingArgs
	},
	handler: (ctx, args): Promise<{ meetingId: Id<'meetings'> }> => createMeeting(ctx, args)
});

export const update = mutation({
	args: {
		sessionId: v.string(),
		...updateMeetingArgs
	},
	handler: (ctx, args) => updateMeeting(ctx, args)
});

export const archiveMeeting = mutation({
	args: {
		sessionId: v.string(),
		...archiveMeetingArgs
	},
	handler: (ctx, args) => archiveMeetingMutation(ctx, args)
});

export const addAttendee = mutation({
	args: {
		sessionId: v.string(),
		...addAttendeeArgs
	},
	handler: (ctx, args) => addAttendeeToMeeting(ctx, args)
});

export const removeAttendee = mutation({
	args: {
		sessionId: v.string(),
		...removeAttendeeArgs
	},
	handler: (ctx, args) => removeAttendeeFromMeeting(ctx, args)
});

export const startMeeting = mutation({
	args: {
		sessionId: v.string(),
		...startMeetingArgs
	},
	handler: (ctx, args) => startMeetingSession(ctx, args)
});

export const advanceStep = mutation({
	args: {
		sessionId: v.string(),
		...advanceMeetingArgs
	},
	handler: (ctx, args) => advanceMeetingStep(ctx, args)
});

export const closeMeeting = mutation({
	args: {
		sessionId: v.string(),
		...closeMeetingArgs
	},
	handler: (ctx, args) => closeMeetingSession(ctx, args)
});

export const setRecorder = mutation({
	args: {
		sessionId: v.string(),
		...setRecorderArgs
	},
	handler: (ctx, args) => setMeetingRecorder(ctx, args)
});

export const setActiveAgendaItem = mutation({
	args: {
		sessionId: v.string(),
		...setActiveAgendaItemArgs
	},
	handler: (ctx, args) => setActiveAgendaItemMutation(ctx, args)
});

export const updateCancellation = mutation({
	args: {
		sessionId: v.string(),
		...updateMeetingCancelArgs
	},
	handler: (ctx, args) => updateMeetingCancel(ctx, args)
});

export const restore = mutation({
	args: {
		sessionId: v.string(),
		...restoreMeetingArgs
	},
	handler: (ctx, args) => restoreMeeting(ctx, args)
});

export const createAgendaItem = mutation({
	args: {
		sessionId: v.string(),
		...createAgendaItemArgs
	},
	handler: (ctx, args): Promise<{ itemId: Id<'meetingAgendaItems'> }> =>
		createAgendaItemMutation(ctx, args)
});

export const getAgendaItems = query({
	args: {
		sessionId: v.string(),
		...getAgendaItemsArgs
	},
	handler: (ctx, args): Promise<unknown[]> => getAgendaItemsQuery(ctx, args)
});
