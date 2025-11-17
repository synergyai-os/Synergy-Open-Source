/**
 * Calendar Sync Utilities - Generate .ics files for meetings
 * Format: RFC 5545 (iCalendar)
 */

interface Meeting {
	_id: string;
	title: string;
	startTime: number;
	duration: number;
	visibility: 'public' | 'circle' | 'private';
	recurrence?: {
		frequency: 'daily' | 'weekly' | 'monthly';
		interval: number;
		daysOfWeek?: number[];
		endDate?: number;
	};
}

/**
 * Generate .ics file content for a single meeting
 */
export function generateICS(meeting: Meeting, organizationName?: string): string {
	const now = new Date();
	const startDate = new Date(meeting.startTime);
	const endDate = new Date(meeting.startTime + meeting.duration * 60 * 1000);

	// Format dates to iCalendar format (YYYYMMDDTHHMMSS)
	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		const second = String(date.getSeconds()).padStart(2, '0');
		return `${year}${month}${day}T${hour}${minute}${second}`;
	};

	// Generate unique UID for event
	const uid = `${meeting._id}@synergyos.ai`;

	// Build recurrence rule (RRULE) if recurring
	let rrule = '';
	if (meeting.recurrence) {
		const freq = meeting.recurrence.frequency.toUpperCase();
		const interval = meeting.recurrence.interval;
		rrule = `FREQ=${freq};INTERVAL=${interval}`;

		// Add BYDAY for weekly recurrence
		if (meeting.recurrence.frequency === 'weekly' && meeting.recurrence.daysOfWeek) {
			const days = meeting.recurrence.daysOfWeek
				.map((day) => ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][day])
				.join(',');
			rrule += `;BYDAY=${days}`;
		}

		// Add UNTIL if end date specified
		if (meeting.recurrence.endDate) {
			const endRecurrence = new Date(meeting.recurrence.endDate);
			rrule += `;UNTIL=${formatDate(endRecurrence)}Z`;
		}
	}

	// Build description
	const description = [
		organizationName ? `Organization: ${organizationName}` : '',
		`Visibility: ${meeting.visibility}`,
		'',
		'Powered by SynergyOS - www.synergyos.ai'
	]
		.filter(Boolean)
		.join('\\n');

	// Build .ics content
	const icsLines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//SynergyOS//Meetings//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${formatDate(now)}Z`,
		`DTSTART:${formatDate(startDate)}`,
		`DTEND:${formatDate(endDate)}`,
		`SUMMARY:${meeting.title}`,
		`DESCRIPTION:${description}`,
		`STATUS:CONFIRMED`,
		`TRANSP:OPAQUE`
	];

	// Add recurrence rule if exists
	if (rrule) {
		icsLines.push(`RRULE:${rrule}`);
	}

	icsLines.push('END:VEVENT', 'END:VCALENDAR');

	return icsLines.join('\r\n');
}

/**
 * Download .ics file to user's device
 */
export function downloadICS(meeting: Meeting, organizationName?: string): void {
	const icsContent = generateICS(meeting, organizationName);
	const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	// Create temporary download link
	const link = document.createElement('a');
	link.href = url;
	link.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up URL object
	URL.revokeObjectURL(url);
}

/**
 * Generate .ics for multiple meetings (batch export)
 */
export function generateBatchICS(meetings: Meeting[], organizationName?: string): string {
	const now = new Date();

	const formatDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		const second = String(date.getSeconds()).padStart(2, '0');
		return `${year}${month}${day}T${hour}${minute}${second}`;
	};

	const icsLines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//SynergyOS//Meetings//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH'
	];

	// Add each meeting as VEVENT
	for (const meeting of meetings) {
		const startDate = new Date(meeting.startTime);
		const endDate = new Date(meeting.startTime + meeting.duration * 60 * 1000);
		const uid = `${meeting._id}@synergyos.ai`;

		const description = [
			organizationName ? `Organization: ${organizationName}` : '',
			`Visibility: ${meeting.visibility}`,
			'',
			'Powered by SynergyOS - www.synergyos.ai'
		]
			.filter(Boolean)
			.join('\\n');

		icsLines.push(
			'BEGIN:VEVENT',
			`UID:${uid}`,
			`DTSTAMP:${formatDate(now)}Z`,
			`DTSTART:${formatDate(startDate)}`,
			`DTEND:${formatDate(endDate)}`,
			`SUMMARY:${meeting.title}`,
			`DESCRIPTION:${description}`,
			`STATUS:CONFIRMED`,
			`TRANSP:OPAQUE`,
			'END:VEVENT'
		);
	}

	icsLines.push('END:VCALENDAR');

	return icsLines.join('\r\n');
}

/**
 * Download batch .ics file
 */
export function downloadBatchICS(meetings: Meeting[], organizationName?: string): void {
	const icsContent = generateBatchICS(meetings, organizationName);
	const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = `meetings_${new Date().toISOString().split('T')[0]}.ics`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}
