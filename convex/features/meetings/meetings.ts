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
	args: getMeetingsListArgs,
	handler: (ctx, args): Promise<unknown[]> => listMeetings(ctx, args)
});

export const get = query({
	args: getMeetingArgs,
	handler: (ctx, args) => getMeeting(ctx, args)
});

export const listByCircle = query({
	args: listMeetingsByCircleArgs,
	handler: (ctx, args): Promise<unknown[]> => listMeetingsByCircle(ctx, args)
});

export const listByTemplate = query({
	args: listMeetingsByTemplateArgs,
	handler: (ctx, args): Promise<unknown[]> => listMeetingsByTemplate(ctx, args)
});

export const getInvitedUsers = query({
	args: getInvitedUsersArgs,
	handler: (ctx, args): Promise<unknown[]> => getInvitedUsersQuery(ctx, args)
});

export const listForUser = query({
	args: listMeetingsForUserArgs,
	handler: (ctx, args): Promise<unknown[]> => listMeetingsForUser(ctx, args)
});

export const create = mutation({
	args: createMeetingArgs,
	handler: (ctx, args): Promise<{ meetingId: Id<'meetings'> }> => createMeeting(ctx, args)
});

export const update = mutation({
	args: updateMeetingArgs,
	handler: (ctx, args) => updateMeeting(ctx, args)
});

export const archiveMeeting = mutation({
	args: archiveMeetingArgs,
	handler: (ctx, args) => archiveMeetingMutation(ctx, args)
});

export const addAttendee = mutation({
	args: addAttendeeArgs,
	handler: (ctx, args) => addAttendeeToMeeting(ctx, args)
});

export const removeAttendee = mutation({
	args: removeAttendeeArgs,
	handler: (ctx, args) => removeAttendeeFromMeeting(ctx, args)
});

export const startMeeting = mutation({
	args: startMeetingArgs,
	handler: (ctx, args) => startMeetingSession(ctx, args)
});

export const advanceStep = mutation({
	args: advanceMeetingArgs,
	handler: (ctx, args) => advanceMeetingStep(ctx, args)
});

export const closeMeeting = mutation({
	args: closeMeetingArgs,
	handler: (ctx, args) => closeMeetingSession(ctx, args)
});

export const setRecorder = mutation({
	args: setRecorderArgs,
	handler: (ctx, args) => setMeetingRecorder(ctx, args)
});

export const setActiveAgendaItem = mutation({
	args: setActiveAgendaItemArgs,
	handler: (ctx, args) => setActiveAgendaItemMutation(ctx, args)
});

export const updateCancellation = mutation({
	args: updateMeetingCancelArgs,
	handler: (ctx, args) => updateMeetingCancel(ctx, args)
});

export const restore = mutation({
	args: restoreMeetingArgs,
	handler: (ctx, args) => restoreMeeting(ctx, args)
});

export const createAgendaItem = mutation({
	args: createAgendaItemArgs,
	handler: (ctx, args): Promise<{ itemId: Id<'meetingAgendaItems'> }> =>
		createAgendaItemMutation(ctx, args)
});

export const getAgendaItems = query({
	args: getAgendaItemsArgs,
	handler: (ctx, args): Promise<unknown[]> => getAgendaItemsQuery(ctx, args)
});
