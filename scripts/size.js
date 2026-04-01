import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The directories you want to scan
const targetDirs = ['dist/esm', 'dist/cjs'];

console.log('Bundle size analysis:\n');

for (const dir of targetDirs) {
  const fullDirPath = join(__dirname, '..', dir);
  
  try {
    // Ensure it exists and is a folder
    if (!statSync(fullDirPath).isDirectory()) continue;

    console.log(`=== Scanning directory: ${dir} ===`);
    
    const files = readdirSync(fullDirPath);
    let totalRawSize = 0;
    let totalGzipSize = 0;

    for (const file of files) {
      const filePath = join(fullDirPath, file);
      
      // Only check files (skip subfolders if any exist)
      if (!statSync(filePath).isFile()) continue;

      const content = readFileSync(filePath);
      const size = content.length;
      const gzipSize = gzipSync(content).length;

      totalRawSize += size;
      totalGzipSize += gzipSize;

      // console.log(`  File: ${file}`);
      // console.log(`    Raw:  ${(size / 1024).toFixed(2)} KB`);
      // console.log(`    Gzip: ${(gzipSize / 1024).toFixed(2)} KB`);
    }

    console.log(`\n  >> Total for ${dir}:`);
    console.log(`     Raw:  ${(totalRawSize / 1024).toFixed(2)} KB`);
    console.log(`     Gzip: ${(totalGzipSize / 1024).toFixed(2)} KB\n`);

  } catch (e) {
    console.log(`Directory ${dir} not found or inaccessible.\n`);
  }
}
