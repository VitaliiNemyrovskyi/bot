/**
 * Triangle Discovery Algorithm
 *
 * Automatically discovers all valid triangular arbitrage triangles
 * from available trading pairs on an exchange.
 */

export interface Triangle {
  symbols: [string, string, string];
  assets: {
    base: string; // Starting asset
    quote: string; // Intermediate asset
    bridge: string; // Final conversion asset
  };
}

/**
 * Triangle Discovery Service
 *
 * Discovers all valid triangular arbitrage triangles from trading pairs
 */
export class TriangleDiscovery {
  /**
   * Discover all valid triangles from available trading pairs
   *
   * Example input: ["BTCUSDT", "ETHBTC", "ETHUSDT", "BNBUSDT", "BNBBTC", "BNBETH"]
   * Example output: [
   *   { symbols: ["BTCUSDT", "ETHBTC", "ETHUSDT"], assets: {base: "USDT", quote: "BTC", bridge: "ETH"} },
   *   { symbols: ["BTCUSDT", "BNBBTC", "BNBUSDT"], assets: {base: "USDT", quote: "BTC", bridge: "BNB"} },
   *   { symbols: ["ETHUSDT", "BNBETH", "BNBUSDT"], assets: {base: "USDT", quote: "ETH", bridge: "BNB"} }
   * ]
   */
  static discoverTriangles(symbols: string[]): Triangle[] {
    const triangles: Triangle[] = [];

    // Debug: Show first 10 symbols
    console.log('[TriangleDiscovery] Sample symbols:', symbols.slice(0, 10));

    const assetPairs = this.parseSymbols(symbols);

    // Debug: Show first 10 parsed pairs
    console.log('[TriangleDiscovery] Sample parsed pairs:', assetPairs.slice(0, 10));

    // Build asset graph (adjacency list)
    const graph = new Map<string, Set<string>>();

    for (const [base, quote] of assetPairs) {
      if (!graph.has(base)) graph.set(base, new Set());
      if (!graph.has(quote)) graph.set(quote, new Set());

      graph.get(base)!.add(quote);
      graph.get(quote)!.add(base);
    }

    // Debug: Show graph structure
    console.log('[TriangleDiscovery] Graph nodes:', graph.size);
    console.log('[TriangleDiscovery] Sample graph connections:');
    let count = 0;
    for (const [node, connections] of graph.entries()) {
      if (count < 5) {
        console.log(`  ${node} -> [${Array.from(connections).join(', ')}]`);
        count++;
      }
    }

    // Find all cycles of length 3 (triangles)
    let totalTrianglesFound = 0;
    let validTrianglesFound = 0;
    let invalidTrianglesFiltered = 0;

    for (const startAsset of graph.keys()) {
      const neighbors1 = Array.from(graph.get(startAsset) || []);

      for (const asset2 of neighbors1) {
        const neighbors2 = Array.from(graph.get(asset2) || []);

        for (const asset3 of neighbors2) {
          // Check if asset3 connects back to startAsset
          if (graph.get(asset3)?.has(startAsset)) {
            // Found a triangle: startAsset → asset2 → asset3 → startAsset
            const triangle = this.buildTriangle(
              startAsset,
              asset2,
              asset3,
              symbols
            );

            if (triangle) {
              totalTrianglesFound++;
              const isValid = this.isValidTriangle(triangle);

              if (isValid && !this.isDuplicate(triangle, triangles)) {
                triangles.push(triangle);
                validTrianglesFound++;
              } else if (!isValid) {
                invalidTrianglesFiltered++;
                if (invalidTrianglesFiltered <= 3) {
                  console.log('[TriangleDiscovery] Invalid triangle filtered:', triangle.symbols);
                }
              }
            }
          }
        }
      }
    }

    console.log('[TriangleDiscovery] Triangle discovery stats:');
    console.log(`  Total triangles found: ${totalTrianglesFound}`);
    console.log(`  Valid triangles: ${validTrianglesFound}`);
    console.log(`  Invalid triangles filtered: ${invalidTrianglesFiltered}`);

    return triangles;
  }

