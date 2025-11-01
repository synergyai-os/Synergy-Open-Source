import { Capacitor } from '@capacitor/core';
import { browser } from '$app/environment';

/**
 * Platform detection utilities
 * 
 * Detects three distinct platforms:
 * - iOS: Native iOS app via Capacitor
 * - Mobile Web: Web browser on mobile device
 * - Desktop Web: Web browser on desktop/laptop
 */

export type Platform = 'ios' | 'mobile-web' | 'desktop-web';

let isMobileCached: boolean | null = null;
let platformCached: Platform | null = null;

/**
 * Check if running on mobile device (based on viewport width)
 */
export function isMobileDevice(): boolean {
	if (!browser) return false;
	
	if (isMobileCached !== null) return isMobileCached;
	
	isMobileCached = window.innerWidth < 768;
	return isMobileCached;
}

/**
 * Get the current platform
 * 
 * - 'ios': Native iOS app (via Capacitor)
 * - 'mobile-web': Web browser on mobile device
 * - 'desktop-web': Web browser on desktop
 */
export function getPlatform(): Platform {
	if (platformCached !== null) return platformCached;
	
	if (browser) {
		const capacitorPlatform = Capacitor.getPlatform();
		
		if (capacitorPlatform === 'ios') {
			platformCached = 'ios';
		} else if (isMobileDevice()) {
			platformCached = 'mobile-web';
		} else {
			platformCached = 'desktop-web';
		}
	} else {
		// SSR - default to desktop
		platformCached = 'desktop-web';
	}
	
	return platformCached;
}

/**
 * Check if running in native app (iOS/Android via Capacitor)
 */
export function isNativeApp(): boolean {
	if (!browser) return false;
	const platform = Capacitor.getPlatform();
	return platform === 'ios' || platform === 'android';
}

/**
 * Check if running on iOS (native app only)
 */
export function isIOS(): boolean {
	if (!browser) return false;
	return Capacitor.getPlatform() === 'ios';
}

/**
 * Reset cached values (useful for testing or dynamic changes)
 */
export function resetPlatformCache(): void {
	isMobileCached = null;
	platformCached = null;
}

/**
 * Reactive platform detection for use in Svelte components
 * 
 * Usage in component:
 * ```svelte
 * <script>
 *   import { getPlatform, isMobileDevice } from '$lib/utils/platform';
 *   
 *   let platform = $state(getPlatform());
 *   let isMobile = $state(isMobileDevice());
 *   
 *   $effect(() => {
 *     if (browser) {
 *       const updatePlatform = () => {
 *         resetPlatformCache();
 *         platform = getPlatform();
 *         isMobile = isMobileDevice();
 *       };
 *       
 *       window.addEventListener('resize', updatePlatform);
 *       return () => window.removeEventListener('resize', updatePlatform);
 *     }
 *   });
 * </script>
 * ```
 */

