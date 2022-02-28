import {
  IntegrationLogger,
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import fetch, { RequestInit } from 'node-fetch';
import { retry, AttemptContext } from '@lifeomic/attempt';

interface OneloginV1Response {
  status: {
    error: boolean;
    code: number;
    type: string;
    message: string;
  };

  pagination: {
    before_cursor: string | null;
    after_cursor: string | null;
    previous_link: string | null;
    next_link: string | null;
  };
}

interface AccessToken {
  access_token: string;
  created_at: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  account_id: number;
}

export interface Account {
  id: string;
  name: string;
  orgUrl: string | undefined | null;
}

export interface User {
  activated_at: string | null;
  created_at: string;
  email: string;
  username: string | null;
  firstname: string;
  group_id: number; //users can only be in one OneLogin group
  id: number;
  invalid_login_attempts: number | null;
  invitation_sent_at: string | null;
  last_login: string | null;
  lastname: string;
  locked_until: string | null;
  comment: string | null;
  openid_name: string;
  locale_code: string | null;
  preferred_locale_code: string | null;
  password_changed_at: string | null;
  phone: string | null;
  status: number;
  updated_at: string;
  distinguished_name: string | null;
  external_id: number | null;
  directory_id: number | null;
  member_of: string | null; //refers to membership in an Active Directory security group
  samaccountname: string | null;
  userprincipalname: string | null;
  manager_ad_id: number | null;
  manager_user_id: number | null;
  role_id: string[]; //users can have multiple OneLogin roles
  company: string | null;
  department: string | null;
  title: string | null;
  state: number;
  trusted_idp_id: number | null;
  custom_attributes?: {
    [k: string]: string | null;
  };
}

export interface Group {
  id: number;
  name: string;
  reference: string | null;
}

export interface Role {
  id: number;
  name: string;
}

export interface App {
  id: number;
  icon: string;
  connector_id: number;
  name: string;
  extension: boolean;
  visible: boolean;
  provisioning: boolean;
  rules?: AppRule[];
}

export interface AppRule {
  id: string;
  name: string;
  match: string; // "any" or "all" - whether all conditions or any conditions must apply
  enabled: boolean;
  position: number;
  conditions: AppRuleCondition[];
  actions: AppRuleAction[];
}

export interface AppRuleCondition {
  source?: string;
  operator?: string;
  value?: string;
}

export interface AppRuleAction {
  action?: string;
  value?: string[] | string;
}

export interface PersonalApp {
  id: number;
  name: string;
  icon: string;
  provisioned: string;
  extension: boolean;
  login_id: number;
  personal: boolean;
}

export interface PersonalDevice {
  id: number;
  needs_trigger: boolean;
  default: boolean;
  active: boolean;
  auth_factor_name: string;
  type_display_name: string;
  user_display_name: string;
}

interface AccessTokenResponse extends OneloginV1Response {
  data: AccessToken[];
}

interface AccessTokenResponseV2 extends OneloginV1Response {
  access_token: string;
  created_at: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  account_id: number;
}

interface UserResponse extends OneloginV1Response {
  data: User[];
}

interface GroupResponse extends OneloginV1Response {
  data: Group[];
}

interface RoleResponse extends OneloginV1Response {
  data: Role[];
}

interface AppResponse extends OneloginV1Response {
  data: App[];
}

interface PersonalAppResponse extends OneloginV1Response {
  data: PersonalApp[];
}

interface PersonalDeviceResponse extends OneloginV1Response {
  data: {
    otp_devices: PersonalDevice[];
  };
}

enum Method {
  GET = 'get',
  POST = 'post',
}

export default class OneLoginClient {
  readonly host: string;
  private accessToken: string;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private readonly logger: IntegrationLogger,
    host?: string | null,
  ) {
    this.host = host || 'https://api.us.onelogin.com';
  }

  public async authenticate() {
    const result = (await this.makeRequest(
      '/auth/oauth2/v2/token',
      Method.POST,
      { grant_type: 'client_credentials' },
      {
        Authorization: `client_id:${this.clientId}, client_secret:${this.clientSecret}`,
      },
    )) as AccessTokenResponseV2;

    if (result.access_token) {
      this.accessToken = result.access_token;
      return;
    }

    throw new IntegrationProviderAuthenticationError({
      endpoint: this.host + '/auth/oauth2/token',
      status: result.status.code.toString(),
      statusText: result.status.message,
    });
  }

  public async fetchUsers(): Promise<User[]> {
    let users: User[] = [];
    let afterCursor: string | null = '';

    do {
      const result = (await this.makeRequest(
        `/api/1/users?after_cursor=${afterCursor}`,
        Method.GET,
        {},
      )) as UserResponse;
      if (result.data) {
        users = [...users, ...result.data];
        afterCursor = result.pagination.after_cursor;
        this.logger.info(
          {
            pageSize: result.data.length,
            afterCursor: result.pagination.after_cursor,
          },
          'Fetched page of OneLogin users',
        );
      }
    } while (afterCursor);

    return users;
  }

  public async fetchGroups(): Promise<Group[]> {
    let groups: Group[] = [];
    let afterCursor: string | null = '';

    do {
      const result = (await this.makeRequest(
        `/api/1/groups?after_cursor=${afterCursor}`,
        Method.GET,
        {},
      )) as GroupResponse;

      if (result.data) {
        groups = [...groups, ...result.data];
        afterCursor = result.pagination.after_cursor;
        this.logger.info(
          {
            pageSize: result.data.length,
            afterCursor: result.pagination.after_cursor,
          },
          'Fetched page of OneLogin groups',
        );
      }
    } while (afterCursor);

    return groups;
  }

  public async fetchRoles(): Promise<Role[]> {
    let roles: Role[] = [];
    let afterCursor: string | null = '';

    do {
      const result = (await this.makeRequest(
        `/api/1/roles?after_cursor=${afterCursor}`,
        Method.GET,
        {},
      )) as RoleResponse;

      if (result.data) {
        roles = [...roles, ...result.data];
        afterCursor = result.pagination.after_cursor;
        this.logger.info(
          {
            pageSize: result.data.length,
            afterCursor: result.pagination.after_cursor,
          },
          'Fetched page of OneLogin roles',
        );
      }
    } while (afterCursor);

    return roles;
  }

  public async fetchApps(): Promise<App[]> {
    let apps: App[] = [];
    let afterCursor: string | null = '';

    do {
      const result = (await this.makeRequest(
        `/api/1/apps?after_cursor=${afterCursor}`,
        Method.GET,
        {},
      )) as AppResponse;

      if (result.data) {
        apps = [...apps, ...result.data];
        afterCursor = result.pagination.after_cursor;
        this.logger.info(
          {
            pageSize: result.data.length,
            afterCursor: result.pagination.after_cursor,
          },
          'Fetched page of OneLogin apps',
        );
      }
    } while (afterCursor);

    return apps;
  }

  public async fetchAppRules(appId): Promise<AppRule[]> {
    const rules = (await this.makeRequest(
      `/api/2/apps/${appId}/rules`,
      Method.GET,
      {},
    )) as AppRule[];
    return rules;
  }

  public async fetchUserApps(userId: number): Promise<PersonalApp[]> {
    const result = (await this.makeRequest(
      `/api/1/users/${userId}/apps`,
      Method.GET,
      {},
    )) as PersonalAppResponse;

    let apps: PersonalApp[] = [];
    if (result.data) {
      apps = result.data;
      this.logger.info(
        {
          size: result.data.length,
          userId,
        },
        'Fetched OneLogin apps for user',
      );
    }

    return apps;
  }

  public async fetchUserDevices(userId: number): Promise<PersonalDevice[]> {
    const result = (await this.makeRequest(
      `/api/1/users/${userId}/otp_devices`,
      Method.GET,
      {},
    )) as PersonalDeviceResponse;

    const devices: PersonalDevice[] = result.data.otp_devices;

    this.logger.info(
      {
        size: result.data.otp_devices,
        userId,
      },
      'Fetched OneLogin devices for user',
    );

    return devices;
  }

  private async makeRequest(
    url: string,
    method: Method,
    params: {},
    headers?: {},
  ): Promise<
    | AccessTokenResponse
    | AccessTokenResponseV2
    | GroupResponse
    | UserResponse
    | RoleResponse
    | PersonalDeviceResponse
    | AppRule[]
  > {
    let options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (method === Method.POST) {
      options = { ...options, body: JSON.stringify(params) };
    }

    const logger = this.logger;
    const fullUrl = this.host + url;

    //everything in fetchWithErrorAwareness is going into the retry function below
    const fetchWithErrorAwareness = async () => {
      if (options.headers && !options.headers[`Authorization`]) {
        // If no Auth header is present, set the current accessToken
        options.headers[`Authorization`] = `bearer ${this.accessToken}`;
      }

      let response;
      //check for fundamental errors (network not available, DNS fail, etc)
      try {
        response = await fetch(fullUrl, options);
      } catch (err) {
        const status = err.status.code || 'unknown';
        const statusText = err.statusText || 'No status text received';
        throw new IntegrationProviderAPIError({
          message: `Error during fetch from ${fullUrl}`,
          status: status,
          statusText: statusText,
          cause: err,
          endpoint: fullUrl,
        });
      }

      // fetch doesn't error on 4xx/5xx HTTP codes, so you have to do that yourself
      const result = await response.json();
      if (result.status?.code && !(result.status.code === 200)) {
        throw new IntegrationProviderAPIError({
          cause: result,
          endpoint: this.host + url,
          status: result.status.code,
          statusText: result.status.message,
        });
      }
      return result;
    };

    const retryOptions = {
      delay: 1000,
      maxAttempts: 10,
      initialDelay: 0,
      minDelay: 0,
      maxDelay: 0,
      factor: 2,
      timeout: 0,
      jitter: false,
      handleError: null,
      handleTimeout: null,
      beforeAttempt: null,
      calculateDelay: null,
      clientInstance: this,
    }; // 10 attempts with 1000 ms start and factor 2 means longest wait is 20 minutes

    return await retry(fetchWithErrorAwareness, {
      ...retryOptions,
      async handleError(error: any, attemptContext: AttemptContext) {
        //retry will keep trying to the limits of retryOptions
        //but it lets you intervene in this function - if you throw an error from in here,
        //it stops retrying. Otherwise you can just log the attempts.
        if (error.retryable === false || error.status === 404) {
          attemptContext.abort();
        }

        //unknown whether OneLogin uses this code, but just in case
        if (error.status === 429) {
          logger.warn(
            `Status 429 (rate limiting) encountered. Engaging backoff function.`,
          );
        }

        if (error.status === 401) {
          logger.info(
            `Attempting to reauthenticate after 401 error possibly due to expired token.`,
          );
          if (attemptContext.attemptNum > 2) {
            attemptContext.abort();
          }
          await retryOptions.clientInstance.authenticate();
        }

        //test for 5xx HTTP codes
        if (Math.floor(error.status / 100) === 5) {
          logger.warn(
            `Status 5xx (server errors) encountered. Engaging backoff function.`,
          );
        }
        logger.info(`Retrying on ${error.endpoint}`);
      },
    });
  }
}
