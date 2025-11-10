import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
const CACHE_TTL_SECONDS = 30;

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

    // Step 1: Check if we have fresh data in DB
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'KUCOIN',
        timestamp: { gte: cacheThreshold }
      }
    });

    // Step 2: If fresh data exists, return from DB
    if (cachedCount > 0) {
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'KUCOIN',
          timestamp: { gte: cacheThreshold }
        },
        orderBy: { symbol: 'asc' },
        distinct: ['symbol']
      });

      const transformedData = {
        code: '0',
        msg: '',
        data: cachedRates.map(rate => ({
          symbol: rate.symbol.replace('/', ''), // Normalize: BTC/USDT -> BTCUSDT
          last: rate.markPrice?.toString() || '0',
          fundingRate: rate.fundingRate.toString(),
          nextFundingTime: rate.nextFundingTime.getTime().toString(),
          fundingInterval: rate.fundingInterval,
          markPx: rate.markPrice?.toString() || '0',
          idxPx: rate.indexPrice?.toString() || '0'
        }))
      };

      return NextResponse.json(transformedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'database-cache'
        }
      });
    }

    // Step 3: Fetch all active contracts from KuCoin
    let contractsResponse;
    try {
      contractsResponse = await fetch('https://api-futures.kucoin.com/api/v1/contracts/active', {
        signal: AbortSignal.timeout(10000), // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[KuCoin Public Funding Rates] Contracts fetch failed:', errorMessage);
      throw new Error(`KuCoin API connection failed: ${errorMessage}`);
    }

    if (!contractsResponse.ok) {
      throw new Error(`KuCoin Contracts API error: ${contractsResponse.status} ${contractsResponse.statusText}`);
    }

    const contractsData = await contractsResponse.json();

    if (contractsData.code !== '200000') {
      throw new Error(`KuCoin Contracts API error: ${contractsData.msg || 'Unknown error'}`);
    }

    const contracts = contractsData.data || [];

    // Filter for USDT perpetual swaps (USDTM suffix)
    const usdtContracts = contracts
      .filter((item: { symbol?: string, status?: string }) =>
        item.symbol &&
        item.symbol.endsWith('USDTM') &&
        item.status === 'Open'
      )
      .sort((a: { turnoverOf24h?: number }, b: { turnoverOf24h?: number }) =>
        (b.turnoverOf24h || 0) - (a.turnoverOf24h || 0)
      );

    console.log(`[KuCoin Public Funding Rates] Found ${usdtContracts.length} USDTM contracts`);

    // Step 4: Get existing intervals from DB
    const existingRates = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'KUCOIN'
      },
      select: {
        symbol: true,
        fundingInterval: true
      }
    });

    const intervalMap = new Map<string, number>();
    for (const rate of existingRates) {
      intervalMap.set(rate.symbol, rate.fundingInterval);
    }

    // Step 5: Upsert to database
    const upsertPromises = usdtContracts.map((contract: any) => {
      // Convert symbol: XBTUSDTM -> BTC/USDT, ETHUSDTM -> ETH/USDT
      const symbolWithoutSuffix = contract.symbol.replace('USDTM', '');
      const base = symbolWithoutSuffix === 'XBT' ? 'BTC' : symbolWithoutSuffix;
      const normalizedSymbol = `${base}/USDT`;

      // Parse funding interval from milliseconds to hours
      const intervalMs = parseInt(contract.fundingRateGranularity || '28800000');
      const fundingInterval = intervalMap.get(normalizedSymbol) || (intervalMs / 3600000);

      return prisma.publicFundingRate.upsert({
        where: {
          symbol_exchange: {
            symbol: normalizedSymbol,
            exchange: 'KUCOIN'
          }
        },
        update: {
          fundingRate: parseFloat(contract.fundingFeeRate || '0'),
          nextFundingTime: new Date(parseInt(contract.nextFundingRateTime || Date.now().toString())),
          fundingInterval,
          markPrice: parseFloat(contract.markPrice || '0'),
          indexPrice: parseFloat(contract.indexPrice || '0'),
          timestamp: now
        },
        create: {
          symbol: normalizedSymbol,
          exchange: 'KUCOIN',
          fundingRate: parseFloat(contract.fundingFeeRate || '0'),
          nextFundingTime: new Date(parseInt(contract.nextFundingRateTime || Date.now().toString())),
          fundingInterval,
          markPrice: parseFloat(contract.markPrice || '0'),
          indexPrice: parseFloat(contract.indexPrice || '0'),
          timestamp: now
        }
      });
    });

    await Promise.all(upsertPromises);

    console.log(`[KuCoin Public Funding Rates] Successfully saved ${usdtContracts.length} funding rates`);

    // Step 6: Return data in unified format
    const responseData = {
      code: '0',
      msg: '',
      data: usdtContracts.map((contract: any) => {
        // Convert symbol: XBTUSDTM -> BTC/USDT, ETHUSDTM -> ETH/USDT
        const symbolWithoutSuffix = contract.symbol.replace('USDTM', '');
        const base = symbolWithoutSuffix === 'XBT' ? 'BTC' : symbolWithoutSuffix;
        const normalizedSymbol = `${base}/USDT`;

        // Parse funding interval from milliseconds to hours
        const intervalMs = parseInt(contract.fundingRateGranularity || '28800000');
        const fundingInterval = intervalMap.get(normalizedSymbol) || (intervalMs / 3600000);

        return {
          symbol: `${base}USDT`, // Normalize: XBTUSDTM -> BTCUSDT
          last: contract.markPrice || '0',
          fundingRate: contract.fundingFeeRate || '0',
          nextFundingTime: contract.nextFundingRateTime || Date.now().toString(),
          fundingInterval,
          markPx: contract.markPrice || '0',
          idxPx: contract.indexPrice || '0'
        };
      })
    };

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api-fresh'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[KuCoin Public Funding Rates] Error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
