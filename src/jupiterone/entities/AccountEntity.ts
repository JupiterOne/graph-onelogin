import { Entity } from '@jupiterone/integration-sdk-core';

export const ACCOUNT_ENTITY_TYPE = 'onelogin_account';
export const ACCOUNT_ENTITY_CLASS = ['Account'];

export interface AccountEntity extends Entity {
  name: string;
}
