import {
  PERSONAL_APP_ENTITY_CLASS,
  PERSONAL_APP_ENTITY_TYPE,
  PersonalAppEntity,
} from '../jupiterone';

import { PersonalApp } from '../onelogin/OneLoginClient';

import generateKey from '../utils/generateKey';

export function createPersonalAppEntity(app: PersonalApp): PersonalAppEntity {
  return {
    _class: PERSONAL_APP_ENTITY_CLASS,
    _key: generateKey(PERSONAL_APP_ENTITY_TYPE, app.id),
    _type: PERSONAL_APP_ENTITY_TYPE,
    _icon: app.icon,
    id: String(app.id),
    displayName: app.name,
    icon: app.icon,
    name: app.name,
    provisioned: app.provisioned,
    extension: app.extension,
    loginId: app.login_id,
    personal: app.personal,
  };
}
