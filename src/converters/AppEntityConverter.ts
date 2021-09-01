import {
  APP_ENTITY_CLASS,
  APP_ENTITY_TYPE,
  APP_RULE_ENTITY_CLASS,
  APP_RULE_ENTITY_TYPE,
  AppEntity,
  AppRuleEntity,
} from '../jupiterone';

import { App, AppRule } from '../onelogin/OneLoginClient';

import generateKey from '../utils/generateKey';
import { setRawData } from '@jupiterone/integration-sdk-core';

export function createAppEntity(app: App): AppEntity {
  const ruleIds = app.rules?.map((r) => r.id).join();
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
    ruleIds: ruleIds, //for use later in mapping rules to users
  };
  setRawData(appEntity, { name: 'default', rawData: app });
  return appEntity;
}

export function createAppRuleEntity(rule: AppRule): AppRuleEntity {
  const ruleEntity: AppRuleEntity = {
    _class: APP_RULE_ENTITY_CLASS,
    _key: generateKey(APP_RULE_ENTITY_TYPE, rule.id),
    _type: APP_RULE_ENTITY_TYPE,
    id: String(rule.id),
    displayName: rule.name,
    name: rule.name,
    match: rule.match,
    enabled: rule.enabled,
    position: rule.position,
    conditions: JSON.stringify(rule.conditions),
    actions: JSON.stringify(rule.actions),
  };
  setRawData(ruleEntity, { name: 'default', rawData: rule });
  return ruleEntity;
}
