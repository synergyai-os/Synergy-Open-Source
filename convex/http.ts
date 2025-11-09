import { httpRouter } from "convex/server";

const http = httpRouter();

// WorkOS authentication is handled by SvelteKit
// No auth HTTP routes needed in Convex

export default http;
