#!/usr/bin/env node
/**
 * Build tokens from DTCG format using Style Dictionary
 *
 * Converts design-system.json (DTCG) to CSS files in src/styles/tokens/
 */

import StyleDictionary from 'style-dictionary';
import config from '../style-dictionary.config.js';

// Build all platforms
const sd = new StyleDictionary(config);
sd.buildAllPlatforms();

console.log('✅ Tokens built successfully!');
console.log('📁 Output files:');
console.log('   - src/styles/tokens/*.css');
console.log('   - src/styles/utilities/*.css');
