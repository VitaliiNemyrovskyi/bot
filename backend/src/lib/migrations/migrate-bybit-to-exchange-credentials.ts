import prisma from '../prisma';
import { Exchange, Environment } from '@prisma/client';

/**
 * Migration Script: Bybit API Keys to Exchange Credentials
 *
 * This script migrates existing bybit_api_keys records to the new
 * exchange_credentials table structure.
 *
 * Run this script once after deploying the new schema.
 *
 * Usage:
 *   npx ts-node src/lib/migrations/migrate-bybit-to-exchange-credentials.ts
 */

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: string[];
}

async function migrateBybitApiKeys(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  };

  console.log('Starting migration of Bybit API keys to Exchange Credentials...\n');

  try {
    // Fetch all existing Bybit API keys
    const bybitApiKeys = await prisma.bybitApiKey.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    console.log(`Found ${bybitApiKeys.length} Bybit API key records to migrate\n`);

    for (const bybitKey of bybitApiKeys) {
      try {
        const environment = bybitKey.testnet ? Environment.TESTNET : Environment.MAINNET;

        // Check if this credential already exists
        const existing = await prisma.exchangeCredentials.findUnique({
          where: {
            userId_exchange_environment: {
              userId: bybitKey.userId,
              exchange: Exchange.BYBIT,
              environment: environment,
            },
          },
        });

        if (existing) {
          console.log(`⏭️  Skipping user ${bybitKey.user.email} - credential already exists`);
          result.skippedCount++;
          continue;
        }

        // Create new ExchangeCredentials record
        await prisma.exchangeCredentials.create({
          data: {
            userId: bybitKey.userId,
            exchange: Exchange.BYBIT,
            environment: environment,
            apiKey: bybitKey.apiKey, // Already encrypted
            apiSecret: bybitKey.apiSecret, // Already encrypted
            label: `Bybit ${environment} (Migrated)`,
            isActive: true, // Set as active since it was the only one
            createdAt: bybitKey.createdAt,
            updatedAt: bybitKey.updatedAt,
          },
        });

        console.log(`✅ Migrated credentials for user ${bybitKey.user.email} (${environment})`);
        result.migratedCount++;
      } catch (error: any) {
        const errorMsg = `Failed to migrate user ${bybitKey.user.email}: ${error.message}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
        result.success = false;
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total records found: ${bybitApiKeys.length}`);
    console.log(`Successfully migrated: ${result.migratedCount}`);
    console.log(`Skipped (already exists): ${result.skippedCount}`);
    console.log(`Errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\nErrors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    console.log('\n⚠️  Note: The old bybit_api_keys table has been preserved for backward compatibility.');
    console.log('You can safely delete it after verifying the migration was successful.\n');

    return result;
  } catch (error: any) {
    console.error('Migration failed:', error);
    result.success = false;
    result.errors.push(error.message);
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateBybitApiKeys()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { migrateBybitApiKeys };
