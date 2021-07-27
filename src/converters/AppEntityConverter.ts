import { APP_ENTITY_CLASS, APP_ENTITY_TYPE, AppEntity } from '../jupiterone';

import { App } from '../onelogin/OneLoginClient';

import generateKey from '../utils/generateKey';

export function createAppEntity(app: App): AppEntity {
  return {
    _class: APP_ENTITY_CLASS,
    _key: generateKey(APP_ENTITY_TYPE, app.id),
    _type: APP_ENTITY_TYPE,
    _icon: app.icon,
    id: String(app.id),
    displayName: app.name,
    connectorId: app.connector_id,
    name: app.name,
    extension: app.extension,
    visible: app.visible,
    provisioning: app.provisioning,
  };
}
