/**
 * Test if auto-recorder can be imported and initialized
 */

async function testAutoRecorder() {
  console.log('🧪 Testing auto-recorder import and initialization...\n');

  try {
    // Try to import the auto-recorder module
    console.log('1. Importing auto-recorder module...');
    const autoRecorderModule = await import('./src/scripts/auto-record-funding-data');
    console.log('   ✅ Module imported successfully');

    // Check if autoRecorder instance exists
    console.log('\n2. Checking autoRecorder instance...');
    const autoRecorder = autoRecorderModule.autoRecorder;

    if (!autoRecorder) {
      console.log('   ❌ autoRecorder instance is undefined');
      process.exit(1);
    }
    console.log('   ✅ autoRecorder instance exists');

    // Check if start method exists
    console.log('\n3. Checking start() method...');
    if (typeof autoRecorder.start !== 'function') {
      console.log('   ❌ start() method not found');
      process.exit(1);
    }
    console.log('   ✅ start() method exists');

    // Check if stop method exists
    console.log('\n4. Checking stop() method...');
    if (typeof autoRecorder.stop !== 'function') {
      console.log('   ❌ stop() method not found');
      process.exit(1);
    }
    console.log('   ✅ stop() method exists');

    console.log('\n✅ All checks passed! Auto-recorder can be imported and used.');
    console.log('\n📝 Note: Not actually starting the recorder to avoid scheduling recordings.');
    console.log('   The recorder will be started automatically when backend server starts.');

  } catch (error: any) {
    console.error('\n❌ Error testing auto-recorder:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

testAutoRecorder();
