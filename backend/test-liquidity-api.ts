/**
 * Test script to verify liquidity data is returned for BINANCE opportunities
 */

async function testLiquidityAPI() {
  console.log('\n🧪 Testing Liquidity API Fix\n');
  console.log('═'.repeat(80));

  try {
    const response = await fetch('http://localhost:3001/api/funding-rates/opportunities?limit=10', {
      headers: {
        'Authorization': 'Bearer test',
        'Cookie': 'auth-token=test'
      }
    });

    const data = await response.json();

    console.log(`\nAPI Response Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Total Opportunities: ${data.count || data.data?.length || 0}\n`);

    if (data.data && data.data.length > 0) {
      console.log('═'.repeat(80));
      console.log('\n📊 Checking Liquidity Data:\n');

      let bybitWithLiquidity = 0;
      let bybitWithoutLiquidity = 0;
      let binanceWithLiquidity = 0;
      let binanceWithoutLiquidity = 0;

      data.data.forEach((opp: any, index: number) => {
        const hasLiquidity = opp.liquidityScore !== undefined && opp.liquidityScore !== null;

        if (opp.exchange === 'BYBIT') {
          if (hasLiquidity) bybitWithLiquidity++;
          else bybitWithoutLiquidity++;
        } else if (opp.exchange === 'BINANCE') {
          if (hasLiquidity) binanceWithLiquidity++;
          else binanceWithoutLiquidity++;
        }

        if (index < 5) {
          console.log(`${index + 1}. ${opp.exchange.padEnd(10)} ${opp.symbol.padEnd(15)}`);
          console.log(`   Funding Rate: ${(opp.fundingRate * 100).toFixed(4)}%`);
          if (hasLiquidity) {
            console.log(`   ✅ Liquidity Score: ${opp.liquidityScore.toFixed(4)}`);
            console.log(`   ✅ Est. Drop: ${opp.estimatedPriceDropPercent.toFixed(2)}%`);
            console.log(`   ✅ Net Return: ${opp.expectedNetReturnPercent > 0 ? '+' : ''}${opp.expectedNetReturnPercent.toFixed(2)}%`);
            console.log(`   ✅ Risk Level: ${opp.riskLevel}`);
          } else {
            console.log(`   ❌ NO LIQUIDITY DATA`);
          }
          console.log('');
        }
      });

      console.log('═'.repeat(80));
      console.log('\n📈 SUMMARY:\n');
      console.log(`BYBIT:`);
      console.log(`  ✅ With Liquidity: ${bybitWithLiquidity}`);
      console.log(`  ❌ Without Liquidity: ${bybitWithoutLiquidity}\n`);
      console.log(`BINANCE:`);
      console.log(`  ✅ With Liquidity: ${binanceWithLiquidity}`);
      console.log(`  ❌ Without Liquidity: ${binanceWithoutLiquidity}\n`);

      if (binanceWithLiquidity > 0) {
        console.log('🎉 SUCCESS! BINANCE now has liquidity data!');
      } else if (binanceWithoutLiquidity > 0) {
        console.log('⚠️  WARNING: BINANCE opportunities found but NO liquidity data');
      } else {
        console.log('ℹ️  No BINANCE opportunities in the top 10');
      }

    } else {
      console.log('⚠️  No opportunities found');
    }

    console.log('\n' + '═'.repeat(80) + '\n');

  } catch (error: any) {
    console.error('❌ Error testing API:', error.message);
  }
}

testLiquidityAPI().catch(console.error);
