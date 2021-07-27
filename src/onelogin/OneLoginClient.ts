import { IntegrationLogger } from '@jupiterone/integration-sdk-core';
import fetch, { RequestInit } from 'node-fetch';

interface OneloginResponse {
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
  orgUrl: string | undefined;
}

export interface User {
  activated_at: string | null;
  created_at: string;
  email: string;
  username: string | null;
  firstname: string;
  group_id: number;
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
  member_of: string | null;
  samaccountname: string | null;
  userprincipalname: string | null;
  manager_ad_id: number | null;
  manager_user_id: number | null;
  role_id: number[];
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

interface AccessTokenResponse extends OneloginResponse {
  data: AccessToken[];
}

interface UserResponse extends OneloginResponse {
  data: User[];
}

interface GroupResponse extends OneloginResponse {
  data: Group[];
}

interface RoleResponse extends OneloginResponse {
  data: Role[];
}

interface AppResponse extends OneloginResponse {
  data: App[];
}

interface PersonalAppResponse extends OneloginResponse {
  data: PersonalApp[];
}

interface PersonalDeviceResponse extends OneloginResponse {
  data: {
    otp_devices: PersonalDevice[];
  };
}

enum Method {
  GET = 'get',
  POST = 'post',
}

export default class OneLoginClient {
  private host: string = 'https://api.us.onelogin.com';
  private accessToken: string;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private readonly logger: IntegrationLogger,
  ) {}

  public async authenticate() {
    const result = (await this.makeRequest(
      '/auth/oauth2/token',
      Method.POST,
      { grant_type: 'client_credentials' },
      {
        Authorization: `client_id:${this.clientId}, client_secret:${this.clientSecret}`,
      },
    )) as AccessTokenResponse;

    if (result.data) {
      const data = result.data.pop();

      if (data) {
        this.accessToken = data.access_token;
        return;
      }
    }

    throw new Error(result.status.message);
  }

  public async fetchUsers(): Promise<User[]> {
    let users: User[] = [];
    let afterCursor: string | null = '';

    do {
      const result = (await this.makeRequest(
        `/api/1/users?after_cursor=${afterCursor}`,
        Method.GET,
        {},
        { Authorization: `bearer:${this.accessToken}` },
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
        { Authorization: `bearer:${this.accessToken}` },
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
        { Authorization: `bearer:${this.accessToken}` },
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
        { Authorization: `bearer:${this.accessToken}` },
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

  public async fetchUserApps(userId: number): Promise<PersonalApp[]> {
    const result = (await this.makeRequest(
      `/api/1/users/${userId}/apps`,
      Method.GET,
      {},
      { Authorization: `bearer:${this.accessToken}` },
    )) as PersonalAppResponse;

    const apps: PersonalApp[] = result.data;

    this.logger.info(
      {
        size: result.data.length,
        userId,
      },
      'Fetched OneLogin apps for user',
    );

    return apps;
  }

  public async fetchUserDevices(userId: number): Promise<PersonalDevice[]> {
    const result = (await this.makeRequest(
      `/api/1/users/${userId}/otp_devices`,
      Method.GET,
      {},
      { Authorization: `bearer:${this.accessToken}` },
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
    headers: {},
  ): Promise<
    | AccessTokenResponse
    | GroupResponse
    | UserResponse
    | RoleResponse
    | PersonalDeviceResponse
  > {
    let options: RequestInit = {
      method,
      headers: {
        'Content-type': 'application/json',
        ...headers,
      },
    };

    if (method === Method.POST) {
      options = { ...options, body: JSON.stringify(params) };
    }

    const response = await fetch(this.host + url, options);

    return response.json();
  }
}
