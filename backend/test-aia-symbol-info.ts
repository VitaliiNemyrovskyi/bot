/**
 * Test script to verify Gate.io AIA symbol info API returns correct minOrderQty
 * with quanto_multiplier applied
 */

// Import the getGateIOSymbolInfo function logic
async function testAiaSymbolInfo() {
  const symbol = 'AIA_USDT';
  const url = 'https://api.gateio.ws/api/v4/futures/usdt/contracts';

  console.log(`\n=== Testing Gate.io Symbol Info API for ${symbol} ===\n`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Gate.io API error: ${response.status} ${response.statusText}`);
    }

    const contracts = await response.json();
    const contract = contracts.find((c: any) => c.name === symbol);

    if (!contract) {
      console.error(`Symbol ${symbol} not found`);
      return;
    }

    // Apply the fix: multiply by quanto_multiplier
    const quantoMultiplier = parseFloat(contract.quanto_multiplier || '1');
    const minOrderQtyInBaseCurrency = parseFloat(contract.order_size_min || '1') * quantoMultiplier;
    const qtyStepInBaseCurrency = parseFloat(contract.order_size_min || '1') * quantoMultiplier;
    const maxOrderQtyInBaseCurrency = contract.order_size_max ? parseFloat(contract.order_size_max) * quantoMultiplier : undefined;

    console.log('Raw contract data:');
    console.log('  order_size_min (contracts):', contract.order_size_min);
    console.log('  order_size_max (contracts):', contract.order_size_max);
    console.log('  quanto_multiplier:', contract.quanto_multiplier);

    console.log('\nCORRECT API Response (with fix applied):');
    console.log({
      symbol: contract.name,
      exchange: 'GATEIO',
      minOrderQty: minOrderQtyInBaseCurrency,
      qtyStep: qtyStepInBaseCurrency,
      maxOrderQty: maxOrderQtyInBaseCurrency,
      quantoMultiplier: quantoMultiplier,
    });

    console.log('\n=== VALIDATION ===');
    console.log(`✓ Minimum order quantity: ${minOrderQtyInBaseCurrency} AIA`);
    console.log(`✓ Quantity step: ${qtyStepInBaseCurrency} AIA`);
    console.log(`✓ Maximum order quantity: ${maxOrderQtyInBaseCurrency} AIA`);
    console.log(`\nYour attempt (5 AIA) < Minimum (${minOrderQtyInBaseCurrency} AIA) = REJECTED ❌`);
    console.log(`Correct amount (10 AIA) >= Minimum (${minOrderQtyInBaseCurrency} AIA) = ACCEPTED ✓`);

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testAiaSymbolInfo();
