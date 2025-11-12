import fetch from 'node-fetch';

async function checkAiaRequirements() {
  console.log('\n=== Checking AIA requirements on Gate.io ===\n');

  try {
    // Get contract info from Gate.io
    const response = await fetch('https://api.gateio.ws/api/v4/futures/usdt/contracts/AIA_USDT');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contract = await response.json();

    console.log('Contract details:');
    console.log('Symbol:', contract.name);
    console.log('\n--- SIZE REQUIREMENTS ---');
    console.log('Quanto Multiplier:', contract.quanto_multiplier);
    console.log('Minimum Order Size (contracts):', contract.order_size_min);
    console.log('Maximum Order Size (contracts):', contract.order_size_max);

    const quantoMultiplier = parseFloat(contract.quanto_multiplier || '1');
    const minContracts = parseFloat(contract.order_size_min || '1');
    const maxContracts = parseFloat(contract.order_size_max || '10000');

    console.log('\n--- CALCULATED REQUIREMENTS IN AIA ---');
    console.log('Minimum Order Quantity (AIA):', minContracts * quantoMultiplier);
    console.log('Maximum Order Quantity (AIA):', maxContracts * quantoMultiplier);
    console.log('Quantity Step (AIA):', quantoMultiplier);
    console.log('\nNOTE: All quantities must be multiples of', quantoMultiplier);

    console.log('\n--- OTHER INFO ---');
    console.log('Leverage Max:', contract.leverage_max);
    console.log('Price Round:', contract.mark_price_round);
    console.log('Order Price Round:', contract.order_price_round);

    console.log('\n=== RECOMMENDATION ===');
    console.log(`For AIA on Gate.io, use quantities that are multiples of ${quantoMultiplier}`);
    console.log(`Valid quantities: ${quantoMultiplier}, ${quantoMultiplier * 2}, ${quantoMultiplier * 3}, etc.`);
    console.log(`YOUR ATTEMPTED QUANTITY: 5 AIA - INVALID (not a multiple of ${quantoMultiplier})`);
    console.log(`MINIMUM VALID QUANTITY: ${minContracts * quantoMultiplier} AIA`);

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkAiaRequirements();
