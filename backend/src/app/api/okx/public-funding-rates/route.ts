import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EXCHANGE_ENDPOINTS } from '@/lib/exchange-api-endpoints';

export const runtime = 'nodejs';
const CACHE_TTL_SECONDS = 30;

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

    // Step 1: Check if we have fresh data in DB
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'OKX',
        timestamp: { gte: cacheThreshold }
      }
    });

    // Step 2: If fresh data exists, return from DB
    if (cachedCount > 0) {
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'OKX',
          timestamp: { gte: cacheThreshold }
        },
        orderBy: { symbol: 'asc' },
        distinct: ['symbol']
      });

      const transformedData = {
        code: '0',
        msg: '',
        data: cachedRates.map(rate => ({
          instId: rate.symbol.replace('/', '-') + '-SWAP',
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

    // Step 3: Fetch tickers to get list of instruments and prices
    const tickersResponse = await fetch('https://www.okx.com/api/v5/market/tickers?instType=SWAP');

    if (!tickersResponse.ok) {
      throw new Error(`OKX Tickers API error: ${tickersResponse.status} ${tickersResponse.statusText}`);
    }

    const tickersData = await tickersResponse.json();

    if (tickersData.code !== '0') {
      throw new Error(`OKX Tickers API error: ${tickersData.msg || 'Unknown error'}`);
    }

    const tickers = tickersData.data || [];

    // Filter for USDT perpetual swaps and sort by 24h volume
    const usdtSwaps = tickers
      .filter((item: { instId?: string }) => item.instId && item.instId.includes('-USDT-SWAP'))
      .sort((a: { volCcy24h?: string }, b: { volCcy24h?: string }) => parseFloat(b.volCcy24h || '0') - parseFloat(a.volCcy24h || '0'))
      .slice(0, 100);

    // Step 4: Fetch funding rates in batches
    const batchSize = 20;
    const fundingRates: Array<{
      instId: string;
      fundingRate: string;
      fundingTime: string;
      nextFundingTime: string;
      last: string;
      indexPrice: string;
    }> = [];

    for (let i = 0; i < usdtSwaps.length; i += batchSize) {
      const batch = usdtSwaps.slice(i, i + batchSize);
      const batchPromises = batch.map(async (ticker: { instId: string; last: string; idxPx?: string }) => {
      try {
        const fundingResponse = await fetch(
          EXCHANGE_ENDPOINTS.OKX.FUNDING_RATE(ticker.instId)
        );

        if (!fundingResponse.ok) {
          return null;
        }

        const fundingData = await fundingResponse.json();

        if (fundingData.code !== '0' || !fundingData.data || fundingData.data.length === 0) {
          return null;
        }

        const fundingInfo = fundingData.data[0];

        return {
          instId: ticker.instId,
          fundingRate: fundingInfo.fundingRate,
          fundingTime: fundingInfo.fundingTime,
          nextFundingTime: fundingInfo.nextFundingTime,
          last: ticker.last,
          indexPrice: ticker.idxPx || '0'
        };
      } catch (error) {
        return null;
      }
      });

      const batchResults = (await Promise.all(batchPromises)).filter((item): item is NonNullable<typeof item> => item !== null);
      fundingRates.push(...batchResults);
    }

    // Step 5: Get existing intervals from DB
    const existingRates = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'OKX'
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

    // Step 6: Upsert to database
    const upsertPromises = fundingRates.map((item) => {
      const parts = item.instId.split('-');
      const base = parts[0];
      const normalizedSymbol = `${base}/USDT`;
      // OKX uses 8-hour funding interval for all USDT perpetual swaps
      const fundingInterval = intervalMap.get(normalizedSymbol) || 8;

      return prisma.publicFundingRate.upsert({
        where: {
          symbol_exchange: {
            symbol: normalizedSymbol,
            exchange: 'OKX'
          }
        },
        update: {
          fundingRate: parseFloat(item.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(item.nextFundingTime || Date.now().toString())),
          fundingInterval,
          markPrice: parseFloat(item.last || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now
        },
        create: {
          symbol: normalizedSymbol,
          exchange: 'OKX',
          fundingRate: parseFloat(item.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(item.nextFundingTime || Date.now().toString())),
          fundingInterval,
          markPrice: parseFloat(item.last || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now
        }
      });
    });

    await Promise.all(upsertPromises);

    // Step 7: Return data
    const responseData = {
      code: '0',
      msg: '',
      data: fundingRates.map((item) => {
        const parts = item.instId.split('-');
        const base = parts[0];
        const normalizedSymbol = `${base}/USDT`;
        // OKX uses 8-hour funding interval for all USDT perpetual swaps
        const fundingInterval = intervalMap.get(normalizedSymbol) || 8;

        return {
          instType: 'SWAP',
          instId: item.instId,
          last: item.last,
          fundingRate: item.fundingRate,
          nextFundingTime: item.nextFundingTime,
          fundingInterval,
          markPx: item.last,
          idxPx: item.indexPrice
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
    console.error('[OKX Public Funding Rates] Error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
