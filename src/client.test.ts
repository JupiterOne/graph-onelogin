import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import { createAPIClient } from './client';
import { IntegrationConfig } from './config';

test('should recieve apihostname from config', () => {
  const config: IntegrationConfig = {
    apiHostname: 'https://api.eu.onelogin.com',
    clientId: 'client-id',
    clientSecret: 'client-secret',
  };

  expect(
    createAPIClient(config, createMockIntegrationLogger()).provider.host,
  ).toBe('https://api.eu.onelogin.com');
});
