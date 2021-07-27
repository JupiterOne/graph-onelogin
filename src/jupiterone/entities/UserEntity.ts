import { Entity } from '@jupiterone/integration-sdk-core';

export const USER_ENTITY_TYPE = 'onelogin_user';
export const USER_ENTITY_CLASS = ['User'];

export interface UserEntity extends Entity {
  id: string;
  displayName: string;
  activatedAt: number | null;
  createdAt: number;
  email: string;
  username: string | null;
  firstname: string;
  groupId: number;
  invalidLoginAttempts: number | null;
  invitationSentAt: number | null;
  lastLogin: number | null;
  lastname: string;
  lockedUntil: string | null;
  comment: string | null;
  openidName: string;
  localeCode: string | null;
  preferredLocaleCode: string | null;
  passwordChangedAt: number | null;
  phone: string | null;
  status: number;
  updatedAt: number;
  distinguishedName: string | null;
  externalId: number | null;
  directoryId: number | null;
  memberOf: string | null;
  samaccountname: string | null;
  userprincipalname: string | null;
  managerAdId: number | null;
  managerUserId: number | null;
  company: string | null;
  department: string | null;
  title: string | null;
  state: number;
  trustedIdpId: number | null;
}
