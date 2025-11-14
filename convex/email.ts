import { internalAction, action } from './_generated/server';
import { internal } from './_generated/api';
import { v } from 'convex/values';
import { Resend } from 'resend';

// Internal action: Test email function - sends to randy@synergyai.nl
// Using internalAction instead of internalMutation because actions can make HTTP requests
export const sendTestEmailInternal = internalAction({
	handler: async () => {
		// Get API key from Convex environment variables
		// In Convex, environment variables set via 'npx convex env set' are available as process.env
		const apiKey = process.env.RESEND_API_KEY;

		if (!apiKey) {
			throw new Error(
				'RESEND_API_KEY environment variable is not set. Run: npx convex env set RESEND_API_KEY your-key'
			);
		}

		// Initialize Resend client with the API key
		const resend = new Resend(apiKey);

		try {
			const result = await resend.emails.send({
				from: 'SynergyOS <noreply@mail.synergyos.ai>',
				to: 'randyhereman@gmail.com',
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
			throw new Error(
				`Failed to send email: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
});

// Public action that calls the internal action to send email
// Actions can make HTTP requests, so we use an action for Resend API calls
export const sendTestEmail = action({
	handler: async (ctx): Promise<{
		success: boolean;
		message: string;
		details: { success: boolean; emailId?: string; message: string; result?: unknown };
	}> => {
		// Call the internal action to send the email
		const result = await ctx.runAction(internal.email.sendTestEmailInternal);
		return { success: true, message: 'Test email sent to randy@synergyai.nl', details: result };
	}
});

// ============================================================================
// Authentication Email Functions
// ============================================================================

/**
 * Send verification code email for registration
 */
export const sendVerificationEmail = internalAction({
	args: {
		email: v.string(),
		code: v.string(),
		firstName: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const apiKey = process.env.RESEND_API_KEY;

		if (!apiKey) {
			throw new Error('RESEND_API_KEY environment variable is not set');
		}

		const resend = new Resend(apiKey);
		const displayName = args.firstName || 'there';

		try {
			const result = await resend.emails.send({
				from: 'SynergyOS <noreply@mail.synergyos.ai>',
				to: args.email as string,
				subject: 'Verify your email address',
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Verify Your Email</title>
					</head>
					<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
						<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
							<tr>
								<td align="center">
									<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
										<!-- Header -->
										<tr>
											<td style="padding: 40px 40px 24px 40px;">
												<h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827; line-height: 1.3;">
													Verify your email address
												</h1>
											</td>
										</tr>
										
										<!-- Body -->
										<tr>
											<td style="padding: 0 40px 24px 40px;">
												<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #374151;">
													Hi ${displayName},
												</p>
												<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
													Thanks for signing up for SynergyOS! To complete your registration, please enter this verification code:
												</p>
											</td>
										</tr>
										
										<!-- Code -->
										<tr>
											<td align="center" style="padding: 0 40px 32px 40px;">
												<div style="display: inline-block; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px 48px;">
													<p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: 'Courier New', monospace;">
														${args.code}
													</p>
												</div>
											</td>
										</tr>
										
										<!-- Footer -->
										<tr>
											<td style="padding: 0 40px 40px 40px;">
												<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
													This code will expire in <strong>10 minutes</strong>.
												</p>
												<p style="margin: 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
													If you didn't request this email, you can safely ignore it.
												</p>
											</td>
										</tr>
									</table>
									
									<!-- Footer text -->
									<table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
										<tr>
											<td style="padding: 0 40px;">
												<p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">
													© ${new Date().getFullYear()} SynergyOS. All rights reserved.
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</body>
					</html>
				`,
				text: `Hi ${displayName},\n\nThanks for signing up for SynergyOS! To complete your registration, please enter this verification code:\n\n${args.code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this email, you can safely ignore it.\n\n© ${new Date().getFullYear()} SynergyOS. All rights reserved.`
			});

			console.log('Verification email sent:', JSON.stringify(result, null, 2));

			if (result.error) {
				throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
			}

			return {
				success: true,
				emailId: result.data?.id
			};
		} catch (error) {
			console.error('Error sending verification email:', error);
			throw new Error(
				`Failed to send verification email: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
});

/**
 * Send password reset email with WorkOS token
 */
export const sendPasswordResetEmail = internalAction({
	args: {
		email: v.string(),
		resetUrl: v.string(),
		firstName: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const apiKey = process.env.RESEND_API_KEY;

		if (!apiKey) {
			throw new Error('RESEND_API_KEY environment variable is not set');
		}

		const resend = new Resend(apiKey);
		const displayName = args.firstName || 'there';

		try {
			const result = await resend.emails.send({
				from: 'SynergyOS <noreply@mail.synergyos.ai>',
				to: args.email as string,
				subject: 'Reset your password',
				html: `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Reset Your Password</title>
					</head>
					<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
						<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
							<tr>
								<td align="center">
									<table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
										<!-- Header -->
										<tr>
											<td style="padding: 40px 40px 24px 40px;">
												<h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827; line-height: 1.3;">
													Reset your password
												</h1>
											</td>
										</tr>
										
										<!-- Body -->
										<tr>
											<td style="padding: 0 40px 32px 40px;">
												<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #374151;">
													Hi ${displayName},
												</p>
												<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
													We received a request to reset your password. Click the button below to choose a new password:
												</p>
												
												<!-- Button -->
												<table width="100%" cellpadding="0" cellspacing="0">
													<tr>
														<td align="center" style="padding: 0 0 24px 0;">
															<a href="${args.resetUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">
																Reset Password
															</a>
														</td>
													</tr>
												</table>
												
												<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
													Or copy and paste this link into your browser:
												</p>
												<p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #3b82f6; word-break: break-all;">
													${args.resetUrl}
												</p>
											</td>
										</tr>
										
										<!-- Footer -->
										<tr>
											<td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
												<p style="margin: 16px 0 0 0; font-size: 14px; line-height: 1.5; color: #6b7280;">
													This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
												</p>
											</td>
										</tr>
									</table>
									
									<!-- Footer text -->
									<table width="600" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
										<tr>
											<td style="padding: 0 40px;">
												<p style="margin: 0; font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center;">
													© ${new Date().getFullYear()} SynergyOS. All rights reserved.
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</body>
					</html>
				`,
				text: `Hi ${displayName},\n\nWe received a request to reset your password. Click the link below to choose a new password:\n\n${args.resetUrl}\n\nThis link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.\n\n© ${new Date().getFullYear()} SynergyOS. All rights reserved.`
			});

			console.log('Password reset email sent:', JSON.stringify(result, null, 2));

			if (result.error) {
				throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
			}

			return {
				success: true,
				emailId: result.data?.id
			};
		} catch (error) {
			console.error('Error sending password reset email:', error);
			throw new Error(
				`Failed to send password reset email: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}
});
