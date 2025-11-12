import { AuthConfig } from 'convex/server';

const clientId = process.env.WORKOS_CLIENT_ID;

// Note: If WORKOS_CLIENT_ID is not set, Convex auth will fail at runtime with a clear error
// We don't validate here because this file gets imported during SvelteKit build where env vars aren't available

// Configure Convex to accept WorkOS JWTs
// See: https://docs.convex.dev/auth/authkit
export default {
	providers: [
		// WorkOS User Management (password auth)
		// JWT issuer: https://api.workos.com/user_management/{clientId}
		{
			type: 'customJwt',
			issuer: `https://api.workos.com/user_management/${clientId}`,
			algorithm: 'RS256',
			jwks: `https://api.workos.com/sso/jwks/${clientId}`,
			applicationID: clientId
		}
	]
} satisfies AuthConfig;

