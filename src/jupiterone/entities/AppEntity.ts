import { Entity } from '@jupiterone/integration-sdk-core';

export const APP_ENTITY_TYPE = 'onelogin_application';
export const APP_ENTITY_CLASS = ['Application'];

export interface AppEntity extends Entity {
  id: string;
  connectorId: number;
  name: string;
  extension: boolean;
  visible: boolean;
  provisioning: boolean;
}
