import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import {
  createMockExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig, validateInvocation } from './config';
import { integrationConfig } from '../test/config';
import { setupOneloginRecording } from '../test/recording';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('should fail with invalid config', async () => {
  const executionContext = createMockExecutionContext<IntegrationConfig>({
    instanceConfig: {} as IntegrationConfig,
  });

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    IntegrationValidationError,
  );
});

test('should succeed with valid credentials', async () => {
  recording = setupOneloginRecording({
    directory: __dirname,
    name: 'validateInvocation:success',
  });

  const executionContext = createMockExecutionContext({
    instanceConfig: integrationConfig,
  });

  await expect(validateInvocation(executionContext)).resolves.toBeUndefined();
});

test('should succeed when provided API hostname', async () => {
  recording = setupOneloginRecording({
    directory: __dirname,
    name: 'validateInvocation:success:providedApiHostname',
  });

  const executionContext = createMockExecutionContext({
    instanceConfig: {
      ...integrationConfig,
      apiHostname: 'https://api.us.onelogin.com',
    },
  });

  await expect(validateInvocation(executionContext)).resolves.toBeUndefined();
});

test('should fail if Client ID is invalid', async () => {
  recording = setupOneloginRecording({
    directory: __dirname,
    name: 'validateInvocation:invalidClientId',
    options: {
      recordFailedRequests: true,
    },
  });

  const executionContext = createMockExecutionContext({
    instanceConfig: {
      ...integrationConfig,
      clientId: 'INVALID',
    },
  });

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    `Provider authentication failed at https://api.us.onelogin.com/auth/oauth2/token: 401 Authentication Failure`,
  );
});

test('should fail if Client secret is invalid', async () => {
  recording = setupOneloginRecording({
    directory: __dirname,
    name: 'validateInvocation:invalidClientSecret',
    options: {
      recordFailedRequests: true,
    },
  });

  const executionContext = createMockExecutionContext({
    instanceConfig: {
      ...integrationConfig,
      clientId: 'INVALID',
    },
  });

  await expect(validateInvocation(executionContext)).rejects.toThrow(
    `Provider authentication failed at https://api.us.onelogin.com/auth/oauth2/token: 401 Authentication Failure`,
  );
});
