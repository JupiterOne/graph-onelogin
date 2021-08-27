import {
  PERSONAL_DEVICE_ENTITY_CLASS,
  PERSONAL_DEVICE_ENTITY_TYPE,
  PersonalDeviceEntity,
} from '../jupiterone';
import { PersonalDevice } from '../onelogin/OneLoginClient';

import generateKey from '../utils/generateKey';
import { setRawData } from '@jupiterone/integration-sdk-core';

export function createPersonalDeviceEntity(
  device: PersonalDevice,
): PersonalDeviceEntity {
  const personalDeviceEntity: PersonalDeviceEntity = {
    _class: PERSONAL_DEVICE_ENTITY_CLASS,
    _key: generateKey(PERSONAL_DEVICE_ENTITY_TYPE, device.id),
    _type: PERSONAL_DEVICE_ENTITY_TYPE,
    displayName: device.type_display_name,
    id: String(device.id),
    default: device.default,
    active: device.active,
    authFactorName: device.auth_factor_name,
    typeDisplayName: device.type_display_name,
    userDisplayName: device.user_display_name,
    needsTrigger: device.needs_trigger,
  };
  setRawData(personalDeviceEntity, { name: 'default', rawData: device });
  return personalDeviceEntity;
}
