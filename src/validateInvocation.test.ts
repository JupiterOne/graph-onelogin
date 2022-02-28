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
