/**
 * Test MEXC funding rate fix - verify collectCycle is included
 */

async function testMEXCFix() {
  console.log('=== Testing MEXC Funding Rate Fix ===\n');

  try {
    const url = 'http://localhost:3000/api/mexc/public-funding-rates';
    console.log(`Fetching from: ${url}\n`);

    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      console.error('❌ API request failed:', data.error);
      return;
    }

    console.log(`✅ API request succeeded`);
    console.log(`Total funding rates: ${data.data.length}\n`);

    // Check for collectCycle field
    const withCollectCycle = data.data.filter((item: any) => item.collectCycle !== undefined);
    const withoutCollectCycle = data.data.filter((item: any) => item.collectCycle === undefined);

    console.log(`📊 Results:`);
    console.log(`  - With collectCycle: ${withCollectCycle.length}`);
    console.log(`  - Without collectCycle: ${withoutCollectCycle.length}\n`);

    if (withoutCollectCycle.length > 0) {
      console.log(`❌ WARNING: ${withoutCollectCycle.length} symbols missing collectCycle!`);
      console.log(`First 5 symbols without collectCycle:`);
      withoutCollectCycle.slice(0, 5).forEach((item: any) => {
        console.log(`  - ${item.symbol}`);
      });
    } else {
      console.log(`✅ All symbols have collectCycle!`);
    }

    // Show collectCycle distribution
    const collectCycleCount = new Map<number, number>();
    withCollectCycle.forEach((item: any) => {
      const count = collectCycleCount.get(item.collectCycle) || 0;
      collectCycleCount.set(item.collectCycle, count + 1);
    });

    console.log(`\n📈 CollectCycle distribution:`);
    Array.from(collectCycleCount.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([cycle, count]) => {
        console.log(`  - ${cycle}h: ${count} symbols`);
      });

    // Show sample data
    console.log(`\n📋 Sample data (first 3 symbols with collectCycle):`);
    withCollectCycle.slice(0, 3).forEach((item: any) => {
      console.log(
        `  ${item.symbol}: rate=${item.fundingRate}, collectCycle=${item.collectCycle}h`
      );
    });
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
  }
}

testMEXCFix();
