const fs = require('fs');
const path = require('path');

// Icon mapping: our name → Material Symbols name
const iconMapping = {
  'refresh': 'refresh-fill.svg',
  'schedule': 'schedule-fill.svg',
  'clear': 'cancel-fill.svg', // Using cancel icon for clear (X in circle)
  'close': 'close-fill.svg',
  'error': 'error-fill.svg',
  'info': 'info-fill.svg',
  'alert-circle': 'error-fill.svg', // Using error icon for alert
  'plus': 'add-fill.svg',
  'chevron-down': 'arrow_drop_down-fill.svg', // Using arrow_drop_down for chevron
  'arrow_upward': 'arrow_upward-fill.svg',
  'arrow_downward': 'arrow_downward-fill.svg',
  'edit': 'edit-fill.svg',
  'trash': 'delete-fill.svg',
  'logout': 'logout-fill.svg',
  'play_arrow': 'play_arrow-fill.svg',
  'filter': 'filter_list-fill.svg',
  'check_circle': 'check_circle-fill.svg',
  'done_all': 'done_all-fill.svg',
  'clear_all': 'clear_all-fill.svg',
  'show_chart': 'show_chart-fill.svg',
  'trending_up': 'trending_up-fill.svg',
  'trending_down': 'trending_down-fill.svg',
  'chart': 'bar_chart-fill.svg',
  'analytics': 'analytics-fill.svg',
  'settings': 'settings-fill.svg',
  'tune': 'tune-fill.svg',
  'user': 'person-fill.svg',
  'eye': 'visibility-fill.svg',
  'eye-off': 'visibility_off-fill.svg',
  'lock': 'lock-fill.svg',
  'list': 'list-fill.svg',
  'clipboard': 'content_paste-fill.svg',
  'spinner': 'progress_activity-fill.svg', // Using progress_activity for loading spinner
  'swap_horiz': 'swap_horiz-fill.svg'
};

const sourceDir = path.join(__dirname, 'node_modules', '@material-symbols', 'svg-400', 'outlined');
const targetDir = path.join(__dirname, 'src', 'assets', 'icons');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

let copied = 0;
let missing = [];

console.log('Copying Material Symbols icons...\n');

Object.entries(iconMapping).forEach(([ourName, materialName]) => {
  const sourcePath = path.join(sourceDir, materialName);
  const targetPath = path.join(targetDir, `${ourName}.svg`);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✓ ${ourName}.svg ← ${materialName}`);
    copied++;
  } else {
    console.error(`✗ Missing: ${materialName} (for ${ourName})`);
    missing.push({ ourName, materialName });
  }
});

console.log(`\n========================================`);
console.log(`✓ Successfully copied: ${copied}/34 icons`);
if (missing.length > 0) {
  console.log(`✗ Missing icons: ${missing.length}`);
  console.log('\nMissing icons:');
  missing.forEach(({ ourName, materialName }) => {
    console.log(`  - ${ourName} (expected: ${materialName})`);
  });
} else {
  console.log('✓ All icons copied successfully!');
}
console.log(`========================================`);