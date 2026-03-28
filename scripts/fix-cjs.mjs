import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const distDir = join(process.cwd(), 'dist', 'cjs');

function fixCjsDir(dir) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixCjsDir(fullPath);
    } else if (entry.endsWith('.js')) {
      let content = readFileSync(fullPath, 'utf-8');
      
      // Add path module import if not present
      if (!content.includes("require('path')")) {
        const pathImport = "const path = require('path');\n";
        content = pathImport + content;
      }
      
      // Calculate __dirname based on relative path
      const relFromCjs = relative(join(process.cwd(), 'dist', 'cjs'), dir);
      const depth = (relFromCjs.match(/\.\.\//g) || []).length;
      const dirPolyfill = `const __dirname = path.join(__dirname${depth > 0 ? `, '${'../'.repeat(depth)}'` : ''});\n`;
      
      if (!content.includes('const __dirname = path.join(__dirname')) {
        content = content.replace(
          /const __dirname = .*?;\n/,
          dirPolyfill
        );
      }
      
      writeFileSync(fullPath, content);
    }
  }
}

fixCjsDir(distDir);
console.log('Fixed CommonJS output');
