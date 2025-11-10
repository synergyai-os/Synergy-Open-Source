import { internalAction, action } from './_generated/server';
import { internal } from './_generated/api';
import { Resend } from 'resend';

// Internal action: Test email function - sends to randy@synergyai.nl
// Using internalAction instead of internalMutation because actions can make HTTP requests
export const sendTestEmailInternal = internalAction({
	handler: async (ctx) => {
		// Get API key from Convex environment variables
		// In Convex, environment variables set via 'npx convex env set' are available as process.env
		const apiKey = process.env.RESEND_API_KEY;
		
		if (!apiKey) {
			throw new Error('RESEND_API_KEY environment variable is not set. Run: npx convex env set RESEND_API_KEY your-key');
		}

		// Initialize Resend client with the API key
		const resend = new Resend(apiKey);

		try {
			const result = await resend.emails.send({
				from: 'Axon <onboarding@resend.dev>', // Change this to your verified domain later
				to: 'randyhereman@gmail.com', // Using verified email for testing - Resend test mode only allows sending to your own verified email
				subject: 'Test Email from Axon',
				html: `
					<h1>Hello from Axon!</h1>
					<p>This is a test email to verify your Resend setup is working correctly.</p>
					<p>If you're reading this, everything is configured properly! 🎉</p>
					<p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
				`,
				text: 'Hello from Axon! This is a test email to verify your Resend setup is working correctly. If you receive this, everything is configured properly!'
			});

			console.log('Resend API response:', JSON.stringify(result, null, 2));

			if (result.error) {
				throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
			}

			return {
				success: true,
				emailId: result.data?.id,
				message: 'Email sent successfully',
				result: result
			};
		} catch (error) {
			console.error('Error sending email:', error);
			throw new Error(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
});

// Public action that calls the internal action to send email
// Actions can make HTTP requests, so we use an action for Resend API calls
export const sendTestEmail = action({
	handler: async (ctx): Promise<{ success: boolean; message: string; details: any }> => {
		// Call the internal action to send the email
		const result: any = await ctx.runAction(internal.email.sendTestEmailInternal);
		return { success: true, message: 'Test email sent to randy@synergyai.nl', details: result };
	}
});

