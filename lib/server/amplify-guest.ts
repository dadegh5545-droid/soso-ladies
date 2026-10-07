/**
 * Server-side Amplify context for visitors (guest, Cognito identity pool).
 *
 * The page server reads the public catalog and SiteSettings exactly as a
 * visitor would: unauthenticated identity-pool credentials, never an admin
 * role. The guest identity and its credentials are kept in this process's
 * memory, so one identity is reused across requests and no cookie is set.
 */
import {
  createAWSCredentialsAndIdentityIdProvider,
  createKeyValueStorageFromCookieStorageAdapter,
  createUserPoolsTokenProvider,
  runWithAmplifyServerContext,
  type AmplifyServer,
} from 'aws-amplify/adapter-core';
import { generateClient } from 'aws-amplify/data/server';
import { parseAmplifyConfig } from 'aws-amplify/utils';
import outputs from '@/amplify_outputs.json';
import type { Schema } from '@/amplify/data/resource';

const config = parseAmplifyConfig(outputs);
const authConfig = config.Auth;
if (!authConfig) {
  throw new Error('amplify_outputs.json has no auth section');
}

const memory = new Map<string, string>();
const storage = createKeyValueStorageFromCookieStorageAdapter({
  get: (name) => (memory.has(name) ? { name, value: memory.get(name) as string } : undefined),
  getAll: () => Array.from(memory, ([name, value]) => ({ name, value })),
  set: (name, value) => {
    memory.set(name, value);
  },
  delete: (name) => {
    memory.delete(name);
  },
});

const libraryOptions = {
  Auth: {
    credentialsProvider: createAWSCredentialsAndIdentityIdProvider(authConfig, storage),
    tokenProvider: createUserPoolsTokenProvider(authConfig, storage),
  },
};

export const guestClient = generateClient<Schema>({ config, authMode: 'identityPool' });

export function runAsGuest<Result>(
  operation: (contextSpec: AmplifyServer.ContextSpec) => Result | Promise<Result>,
): Promise<Result> {
  return runWithAmplifyServerContext(config, libraryOptions, operation);
}
