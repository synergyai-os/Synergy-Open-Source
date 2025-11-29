import { converter, formatHex } from 'culori';

const toOklch = converter('oklch');

/**
 * Converts hex color to OKLCH CSS string
 *
 * @example
 * hexToOKLCH('#FF0000') // → "oklch(62.8% 0.258 29.2)"
 */
export function hexToOKLCH(hex: string): string {
	const oklch = toOklch(hex);

	if (!oklch) {
		throw new Error(`Invalid hex color: ${hex}`);
	}

	const { l, c, h = 0 } = oklch;

	return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
}

/**
 * Converts OKLCH CSS string to hex
 *
 * @example
 * oklchToHex('oklch(62.8% 0.258 29.2)') // → "#ff0000"
 */
export function oklchToHex(oklchString: string): string {
	// Parse: "oklch(62.8% 0.258 29.2)" → { l: 0.628, c: 0.258, h: 29.2 }
	const match = oklchString.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);

	if (!match) {
		throw new Error(`Invalid OKLCH format: ${oklchString}`);
	}

	const [, l, c, h] = match;

	const oklchObj = {
		mode: 'oklch' as const,
		l: parseFloat(l) / 100,
		c: parseFloat(c),
		h: parseFloat(h)
	};

	const hex = formatHex(oklchObj);

	if (!hex) {
		throw new Error(`Failed to convert OKLCH to hex: ${oklchString}`);
	}

	return hex;
}

/**
 * Validates OKLCH format
 *
 * @example
 * isValidOKLCH('oklch(60% 0.25 240)') // → true
 * isValidOKLCH('#FF0000') // → false
 */
export function isValidOKLCH(color: string): boolean {
	return /^oklch\([\d.]+%\s+[\d.]+\s+[\d.]+\)$/.test(color);
}

/**
 * Generates hover variant (10% darker)
 *
 * @example
 * generateHoverColor('oklch(60% 0.25 240)') // → "oklch(50.0% 0.25 240)"
 */
export function generateHoverColor(baseColor: string): string {
	if (!isValidOKLCH(baseColor)) {
		throw new Error(`Invalid OKLCH format: ${baseColor}`);
	}

	const match = baseColor.match(/oklch\(([\d.]+)%\s+([\d.]+)\s+([\d.]+)\)/);
	if (!match) throw new Error('Failed to parse OKLCH');

	const [, l, c, h] = match;
	const newL = Math.max(0, parseFloat(l) - 10); // Darken by 10%

	return `oklch(${newL.toFixed(1)}% ${c} ${h})`;
}
