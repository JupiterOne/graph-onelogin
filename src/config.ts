import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationInstanceConfigFieldMap,
  IntegrationInstanceConfig,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from './client';

/**
 * A type describing the configuration fields required to execute the
 * integration for a specific account in the data provider.
 *
 * When executing the integration in a development environment, these values may
 * be provided in a `.env` file with environment variables. For example:
 *
 * - `CLIENT_ID=123` becomes `instance.config.clientId = '123'`
 * - `CLIENT_SECRET=abc` becomes `instance.config.clientSecret = 'abc'`
 *
 * Environment variables are NOT used when the integration is executing in a
 * managed environment. For example, in JupiterOne, users configure
 * `instance.config` in a UI.
 */
export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  clientId: {
    type: 'string',
  },
  clientSecret: {
    type: 'string',
    mask: true,
  },
};

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The Onelogin client ID used to authenticate requests.
   */
  clientId: string;

  /**
   * The Onelogin client secret used to authenticate requests.
   */
  clientSecret: string;

  /**
   * The Onelogin organization URL. Only used to create a weblink to the account.
   */
  orgUrl?: string | null;

  /**
   * The Onelogin API hostname. https://developers.onelogin.com/api-docs/2/getting-started/dev-overview
   *
   * Options:
   *   - https://api.us.onelogin.com
   *   - https://api.eu.onelogin.com
   *
   * Defaults to https://api.us.onelogin.com.
   */
  apiHostname?: string | null;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (!config.clientId || !config.clientSecret) {
    throw new IntegrationValidationError(
      'Config requires all of {clientId, clientSecret}',
    );
  }

  //check for orgUrl
  if (!config.orgUrl) {
    config.orgUrl = 'https://example.onelogin.com';
  }
  const splitter = config.orgUrl.split('.');
  if (!(splitter[1] === 'onelogin')) {
    throw new IntegrationValidationError(
      'Problem with config {orgUrl}. Should be {YOURDOMAIN}.onelogin.com',
    );
  }

  const apiClient = createAPIClient(config, context.logger);
  await apiClient.verifyAuthentication();
}
