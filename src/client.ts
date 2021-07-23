import {
  IntegrationLogger,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import {
  OneLoginClient,
  User,
  Group,
  Role,
  App,
  PersonalApp,
  PersonalDevice,
} from './onelogin';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  provider: OneLoginClient;
  //retrieves a token automatically and applies it to subsequent requests
  constructor(readonly config: IntegrationConfig, logger: IntegrationLogger) {
    this.provider = new OneLoginClient(
      config.clientId,
      config.clientSecret,
      logger,
    );
  }

  public async verifyAuthentication(): Promise<void> {
    //lightweight authen check
    try {
      await this.provider.authenticate();
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: this.config.orgUrl,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  /**
   * Iterates each Onelogin Group resource.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateGroups(iteratee: ResourceIteratee<Group>): Promise<void> {
    await this.provider.authenticate();
    const groups = await this.provider.fetchGroups();
    for (const group of groups) {
      await iteratee(group);
    }
  }

  /**
   * Iterates each Onelogin Role resource.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateRoles(iteratee: ResourceIteratee<Role>): Promise<void> {
    await this.provider.authenticate();
    const roles = await this.provider.fetchRoles();
    for (const role of roles) {
      await iteratee(role);
    }
  }

  /**
   * Iterates each Onelogin User resource.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(iteratee: ResourceIteratee<User>): Promise<void> {
    await this.provider.authenticate();
    const users = await this.provider.fetchUsers();
    for (const user of users) {
      await iteratee(user);
    }
  }

  /**
   * Iterates each Onelogin Application resource.
   * These are the organization-wide apps (though not necessarily for every user).
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateApplications(
    iteratee: ResourceIteratee<App>,
  ): Promise<void> {
    await this.provider.authenticate();
    const applications = await this.provider.fetchApps();
    for (const application of applications) {
      await iteratee(application);
    }
  }

  /**
   * Iterates each Onelogin Application resource for a given user.
   * Despite the datatype here being called 'PersonalApp',
   * Onelogin considers a "personal app" to be one assigned by the user
   * just for themselves. It is not represented in the organization.
   *
   * As far as I can tell...
   * Such personal apps are not returned by this API. What is returned
   * are any organization-wide apps assigned to this user.
   * However, if truly personal apps are returned, the iteratee can handle it
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUserApps(
    userId: string,
    iteratee: ResourceIteratee<PersonalApp>,
  ): Promise<void> {
    await this.provider.authenticate();
    const applications = await this.provider.fetchUserApps(Number(userId));
    for (const application of applications) {
      await iteratee(application);
    }
  }

  /**
   * Iterates each Onelogin MFA Device resource for a given user.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUserDevices(
    userId: string,
    iteratee: ResourceIteratee<PersonalDevice>,
  ): Promise<void> {
    await this.provider.authenticate();
    const devices = await this.provider.fetchUserDevices(Number(userId));
    for (const device of devices) {
      await iteratee(device);
    }
  }
}

export function createAPIClient(
  config: IntegrationConfig,
  logger: IntegrationLogger,
): APIClient {
  return new APIClient(config, logger);
}
