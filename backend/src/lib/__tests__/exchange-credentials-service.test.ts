import { ExchangeCredentialsService } from '../exchange-credentials-service';
import { ExchangeValidators } from '../exchange-validators';
import { EncryptionService } from '../encryption';
import prisma from '../prisma';
import { Exchange, Environment } from '@prisma/client';

// Mock dependencies
jest.mock('../prisma', () => ({
  __esModule: true,
  default: {
    exchangeCredentials: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../exchange-validators');
jest.mock('../encryption');

describe('ExchangeCredentialsService', () => {
  const mockUserId = 'user_123';
  const mockApiKey = 'test_api_key';
  const mockApiSecret = 'test_api_secret';
  const mockEncryptedApiKey = 'encrypted_api_key';
  const mockEncryptedApiSecret = 'encrypted_api_secret';

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (EncryptionService.encrypt as jest.Mock).mockImplementation((value: string) => {
      if (value === mockApiKey) return mockEncryptedApiKey;
      if (value === mockApiSecret) return mockEncryptedApiSecret;
      return `encrypted_${value}`;
    });

    (EncryptionService.decrypt as jest.Mock).mockImplementation((value: string) => {
      if (value === mockEncryptedApiKey) return mockApiKey;
      if (value === mockEncryptedApiSecret) return mockApiSecret;
      return value.replace('encrypted_', '');
    });

    (ExchangeValidators.validateCredentials as jest.Mock).mockResolvedValue({
      valid: true,
    });
  });

  describe('saveCredentials - isActive functionality', () => {
    it('should set isActive to true when explicitly provided', async () => {
      // Arrange
      const credentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        label: 'Test Credential',
        isActive: true, // Explicitly set to true
      };

      const mockCreatedCredential = {
        id: 'cred_123',
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey,
        apiSecret: mockEncryptedApiSecret,
        label: 'Test Credential',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.exchangeCredentials.findMany as jest.Mock).mockResolvedValue([
        { id: 'existing_cred', exchange: Exchange.BYBIT },
      ]);
      (prisma.exchangeCredentials.create as jest.Mock).mockResolvedValue(mockCreatedCredential);

      // Act
      const result = await ExchangeCredentialsService.saveCredentials(mockUserId, credentialData);

      // Assert
      expect(prisma.exchangeCredentials.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: true,
        }),
      });
      expect(result.isActive).toBe(true);
    });

    it('should set isActive to false when explicitly provided as false', async () => {
      // Arrange
      const credentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        label: 'Test Credential',
        isActive: false, // Explicitly set to false
      };

      const mockCreatedCredential = {
        id: 'cred_123',
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey,
        apiSecret: mockEncryptedApiSecret,
        label: 'Test Credential',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.exchangeCredentials.create as jest.Mock).mockResolvedValue(mockCreatedCredential);

      // Act
      const result = await ExchangeCredentialsService.saveCredentials(mockUserId, credentialData);

      // Assert
      expect(prisma.exchangeCredentials.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: false,
        }),
      });
      expect(result.isActive).toBe(false);
    });

    it('should set isActive to true for first credential when isActive not provided', async () => {
      // Arrange
      const credentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        label: 'First Credential',
        // isActive not provided
      };

      const mockCreatedCredential = {
        id: 'cred_123',
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey,
        apiSecret: mockEncryptedApiSecret,
        label: 'First Credential',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // No existing credentials for this exchange
      (prisma.exchangeCredentials.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.exchangeCredentials.create as jest.Mock).mockResolvedValue(mockCreatedCredential);

      // Act
      const result = await ExchangeCredentialsService.saveCredentials(mockUserId, credentialData);

      // Assert
      expect(prisma.exchangeCredentials.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          exchange: Exchange.BYBIT,
        },
      });
      expect(prisma.exchangeCredentials.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: true,
        }),
      });
      expect(result.isActive).toBe(true);
    });

    it('should set isActive to false for subsequent credentials when isActive not provided', async () => {
      // Arrange
      const credentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        label: 'Second Credential',
        // isActive not provided
      };

      const mockCreatedCredential = {
        id: 'cred_124',
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey,
        apiSecret: mockEncryptedApiSecret,
        label: 'Second Credential',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Existing credential for this exchange
      (prisma.exchangeCredentials.findMany as jest.Mock).mockResolvedValue([
        { id: 'cred_123', exchange: Exchange.BYBIT, isActive: true },
      ]);
      (prisma.exchangeCredentials.create as jest.Mock).mockResolvedValue(mockCreatedCredential);

      // Act
      const result = await ExchangeCredentialsService.saveCredentials(mockUserId, credentialData);

      // Assert
      expect(prisma.exchangeCredentials.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: false,
        }),
      });
      expect(result.isActive).toBe(false);
    });

    it('should allow multiple active credentials for same exchange', async () => {
      // Arrange - Create first credential with isActive: true
      const firstCredentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockApiKey + '1',
        apiSecret: mockApiSecret + '1',
        isActive: true,
      };

      const mockFirstCredential = {
        id: 'cred_123',
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey + '1',
        apiSecret: mockEncryptedApiSecret + '1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.exchangeCredentials.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.exchangeCredentials.create as jest.Mock).mockResolvedValue(mockFirstCredential);

      await ExchangeCredentialsService.saveCredentials(mockUserId, firstCredentialData);

      // Arrange - Create second credential with isActive: true
      const secondCredentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockApiKey + '2',
        apiSecret: mockApiSecret + '2',
        isActive: true, // Explicitly set second one as active
      };

      const mockSecondCredential = {
        id: 'cred_124',
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey + '2',
        apiSecret: mockEncryptedApiSecret + '2',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.exchangeCredentials.findMany as jest.Mock).mockResolvedValue([mockFirstCredential]);
      (prisma.exchangeCredentials.create as jest.Mock).mockResolvedValue(mockSecondCredential);

      // Act
      const result = await ExchangeCredentialsService.saveCredentials(mockUserId, secondCredentialData);

      // Assert - Both should be active (no automatic deactivation)
      expect(prisma.exchangeCredentials.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isActive: true,
        }),
      });
      expect(result.isActive).toBe(true);
      // Verify no updateMany call was made to deactivate other credentials
      expect(prisma.exchangeCredentials.updateMany).not.toHaveBeenCalled();
    });

    it('should validate credentials before saving', async () => {
      // Arrange
      const credentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.MAINNET,
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        isActive: true,
      };

      (ExchangeValidators.validateCredentials as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid API credentials',
      });

      // Act & Assert
      await expect(
        ExchangeCredentialsService.saveCredentials(mockUserId, credentialData)
      ).rejects.toThrow('Invalid API credentials');

      expect(ExchangeValidators.validateCredentials).toHaveBeenCalledWith(
        Exchange.BYBIT,
        Environment.MAINNET,
        mockApiKey,
        mockApiSecret
      );
      expect(prisma.exchangeCredentials.create).not.toHaveBeenCalled();
    });

    it('should encrypt API keys before saving', async () => {
      // Arrange
      const credentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        isActive: true,
      };

      const mockCreatedCredential = {
        id: 'cred_123',
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey,
        apiSecret: mockEncryptedApiSecret,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.exchangeCredentials.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.exchangeCredentials.create as jest.Mock).mockResolvedValue(mockCreatedCredential);

      // Act
      await ExchangeCredentialsService.saveCredentials(mockUserId, credentialData);

      // Assert
      expect(EncryptionService.encrypt).toHaveBeenCalledWith(mockApiKey);
      expect(EncryptionService.encrypt).toHaveBeenCalledWith(mockApiSecret);
      expect(prisma.exchangeCredentials.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          apiKey: mockEncryptedApiKey,
          apiSecret: mockEncryptedApiSecret,
        }),
      });
    });

    it('should allow multiple credentials for same exchange and environment', async () => {
      // This test verifies the database schema allows multiple credentials
      // Previously would fail with unique constraint error

      const credentialData = {
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockApiKey,
        apiSecret: mockApiSecret,
        isActive: false,
      };

      const mockCreatedCredential = {
        id: 'cred_125',
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey,
        apiSecret: mockEncryptedApiSecret,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.exchangeCredentials.findMany as jest.Mock).mockResolvedValue([
        { id: 'cred_123', exchange: Exchange.BYBIT, environment: Environment.TESTNET },
        { id: 'cred_124', exchange: Exchange.BYBIT, environment: Environment.TESTNET },
      ]);
      (prisma.exchangeCredentials.create as jest.Mock).mockResolvedValue(mockCreatedCredential);

      // Act - Should not throw unique constraint error
      const result = await ExchangeCredentialsService.saveCredentials(mockUserId, credentialData);

      // Assert
      expect(result).toBeDefined();
      expect(result.exchange).toBe(Exchange.BYBIT);
      expect(result.environment).toBe(Environment.TESTNET);
    });
  });

  describe('updateCredential - isActive functionality', () => {
    it('should update isActive flag when provided', async () => {
      const credentialId = 'cred_123';
      const mockExistingCredential = {
        id: credentialId,
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey,
        apiSecret: mockEncryptedApiSecret,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedCredential = {
        ...mockExistingCredential,
        isActive: true,
      };

      (prisma.exchangeCredentials.findUnique as jest.Mock).mockResolvedValue(mockExistingCredential);
      (prisma.exchangeCredentials.update as jest.Mock).mockResolvedValue(mockUpdatedCredential);

      // Act
      const result = await ExchangeCredentialsService.updateCredential(
        mockUserId,
        credentialId,
        { isActive: true }
      );

      // Assert
      expect(prisma.exchangeCredentials.update).toHaveBeenCalledWith({
        where: { id: credentialId },
        data: expect.objectContaining({
          isActive: true,
        }),
      });
      expect(result.isActive).toBe(true);
    });

    it('should not deactivate other credentials when setting isActive to true', async () => {
      const credentialId = 'cred_123';
      const mockExistingCredential = {
        id: credentialId,
        userId: mockUserId,
        exchange: Exchange.BYBIT,
        environment: Environment.TESTNET,
        apiKey: mockEncryptedApiKey,
        apiSecret: mockEncryptedApiSecret,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedCredential = {
        ...mockExistingCredential,
        isActive: true,
      };

      (prisma.exchangeCredentials.findUnique as jest.Mock).mockResolvedValue(mockExistingCredential);
      (prisma.exchangeCredentials.update as jest.Mock).mockResolvedValue(mockUpdatedCredential);

      // Act
      await ExchangeCredentialsService.updateCredential(
        mockUserId,
        credentialId,
        { isActive: true }
      );

      // Assert - No updateMany or transaction should be called
      expect(prisma.exchangeCredentials.updateMany).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