  /**
   * Parse symbol strings into [base, quote] pairs
   * Example: "BTCUSDT" → ["BTC", "USDT"]
   */
  private static parseSymbols(symbols: string[]): [string, string][] {
    return symbols.map((symbol) => {
      // Common quote assets (order matters - longer first)
      // Added PERP for perpetual futures contracts
      const quoteAssets = ['USDT', 'USDC', 'BUSD', 'PERP', 'BTC', 'ETH', 'BNB', 'DAI', 'USD'];

      for (const quote of quoteAssets) {
        if (symbol.endsWith(quote)) {
          const base = symbol.slice(0, -quote.length);
          return [base, quote] as [string, string];
        }
      }

      // Fallback: assume last 3-4 chars are quote
      const base = symbol.slice(0, -4);
      const quote = symbol.slice(-4);
      return [base, quote] as [string, string];
    });
  }

  /**
   * Build a triangle object from 3 assets and available symbols
   */
  private static buildTriangle(
    base: string,
    quote: string,
    bridge: string,
    symbols: string[]
  ): Triangle | null {
    const symbol1 = this.findSymbol(base, quote, symbols);
    const symbol2 = this.findSymbol(quote, bridge, symbols);
    const symbol3 = this.findSymbol(bridge, base, symbols);

    if (!symbol1 || !symbol2 || !symbol3) {
      return null;
    }

    const triangle = {
      symbols: [symbol1, symbol2, symbol3],
      assets: { base, quote, bridge },
    };

    // Normalize triangle to always start with USDT if it contains USDT
    return this.normalizeTriangle(triangle, symbols);
  }

  /**
   * Normalize triangle to always start with USDT (if USDT is in the triangle)
   * This ensures consistent display: USDT → X → Y → USDT
   */
  private static normalizeTriangle(triangle: Triangle, symbols: string[]): Triangle {
    const { base, quote, bridge } = triangle.assets;

    // If USDT is already the base, no rotation needed
    if (base === 'USDT') {
      return triangle;
    }

    const originalTriangle = `${base} → ${quote} → ${bridge}`;

    // If USDT is the quote, rotate once: quote → bridge → base
    if (quote === 'USDT') {
      const newSymbol1 = this.findSymbol(quote, bridge, symbols);
      const newSymbol2 = this.findSymbol(bridge, base, symbols);
      const newSymbol3 = this.findSymbol(base, quote, symbols);

      if (newSymbol1 && newSymbol2 && newSymbol3) {
        console.log(`[TriangleDiscovery] Normalized: ${originalTriangle} → USDT → ${bridge} → ${base}`);
        return {
          symbols: [newSymbol1, newSymbol2, newSymbol3],
          assets: { base: quote, quote: bridge, bridge: base },
        };
      }
    }

    // If USDT is the bridge, rotate twice: bridge → base → quote
    if (bridge === 'USDT') {
      const newSymbol1 = this.findSymbol(bridge, base, symbols);
      const newSymbol2 = this.findSymbol(base, quote, symbols);
      const newSymbol3 = this.findSymbol(quote, bridge, symbols);

      if (newSymbol1 && newSymbol2 && newSymbol3) {
        console.log(`[TriangleDiscovery] Normalized: ${originalTriangle} → USDT → ${base} → ${quote}`);
        return {
          symbols: [newSymbol1, newSymbol2, newSymbol3],
          assets: { base: bridge, quote: base, bridge: quote },
        };
      }
    }

    // If no USDT in triangle, return as is
    return triangle;
  }

  /**
   * Validate if a triangle is tradeable
   * Ensures all three legs use the same quote asset (no mixing PERP with USDT)
   */
  private static isValidTriangle(triangle: Triangle): boolean {
    const symbols = triangle.symbols;

    // Parse all three symbols to get their quote assets
    const parsed = symbols.map(symbol => {
      const quoteAssets = ['USDT', 'USDC', 'BUSD', 'PERP', 'BTC', 'ETH', 'BNB', 'DAI', 'USD'];

      for (const quote of quoteAssets) {
        if (symbol.endsWith(quote)) {
          const base = symbol.slice(0, -quote.length);
          return { base, quote, symbol };
        }
      }

      // Fallback
      const base = symbol.slice(0, -4);
      const quote = symbol.slice(-4);
      return { base, quote, symbol };
    });

    // Check that we don't mix PERP (futures) with non-PERP (spot) markets
    // This is important because PERP and spot markets have different characteristics
    const quoteAssets = parsed.map(p => p.quote);
    const hasPerp = quoteAssets.some(q => q === 'PERP');
    const hasNonPerp = quoteAssets.some(q => q !== 'PERP');

    // Reject triangles that mix PERP and non-PERP markets
    if (hasPerp && hasNonPerp) {
      return false;
    }

    // All assets must be non-empty and at least 2 characters
    for (const p of parsed) {
      if (!p.base || !p.quote || p.base.length < 1 || p.quote.length < 2) {
        return false;
      }
    }

    return true;
  }

