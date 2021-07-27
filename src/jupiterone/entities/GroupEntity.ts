import { Entity } from '@jupiterone/integration-sdk-core';

export const GROUP_ENTITY_TYPE = 'onelogin_group';
export const GROUP_ENTITY_CLASS = ['UserGroup'];

export interface GroupEntity extends Entity {
  id: string;
  name: string;
  reference: string | null;
}
