import { compress } from 'bun';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const files = [
  'dist/esm/index.js',
  'dist/esm/react/index.js'
];

console.log('Bundle size analysis:\n');

for (const file of files) {
  try {
    const content = readFileSync(join(__dirname, '..', file));
    const size = content.length;
    const gzipSize = compress(content).length;
    
    console.log(`${file}:`);
    console.log(`  Raw:  ${(size / 1024).toFixed(2)} KB`);
    console.log(`  Gzip: ${(gzipSize / 1024).toFixed(2)} KB`);
  } catch (e) {
    console.log(`${file}: not found`);
  }
}
