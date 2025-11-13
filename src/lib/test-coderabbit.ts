// Test file for CodeRabbit review
// This file intentionally includes some issues for CodeRabbit to catch

const unusedVariable = 'This should trigger a lint error';

// Missing return type annotation
export function testFunction(param: string) {
	return param.toUpperCase();
}

// Hardcoded value (should use design token)
export const testStyle = {
	padding: '8px', // Should use px-nav-item token
	backgroundColor: '#1a1a1a' // Should use bg-sidebar token
};
