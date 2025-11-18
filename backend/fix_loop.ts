import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('generate-performance-charts.ts', 'utf-8');

const fixed = content.replace(
  /for \(let i = 0; i < Math\.min\(15, longResults\.length\); i\+\+\) \{\s*cumulative \+= longResults\[i\] \?\? 0;\s*const tradeNum = \(i \+ 1\)\.toString\(\)\.padStart\(7\);\s*const ret = `\$\{longResults\[i\] >= 0 \? '\+' : ''\}\$\{longResults\[i\]\.toFixed\(3\)\}%`\.padStart\(9\);\s*const cum = `\$\{cumulative >= 0 \? '\+' : ''\}\$\{cumulative\.toFixed\(3\)\}%`\.padStart\(11\);\s*console\.log\(`\$\{tradeNum\}   \$\{ret\}   \$\{cum\}`\);\s*\}/,
  `for (let i = 0; i < Math.min(15, longResults.length); i++) {
    const result = longResults[i] ?? 0;
    cumulative += result;
    const tradeNum = (i + 1).toString().padStart(7);
    const ret = \`\${result >= 0 ? '+' : ''}\${result.toFixed(3)}%\`.padStart(9);
    const cum = \`\${cumulative >= 0 ? '+' : ''}\${cumulative.toFixed(3)}%\`.padStart(11);
    console.log(\`\${tradeNum}   \${ret}   \${cum}\`);
  }`
);

writeFileSync('generate-performance-charts.ts', fixed);
