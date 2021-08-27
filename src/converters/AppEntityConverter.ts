import { APP_ENTITY_CLASS, APP_ENTITY_TYPE, AppEntity } from '../jupiterone';

import { App } from '../onelogin/OneLoginClient';

import generateKey from '../utils/generateKey';
import { setRawData } from '@jupiterone/integration-sdk-core';

export function createAppEntity(app: App): AppEntity {
  const appEntity: AppEntity = {
    _class: APP_ENTITY_CLASS,
    _key: generateKey(APP_ENTITY_TYPE, app.id),
    _type: APP_ENTITY_TYPE,
    id: String(app.id),
    displayName: app.name,
    connectorId: app.connector_id,
    name: app.name,
    extension: app.extension,
    visible: app.visible,
    provisioning: app.provisioning,
  };
  setRawData(appEntity, { name: 'default', rawData: app });
  return appEntity;
}
