import { wcagContrast } from 'culori';

export type ValidationResult = {
	valid: boolean;
	ratio?: number;
	error?: string;
	suggestion?: string;
	warning?: string; // Non-blocking warning (vs error which blocks)
};

/**
 * Validates color contrast against WCAG AA (4.5:1 for text, 3:1 for UI)
 */
export function validateWCAGContrast(
	foreground: string,
	background: string,
	minimumRatio: number = 4.5
): ValidationResult {
	const ratio = wcagContrast(foreground, background);

	if (!ratio || ratio < minimumRatio) {
		return {
			valid: false,
			ratio,
			error: `Contrast ratio ${ratio?.toFixed(2)}:1 fails WCAG AA (requires ${minimumRatio}:1)`
		};
	}

	return { valid: true, ratio };
}

/**
 * Validates org color for UI elements (buttons, backgrounds)
 * Uses 3:1 contrast requirement (WCAG AA for UI), not 4.5:1 (text)
 *
 * Brand colors are used for UI elements (bg-accent-primary), not text,
 * so we validate against the lower UI contrast requirement.
 *
 * Returns warnings (not errors) - allows saving but informs user about potential issues.
 */
export function validateOrgColor(orgColor: string): ValidationResult {
	// Background colors from design-system.json
	const lightBg = 'oklch(98% 0.002 247.839)'; // --color-bg-base (light)
	const darkBg = 'oklch(20% 0.002 247.839)'; // --color-bg-base (dark)

	const warnings: string[] = [];
	let minRatio = Infinity;

	// Test light mode (UI contrast 3:1 - for buttons/backgrounds)
	const lightTest = validateWCAGContrast(orgColor, lightBg, 3.0);
	if (lightTest.ratio) minRatio = Math.min(minRatio, lightTest.ratio);

	if (!lightTest.valid && lightTest.ratio) {
		const match = orgColor.match(/oklch\(([\d.]+)%/);
		const currentL = match ? parseFloat(match[1]) : 50;
		const suggestedL = currentL > 50 ? Math.max(35, currentL - 10) : Math.min(65, currentL + 10);
		warnings.push(
			`Light mode: Contrast ${lightTest.ratio.toFixed(2)}:1 (needs 3:1 for buttons). Try lightness ${suggestedL.toFixed(0)}%`
		);
	}

	// Test dark mode (UI contrast 3:1)
	const darkTest = validateWCAGContrast(orgColor, darkBg, 3.0);
	if (darkTest.ratio) minRatio = Math.min(minRatio, darkTest.ratio);

	if (!darkTest.valid && darkTest.ratio) {
		const match = orgColor.match(/oklch\(([\d.]+)%/);
		const currentL = match ? parseFloat(match[1]) : 50;
		const suggestedL = currentL < 60 ? Math.min(75, currentL + 10) : Math.max(25, currentL - 10);
		warnings.push(
			`Dark mode: Contrast ${darkTest.ratio.toFixed(2)}:1 (needs 3:1 for buttons). Try lightness ${suggestedL.toFixed(0)}%`
		);
	}

	// Always valid (warnings only, don't block)
	if (warnings.length > 0) {
		return {
			valid: true, // Allow saving
			ratio: minRatio,
			warning: warnings.join('\n'),
			suggestion:
				'Colors may be hard to see in some modes. Consider adjusting lightness for better contrast.'
		};
	}

	return { valid: true, ratio: minRatio };
}
