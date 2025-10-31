import { action } from './_generated/server';
import { internal } from './_generated/api';

// Public action that calls the internal action to send email
// Actions can make HTTP requests, so we use an action for Resend API calls
export const sendTestEmail = action({
	handler: async (ctx) => {
		// Call the internal action to send the email
		const result = await ctx.runAction(internal.sendTestEmail.sendTestEmail);
		return { success: true, message: 'Test email sent to randy@synergyai.nl', details: result };
	}
});

