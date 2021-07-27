import { Entity } from '@jupiterone/integration-sdk-core';

export const SERVICE_ENTITY_CLASS = ['Service', 'Control'];
export const SERVICE_ENTITY_TYPE = 'onelogin_service';

export interface ServiceEntity extends Entity {
  name: string;
  category: string;
  function: string;
  controlDomain: string;
}
