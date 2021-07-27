import { Entity } from '@jupiterone/integration-sdk-core';

export const PERSONAL_DEVICE_ENTITY_TYPE = 'mfa_device';
export const PERSONAL_DEVICE_ENTITY_CLASS = ['Key', 'AccessKey'];

export interface PersonalDeviceEntity extends Entity {
  id: string;
  needsTrigger: boolean;
  default: boolean;
  active: boolean;
  authFactorName: string;
  typeDisplayName: string;
  userDisplayName: string;
}
