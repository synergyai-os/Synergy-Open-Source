import fs from 'fs';
import path from 'path';

import { EXCLUDED_PATH_PATTERNS } from './config';

function listEntries(dir: string, files: string[]): void {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (entry.name.startsWith('.')) continue;
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			listEntries(fullPath, files);
		} else if (entry.isFile() && entry.name.endsWith('.ts')) {
			files.push(fullPath);
		}
	}
}

export function listTypeScriptFiles(root: string): string[] {
	const files: string[] = [];
	listEntries(root, files);
	return files;
}

export function isAnalyzablePath(file: string): boolean {
	const relativePath = path.relative(process.cwd(), file);
	return !EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(relativePath));
}
