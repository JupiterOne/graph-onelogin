import {
  createMockIntegrationLogger,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import { integrationConfig } from '../../test/config';
import { setupOneloginRecording } from '../../test/recording';
import OneLoginClient from './OneLoginClient';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('fetchUsers', () => {
  test('success', async () => {
    recording = setupOneloginRecording({
      directory: __dirname,
      name: 'fetchUsers',
      options: {
        matchRequestsBy: {
          body: false,
        },
      },
    });

    const client = new OneLoginClient(
      integrationConfig.clientId,
      integrationConfig.clientSecret,
      createMockIntegrationLogger(),
    );
    await client.authenticate();

    const users = await client.fetchUsers();
    expect(users.length).toBeGreaterThan(0);
  });
});
