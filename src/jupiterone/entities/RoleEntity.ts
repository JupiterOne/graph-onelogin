import { Entity } from '@jupiterone/integration-sdk-core';

export const ROLE_ENTITY_TYPE = 'onelogin_role';
export const ROLE_ENTITY_CLASS = ['AccessRole'];

export interface RoleEntity extends Entity {
  id: string;
  name: string;
}
