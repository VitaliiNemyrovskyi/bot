const { execSync } = require('child_process');

try {
  const output = execSync('npm run lint 2>&1', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, stdio: 'pipe' });
  const lines = output.split('\n');

  const fileCounts = {};
  let currentFile = null;

  for (const line of lines) {
    // File path lines start with drive letter (C:) or absolute path
    if (line.match(/^[A-Z]:[\\\/]/) || line.match(/^\/[a-z]/)) {
      currentFile = line.trim();
      if (!fileCounts[currentFile]) {
        fileCounts[currentFile] = 0;
      }
    }
    // Error lines have format: "  123:45  error  message"
    else if (currentFile && line.match(/^\s+\d+:\d+\s+error/)) {
      fileCounts[currentFile]++;
    }
  }

  // Sort by count descending
  const sorted = Object.entries(fileCounts)
    .filter(([file, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  console.log('Top 30 files with most ESLint errors:\n');
  sorted.slice(0, 30).forEach(([file, count]) => {
    const shortPath = file.replace(/.*frontend[\\\/]src[\\\/]/, '');
    console.log(`  ${count.toString().padStart(4)} - ${shortPath}`);
  });

  console.log(`\nTotal files with errors: ${sorted.length}`);
  console.log(`Total errors: ${Object.values(fileCounts).reduce((a, b) => a + b, 0)}`);

} catch (error) {
  // npm run lint exits with code 1 when there are errors, so we handle it
  if (error.stdout) {
    const output = error.stdout.toString();
    const lines = output.split('\n');

    const fileCounts = {};
    let currentFile = null;

    for (const line of lines) {
      // File path lines start with drive letter (C:) or absolute path
      if (line.match(/^[A-Z]:[\\\/]/) || line.match(/^\/[a-z]/)) {
        currentFile = line.trim();
        if (!fileCounts[currentFile]) {
          fileCounts[currentFile] = 0;
        }
      }
      // Error lines have format: "  123:45  error  message"
      else if (currentFile && line.match(/^\s+\d+:\d+\s+error/)) {
        fileCounts[currentFile]++;
      }
    }

    // Sort by count descending
    const sorted = Object.entries(fileCounts)
      .filter(([file, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    console.log('Top 30 files with most ESLint errors:\n');
    sorted.slice(0, 30).forEach(([file, count]) => {
      const shortPath = file.replace(/.*frontend[\\\/]src[\\\/]/, '');
      console.log(`  ${count.toString().padStart(4)} - ${shortPath}`);
    });

    console.log(`\nTotal files with errors: ${sorted.length}`);
    console.log(`Total errors: ${Object.values(fileCounts).reduce((a, b) => a + b, 0)}`);
  } else {
    console.error('Error running analysis:', error.message);
  }
}