  /**
   * Find symbol that trades asset1/asset2
   */
  private static findSymbol(
    asset1: string,
    asset2: string,
    symbols: string[]
  ): string | null {
    // Try both combinations
    const combo1 = `${asset1}${asset2}`;
    const combo2 = `${asset2}${asset1}`;

    return symbols.find((s) => s === combo1 || s === combo2) || null;
  }

  /**
   * Check if triangle is duplicate (same assets, different order)
   */
  private static isDuplicate(
    triangle: Triangle,
    existing: Triangle[]
  ): boolean {
    const assetsSet = new Set([
      triangle.assets.base,
      triangle.assets.quote,
      triangle.assets.bridge,
    ]);

    return existing.some((t) => {
      const existingSet = new Set([
        t.assets.base,
        t.assets.quote,
        t.assets.bridge,
      ]);
      return this.areSetsEqual(assetsSet, existingSet);
    });
  }

  private static areSetsEqual<T>(set1: Set<T>, set2: Set<T>): boolean {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
      if (!set2.has(item)) return false;
    }
    return true;
  }

  /**
   * Normalize triangle to have a specific base asset
   * Rotates the symbols and assets so the specified asset becomes the base
   */
  static normalizeToBaseAsset(
    triangle: Triangle,
    desiredBase: string
  ): Triangle | null {
    const { base, quote, bridge } = triangle.assets;
    const [symbol1, symbol2, symbol3] = triangle.symbols;

    // If already correct base, return as-is
    if (base === desiredBase) {
      return triangle;
    }

    // If quote should be base, rotate once forward
    if (quote === desiredBase) {
      return {
        symbols: [symbol2, symbol3, symbol1],
        assets: {
          base: quote,
          quote: bridge,
          bridge: base,
        },
      };
    }

    // If bridge should be base, rotate once backward
    if (bridge === desiredBase) {
      return {
        symbols: [symbol3, symbol1, symbol2],
        assets: {
          base: bridge,
          quote: base,
          bridge: quote,
        },
      };
    }

    // Desired base not in this triangle
    return null;
  }

  /**
   * Filter triangles by base asset and normalize them
   * Converts all triangles to have the specified base asset
   */
  static filterAndNormalizeByBaseAsset(
    triangles: Triangle[],
    baseAsset: string
  ): Triangle[] {
    const normalized: Triangle[] = [];

    for (const triangle of triangles) {
      // Check if triangle contains the desired base asset
      const { base, quote, bridge } = triangle.assets;
      if (base === baseAsset || quote === baseAsset || bridge === baseAsset) {
        const normalizedTriangle = this.normalizeToBaseAsset(triangle, baseAsset);
        if (normalizedTriangle) {
          normalized.push(normalizedTriangle);
        }
      }
    }

    return normalized;
  }

  /**
   * Filter triangles by base asset
   * Useful for focusing on specific starting assets (e.g., USDT only)
   */
  static filterByBaseAsset(
    triangles: Triangle[],
    baseAsset: string
  ): Triangle[] {
    return triangles.filter((t) => t.assets.base === baseAsset);
  }

  /**
   * Filter triangles that include a specific asset
   */
  static filterByAsset(triangles: Triangle[], asset: string): Triangle[] {
    return triangles.filter(
      (t) =>
        t.assets.base === asset ||
        t.assets.quote === asset ||
        t.assets.bridge === asset
    );
  }

  /**
   * Get unique assets from triangles
   */
  static getUniqueAssets(triangles: Triangle[]): string[] {
    const assets = new Set<string>();

    for (const triangle of triangles) {
      assets.add(triangle.assets.base);
      assets.add(triangle.assets.quote);
      assets.add(triangle.assets.bridge);
    }

    return Array.from(assets);
  }

  /**
   * Get unique symbols from triangles
   */
  static getUniqueSymbols(triangles: Triangle[]): string[] {
    const symbols = new Set<string>();

    for (const triangle of triangles) {
      for (const symbol of triangle.symbols) {
        symbols.add(symbol);
      }
    }

    return Array.from(symbols);
  }
}
