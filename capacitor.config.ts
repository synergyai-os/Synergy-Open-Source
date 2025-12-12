import type { CapacitorConfig } from '@capacitor/cli';

// Detect if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

// For USB connection: use 'http://localhost:5173'
// For WiFi connection: use your Mac's IP address (e.g., 'http://192.168.68.110:5173')
// Your current IP: 192.168.68.110
const serverUrl = isDev ? 'http://192.168.68.110:5173' : undefined;

const config: CapacitorConfig = {
	appId: 'com.axon.app',
	appName: 'SynergyOS',
	webDir: 'www',
	// Enable live reload in development
	server: isDev
		? {
				url: serverUrl,
				cleartext: true // Allow HTTP (not HTTPS) connections
			}
		: undefined
};

export default config;
