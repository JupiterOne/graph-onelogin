import { Entity } from '@jupiterone/integration-sdk-core';

export const PERSONAL_APP_ENTITY_TYPE = 'onelogin_personal_application';
export const PERSONAL_APP_ENTITY_CLASS = ['Application'];

export interface PersonalAppEntity extends Entity {
  id: string;
  name: string;
  provisioned: string;
  extension: boolean;
  loginId: number;
  personal: boolean;
}
