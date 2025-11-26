/**
 * Exception Handler
 * 
 * Loads and applies architectural exceptions from .architectural-exceptions.json
 */

import fs from 'fs';
import path from 'path';

/**
 * Load exceptions from the exceptions file
 * @param {string} rootDir - Project root directory
 * @returns {{ exceptions: Array, loaded: boolean }}
 */
export function loadExceptions(rootDir) {
	const exceptionsPath = path.join(rootDir, '.architectural-exceptions.json');
	
	if (!fs.existsSync(exceptionsPath)) {
		return { exceptions: [], loaded: false };
	}
	
	try {
		const content = fs.readFileSync(exceptionsPath, 'utf-8');
		const data = JSON.parse(content);
		return { exceptions: data.exceptions || [], loaded: true };
	} catch (error) {
		console.error(`Warning: Failed to load exceptions file: ${error.message}`);
		return { exceptions: [], loaded: false };
	}
}

/**
 * Check if a violation is excepted
 * @param {Object} violation - The violation object
 * @param {Array} exceptions - Array of exception objects
 * @returns {Object|null} The matching exception, or null if not excepted
 */
export function findException(violation, exceptions) {
	for (const exception of exceptions) {
		// Match by rule type
		if (exception.rule !== violation.type) {
			continue;
		}
		
		// Match by file path (relative)
		const violationFile = violation.relativeFile || violation.file;
		if (exception.file && !violationFile.includes(exception.file.replace(/^src\//, ''))) {
			// Try matching the full path
			if (!violationFile.endsWith(exception.file) && !exception.file.endsWith(violationFile)) {
				continue;
			}
		}
		
		// For layout_styling_separation, also check specific classes
		if (exception.rule === 'layout_styling_separation' && exception.classes) {
			if (violation.class && !exception.classes.includes(violation.class)) {
				continue;
			}
		}
		
		// Match found
		return exception;
	}
	
	return null;
}

/**
 * Filter violations, removing those that have documented exceptions
 * @param {Array} violations - Array of violations
 * @param {Array} exceptions - Array of exceptions
 * @returns {{ violations: Array, excepted: Array }}
 */
export function applyExceptions(violations, exceptions) {
	const filtered = [];
	const excepted = [];
	
	for (const violation of violations) {
		const exception = findException(violation, exceptions);
		
		if (exception) {
			excepted.push({
				...violation,
				exception
			});
		} else {
			filtered.push(violation);
		}
	}
	
	return { violations: filtered, excepted };
}

