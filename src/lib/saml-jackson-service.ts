/**
 * SAML Jackson Service
 * Provides SAML 2.0 SP and SCIM 2.0 server functionality via @boxyhq/saml-jackson
 */

import jackson, { JacksonOption } from '@boxyhq/saml-jackson';
import { logger } from './logger';

let jacksonInstance: Awaited<ReturnType<typeof jackson>> | null = null;
let initializationPromise: Promise<Awaited<ReturnType<typeof jackson>>> | null = null;

/**
 * Get or create Jackson instance (singleton)
 * Uses in-memory database for embedded mode (dev/simple deployments)
 * For production, consider using external Jackson service with dedicated DB
 */
export async function getJacksonInstance() {
  // Return existing instance if available
  if (jacksonInstance) {
    return jacksonInstance;
  }

  // If initialization in progress, wait for it
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = initializeJackson();
  jacksonInstance = await initializationPromise;
  return jacksonInstance;
}

/**
 * Initialize Jackson with configuration
 */
async function initializeJackson() {
  try {
    const externalUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const samlAudience = process.env.SAML_AUDIENCE || externalUrl;
    const samlPath = '/api/auth/saml';

    const config: JacksonOption = {
      externalUrl,
      samlAudience,
      samlPath,
      // Use in-memory DB for embedded mode (simple deployment)
      // For production, use 'redis', 'mongo', 'postgres', or 'mysql'
      db: {
        engine: 'mem' as any,
        type: 'mem' as any,
      },
      // SAML configuration
      idpEnabled: false, // We are SP-only
      clientSecretVerifier: process.env.NEXTAUTH_SECRET || 'fallback-secret',
    };

    logger.info('Initializing SAML Jackson', {
      context: 'jackson-init',
      data: {
        externalUrl,
        samlAudience,
        samlPath,
        dbEngine: 'mem',
      },
    });

    const instance = await jackson(config);

    logger.info('SAML Jackson initialized successfully', {
      context: 'jackson-init',
    });

    return instance;
  } catch (error) {
    logger.error('Failed to initialize SAML Jackson', error, {
      context: 'jackson-init',
    });
    throw new Error('Failed to initialize SAML Jackson service');
  }
}

/**
 * Get Jackson connection API controller
 */
export async function getConnectionAPIController() {
  const instance = await getJacksonInstance();
  return instance.connectionAPIController;
}

/**
 * Get Jackson OAuth controller (used for SAML flows)
 */
export async function getSAMLController() {
  const instance = await getJacksonInstance();
  return instance.oauthController;
}

/**
 * Get Jackson directory sync controller (SCIM)
 */
export async function getSCIMController() {
  const instance = await getJacksonInstance();
  return instance.directorySyncController;
}
