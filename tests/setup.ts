import { vi } from 'vitest';

// Mock fs module for file operations
vi.mock('fs', () => ({
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
  existsSync: vi.fn(() => true),
  readFileSync: vi.fn(() => Buffer.from('mock file content')),
}));

// Mock next-auth
vi.mock('next-auth', () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

// Mock @auth/prisma-adapter
vi.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(),
}));

// Create comprehensive prisma mock
const createPrismaMock = () => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  organization: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  aISystem: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  riskAssessment: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  risk: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
  riskControl: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  },
  task: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  framework: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  control: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  controlMapping: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  auditLog: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  evidence: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  evidenceVersion: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  savedFilter: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  scheduledJob: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  invitation: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  aPIKey: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  webhook: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  webhookDelivery: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  notification: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  riskScoreHistory: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  taskComment: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  reportTemplate: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  activeSession: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  iPAllowlistEntry: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  sSOConnection: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(createPrismaMock())),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $queryRaw: vi.fn(),
  $executeRaw: vi.fn(),
});

const prismaMock = createPrismaMock();

// Mock prisma client
vi.mock('@/lib/db', () => ({
  prisma: prismaMock,
  default: prismaMock,
}));

// Mock auth-helpers
vi.mock('@/lib/auth-helpers', () => ({
  getServerSession: vi.fn(),
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  hasRole: vi.fn(),
  hasMinimumRole: vi.fn(),
}));

// Mock cache-advanced to bypass caching in tests (pass-through to fetcher)
vi.mock('@/lib/cache-advanced', () => ({
  getFromCache: vi.fn(async (_key: string, fetcher: () => Promise<unknown>) => fetcher()),
  invalidateCache: vi.fn(),
  invalidateCachePattern: vi.fn(),
  warmCache: vi.fn(),
  getCacheStats: vi.fn(() => ({ memory: { size: 0, maxSize: 100 }, redis: { connected: false } })),
  clearAllCaches: vi.fn(),
}));

// Mock redis-client to prevent actual Redis connections in tests
vi.mock('@/lib/redis-client', () => ({
  isConnected: vi.fn(() => false),
  get: vi.fn(async () => null),
  set: vi.fn(async () => {}),
  del: vi.fn(async () => {}),
  incr: vi.fn(async () => 0),
  expire: vi.fn(async () => {}),
  exists: vi.fn(async () => false),
  deletePattern: vi.fn(async () => {}),
  closeConnection: vi.fn(async () => {}),
}));

// Mock logger to prevent console noise in tests
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  generateErrorId: vi.fn(() => 'ERR-TEST-00000'),
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock notification-service to prevent side effects in tests
vi.mock('@/lib/notification-service', () => ({
  createNotification: vi.fn(async () => ({})),
  getUnreadCount: vi.fn(async () => 0),
  getNotifications: vi.fn(async () => []),
  markAsRead: vi.fn(async () => ({})),
  markAllAsRead: vi.fn(async () => 0),
}));

// Mock webhook-event-dispatcher to prevent side effects in tests
vi.mock('@/lib/webhook-event-dispatcher', () => ({
  emitWebhookEvent: vi.fn(async () => {}),
}));

// Mock risk-velocity-batch-calculator
vi.mock('@/lib/risk-velocity-batch-calculator', () => ({
  calculateBatchVelocity: vi.fn(async () => new Map()),
  calculateSingleVelocity: vi.fn(async () => ({
    inherentChange: 0,
    residualChange: 0,
    trend: 'stable',
    periodDays: 0,
  })),
}));

// Mock file-virus-scanner-service
vi.mock('@/lib/file-virus-scanner-service', () => ({
  scanFile: vi.fn(async () => ({ clean: true, skipped: true })),
  isVirusScannerAvailable: vi.fn(() => false),
}));

// Mock organization-storage-quota-service
vi.mock('@/lib/organization-storage-quota-service', () => ({
  getStorageUsage: vi.fn(async () => ({
    usedBytes: 0,
    maxBytes: 5368709120,
    percentage: 0,
    fileCount: 0,
  })),
  checkQuota: vi.fn(async () => ({ allowed: true, remaining: 5368709120 })),
  updateUsage: vi.fn(async () => {}),
}));

// Mock active-session-tracker-service
vi.mock('@/lib/active-session-tracker-service', () => ({
  createSession: vi.fn(async () => 'mock-session-id-123'),
  revokeSession: vi.fn(async () => {}),
  revokeAllUserSessions: vi.fn(async () => 2),
  getActiveSessions: vi.fn(async () => ({ sessions: [], total: 0 })),
  getUserSessions: vi.fn(async () => []),
  isSessionValid: vi.fn(async () => true),
  updateLastActivity: vi.fn(async () => {}),
  cleanupExpiredSessions: vi.fn(async () => 0),
}));

// Mock ip-allowlist-checker-service
vi.mock('@/lib/ip-allowlist-checker-service', () => ({
  isIPAllowed: vi.fn(async () => true),
  isValidCIDR: vi.fn(() => true),
  invalidateAllowlistCache: vi.fn(),
}));

// Mock saml-jackson-service
vi.mock('@/lib/saml-jackson-service', () => ({
  getJacksonInstance: vi.fn(async () => ({})),
  getSAMLController: vi.fn(async () => ({
    samlResponse: vi.fn(async () => ({ email: 'test@example.com', id: 'saml-id' })),
  })),
  getSCIMController: vi.fn(async () => ({})),
  getConnectionAPIController: vi.fn(async () => ({
    createSAMLConnection: vi.fn(async () => ({})),
    getSAMLConnections: vi.fn(async () => []),
    deleteSAMLConnection: vi.fn(async () => {}),
  })),
}));

// Mock sso-jit-provisioning-service
vi.mock('@/lib/sso-jit-provisioning-service', () => ({
  jitProvisionUser: vi.fn(async () => ({
    userId: 'user-1',
    user: { email: 'test@example.com' },
    isNewUser: false,
  })),
}));

// Mock audit-log-export-csv-generator
vi.mock('@/lib/audit-log-export-csv-generator', () => ({
  generateAuditLogCSV: vi.fn(async () => Buffer.from('Date,User,Action\n2026-01-01,admin,LOGIN')),
}));

// Mock storage-service
vi.mock('@/lib/storage-service', () => ({
  uploadFile: vi.fn(async () => ({
    url: 'https://storage.example.com/test-file.pdf',
    key: 'evidence/test-file.pdf',
  })),
  validateFile: vi.fn((filename: string, size: number, mimetype: string) => ({
    valid: true,
    error: null,
  })),
  calculateSha256: vi.fn(() => 'abc123def456'),
  deleteFile: vi.fn(async () => {}),
  getFileUrl: vi.fn((key: string) => `https://storage.example.com/${key}`),
  getSignedUrl: vi.fn(async (key: string) => `https://storage.example.com/signed/${key}`),
}));

// Export mocks for use in tests
export { prismaMock };

// Suppress console errors during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});
