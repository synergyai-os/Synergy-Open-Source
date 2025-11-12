import { AuthConfig } from 'convex/server';

const clientId = process.env.WORKOS_CLIENT_ID;

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

